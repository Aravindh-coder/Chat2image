import initSqlJs, { Database, SqlValue } from 'sql.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface DbConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  generation_count?: number;
}

export interface DbMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  image_url: string | null;
  created_at: string;
  generation_id?: string | null;
  original_prompt?: string | null;
  enhanced_prompt?: string | null;
  style?: string | null;
  aspect_ratio?: string | null;
}

export interface DbGeneration {
  id: string;
  conversation_id: string | null;
  prompt: string;
  enhanced_prompt: string | null;
  image_url: string;
  style: string;
  aspect_ratio: string;
  provider: string;
  is_demo: number;
  created_at: string;
}

class DatabaseManager {
  private db: Database | null = null;
  private dbPath: string;
  private isInitialized = false;

  constructor() {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dbPath = process.env.DATABASE_PATH || path.join(dataDir, 'chat2image.sqlite');
  }

  public async init(): Promise<void> {
    if (this.isInitialized && this.db) return;

    const SQL = await initSqlJs();

    if (fs.existsSync(this.dbPath)) {
      try {
        const fileBuffer = fs.readFileSync(this.dbPath);
        this.db = new SQL.Database(fileBuffer);
      } catch (err) {
        console.warn('Failed to load existing database file, creating fresh database:', err);
        this.db = new SQL.Database();
      }
    } else {
      this.db = new SQL.Database();
    }

    this.runMigrations();
    this.save();
    this.isInitialized = true;
    console.log(`[Database] SQLite database initialized at ${this.dbPath}`);
  }

  private runMigrations(): void {
    if (!this.db) return;

    this.db.run(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        created_at TEXT NOT NULL,
        generation_id TEXT,
        original_prompt TEXT,
        enhanced_prompt TEXT,
        style TEXT,
        aspect_ratio TEXT,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS generations (
        id TEXT PRIMARY KEY,
        conversation_id TEXT,
        prompt TEXT NOT NULL,
        enhanced_prompt TEXT,
        image_url TEXT NOT NULL,
        style TEXT NOT NULL,
        aspect_ratio TEXT NOT NULL,
        provider TEXT DEFAULT 'pollinations',
        is_demo INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_generations_conv ON generations(conversation_id);
    `);
  }

  private save(): void {
    if (!this.db) return;
    try {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(this.dbPath, buffer);
    } catch (err) {
      console.error('[Database] Failed to save SQLite file:', err);
    }
  }

  // --- Conversations ---
  public getConversations(): DbConversation[] {
    if (!this.db) return [];
    const query = `
      SELECT c.*, 
        (SELECT COUNT(*) FROM generations g WHERE g.conversation_id = c.id) as generation_count
      FROM conversations c
      ORDER BY c.updated_at DESC
    `;
    const stmt = this.db.prepare(query);
    const rows: DbConversation[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject() as unknown as DbConversation;
      rows.push(row);
    }
    stmt.free();
    return rows;
  }

  public getConversation(id: string): { conversation: DbConversation | null; messages: DbMessage[] } {
    if (!this.db) return { conversation: null, messages: [] };

    const convStmt = this.db.prepare(`SELECT * FROM conversations WHERE id = :id`);
    convStmt.bind({ ':id': id });
    let conversation: DbConversation | null = null;
    if (convStmt.step()) {
      conversation = convStmt.getAsObject() as unknown as DbConversation;
    }
    convStmt.free();

    if (!conversation) return { conversation: null, messages: [] };

    const msgStmt = this.db.prepare(`SELECT * FROM messages WHERE conversation_id = :id ORDER BY created_at ASC`);
    msgStmt.bind({ ':id': id });
    const messages: DbMessage[] = [];
    while (msgStmt.step()) {
      messages.push(msgStmt.getAsObject() as unknown as DbMessage);
    }
    msgStmt.free();

    return { conversation, messages };
  }

  public createConversation(title: string, customId?: string): DbConversation {
    if (!this.db) throw new Error('Database not initialized');
    const id = customId || crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO conversations (id, title, created_at, updated_at)
      VALUES (:id, :title, :created_at, :updated_at)
    `);
    stmt.run({
      ':id': id,
      ':title': title,
      ':created_at': now,
      ':updated_at': now,
    });
    stmt.free();
    this.save();

    return { id, title, created_at: now, updated_at: now, generation_count: 0 };
  }

  public updateConversation(id: string, title: string): boolean {
    if (!this.db) return false;
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      UPDATE conversations 
      SET title = :title, updated_at = :updated_at
      WHERE id = :id
    `);
    stmt.run({
      ':id': id,
      ':title': title,
      ':updated_at': now,
    });
    stmt.free();
    this.save();
    return true;
  }

  public touchConversation(id: string): void {
    if (!this.db) return;
    const now = new Date().toISOString();
    this.db.run(`UPDATE conversations SET updated_at = '${now}' WHERE id = '${id}'`);
    this.save();
  }

  public deleteConversation(id: string): boolean {
    if (!this.db) return false;
    this.db.run(`DELETE FROM messages WHERE conversation_id = '${id}'`);
    this.db.run(`DELETE FROM generations WHERE conversation_id = '${id}'`);
    this.db.run(`DELETE FROM conversations WHERE id = '${id}'`);
    this.save();
    return true;
  }

  // --- Messages ---
  public addMessage(msg: Omit<DbMessage, 'id' | 'created_at'> & { id?: string; created_at?: string }): DbMessage {
    if (!this.db) throw new Error('Database not initialized');
    const id = msg.id || crypto.randomUUID();
    const now = msg.created_at || new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO messages (
        id, conversation_id, role, content, image_url, created_at,
        generation_id, original_prompt, enhanced_prompt, style, aspect_ratio
      )
      VALUES (
        :id, :conversation_id, :role, :content, :image_url, :created_at,
        :generation_id, :original_prompt, :enhanced_prompt, :style, :aspect_ratio
      )
    `);

    stmt.run({
      ':id': id,
      ':conversation_id': msg.conversation_id,
      ':role': msg.role,
      ':content': msg.content,
      ':image_url': msg.image_url || null,
      ':created_at': now,
      ':generation_id': msg.generation_id || null,
      ':original_prompt': msg.original_prompt || null,
      ':enhanced_prompt': msg.enhanced_prompt || null,
      ':style': msg.style || null,
      ':aspect_ratio': msg.aspect_ratio || null,
    });
    stmt.free();

    this.touchConversation(msg.conversation_id);
    this.save();

    return {
      id,
      conversation_id: msg.conversation_id,
      role: msg.role,
      content: msg.content,
      image_url: msg.image_url || null,
      created_at: now,
      generation_id: msg.generation_id,
      original_prompt: msg.original_prompt,
      enhanced_prompt: msg.enhanced_prompt,
      style: msg.style,
      aspect_ratio: msg.aspect_ratio,
    };
  }

