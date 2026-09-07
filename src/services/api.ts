import { ChatMessage, DbConversation, Generation, SystemHealth, ImageStyle, AspectRatio } from '../types/index.js';

export interface SendMessageParams {
  conversationId?: string | null;
  message: string;
  style?: ImageStyle;
  aspectRatio?: AspectRatio;
  enhancePrompt?: boolean;
  provider?: string;
  referenceImage?: string | null;
}

export interface SendMessageResponse {
  conversationId: string;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  generation: Generation;
  isDemo: boolean;
  note?: string;
}

export const api = {
  async getHealth(): Promise<SystemHealth> {
    const res = await fetch('/api/health');
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch health');
    return data.data;
  },

  async sendMessage(params: SendMessageParams): Promise<SendMessageResponse> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to send message');
    return data.data;
  },

  async generateImage(params: {
    prompt: string;
    style?: ImageStyle;
    aspectRatio?: AspectRatio;
    enhancePrompt?: boolean;
    provider?: string;
    conversationId?: string;
  }): Promise<{ generation: Generation; isDemo: boolean; note?: string }> {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Generation failed');
    return data.data;
  },

  async editImage(params: {
    image: string;
    prompt: string;
    style?: ImageStyle;
    aspectRatio?: AspectRatio;
    provider?: string;
    conversationId?: string;
  }): Promise<{ generation: Generation; isDemo: boolean; note?: string }> {
    const res = await fetch('/api/edit-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Image edit failed');
    return data.data;
  },

  async uploadImage(file: File): Promise<{ imageUrl: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Upload failed');
    return data.data;
  },

  async getConversations(): Promise<DbConversation[]> {
    const res = await fetch('/api/conversations');
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch conversations');
    return data.data;
  },

  async getConversation(id: string): Promise<{ conversation: DbConversation; messages: ChatMessage[] }> {
    const res = await fetch(`/api/conversations/${id}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to load conversation');
    return data.data;
  },

  async createConversation(title?: string): Promise<DbConversation> {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to create conversation');
    return data.data;
  },

  async renameConversation(id: string, title: string): Promise<void> {
    const res = await fetch(`/api/conversations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to rename conversation');
  },

  async deleteConversation(id: string): Promise<void> {
    const res = await fetch(`/api/conversations/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to delete conversation');
  },

  async getGallery(filters?: { style?: string; search?: string }): Promise<Generation[]> {
    const params = new URLSearchParams();
    if (filters?.style && filters.style !== 'All') params.append('style', filters.style);
    if (filters?.search) params.append('search', filters.search);

    const res = await fetch(`/api/gallery?${params.toString()}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch gallery');
    return data.data;
  },

  async deleteGalleryItem(id: string): Promise<void> {
    const res = await fetch(`/api/gallery/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to delete gallery item');
  },
};