  // --- Generations & Gallery ---
  public addGeneration(gen: Omit<DbGeneration, 'id' | 'created_at'> & { id?: string; created_at?: string }): DbGeneration {
    if (!this.db) throw new Error('Database not initialized');
    const id = gen.id || crypto.randomUUID();
    const now = gen.created_at || new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO generations (
        id, conversation_id, prompt, enhanced_prompt, image_url,
        style, aspect_ratio, provider, is_demo, created_at
      )
      VALUES (
        :id, :conversation_id, :prompt, :enhanced_prompt, :image_url,
        :style, :aspect_ratio, :provider, :is_demo, :created_at
      )
    `);

    stmt.run({
      ':id': id,
      ':conversation_id': gen.conversation_id || null,
      ':prompt': gen.prompt,
      ':enhanced_prompt': gen.enhanced_prompt || null,
      ':image_url': gen.image_url,
      ':style': gen.style,
      ':aspect_ratio': gen.aspect_ratio,
      ':provider': gen.provider || 'pollinations',
      ':is_demo': gen.is_demo ? 1 : 0,
      ':created_at': now,
    });
    stmt.free();

    if (gen.conversation_id) {
      this.touchConversation(gen.conversation_id);
    }
    this.save();

    return {
      id,
      conversation_id: gen.conversation_id || null,
      prompt: gen.prompt,
      enhanced_prompt: gen.enhanced_prompt || null,
      image_url: gen.image_url,
      style: gen.style,
      aspect_ratio: gen.aspect_ratio,
      provider: gen.provider,
      is_demo: gen.is_demo ? 1 : 0,
      created_at: now,
    };
  }

  public getGallery(filters?: { style?: string; search?: string; limit?: number; offset?: number }): DbGeneration[] {
    if (!this.db) return [];
    let query = `SELECT * FROM generations WHERE 1=1`;
    const params: Record<string, SqlValue> = {};

    if (filters?.style && filters.style.toLowerCase() !== 'all') {
      query += ` AND LOWER(style) = :style`;
      params[':style'] = filters.style.toLowerCase();
    }

    if (filters?.search && filters.search.trim() !== '') {
      query += ` AND (LOWER(prompt) LIKE :search OR LOWER(COALESCE(enhanced_prompt, '')) LIKE :search)`;
      params[':search'] = `%${filters.search.trim().toLowerCase()}%`;
    }

    query += ` ORDER BY created_at DESC`;

    if (filters?.limit) {
      query += ` LIMIT :limit`;
      params[':limit'] = filters.limit;
      if (filters?.offset) {
        query += ` OFFSET :offset`;
        params[':offset'] = filters.offset;
      }
    }

    const stmt = this.db.prepare(query);
    stmt.bind(params);
    const rows: DbGeneration[] = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject() as unknown as DbGeneration);
    }
    stmt.free();
    return rows;
  }

  public deleteGeneration(id: string): boolean {
    if (!this.db) return false;
    this.db.run(`DELETE FROM generations WHERE id = '${id}'`);
    this.save();
    return true;
  }
}

export const database = new DatabaseManager();
