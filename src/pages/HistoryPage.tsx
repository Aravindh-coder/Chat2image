import React, { useState, useEffect } from 'react';
import {
  History,
  MessageSquare,
  Edit2,
  Trash2,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
} from 'lucide-react';
import { api } from '../services/api.js';
import { DbConversation } from '../types/index.js';

interface HistoryPageProps {
  onOpenConversation: (id: string) => void;
  onNewChat: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onOpenConversation,
  onNewChat,
}) => {
  const [conversations, setConversations] = useState<DbConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await api.getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this entire conversation and its images?')) return;
    try {
      await api.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert('Failed to delete conversation.');
    }
  };

  const handleStartRename = (conv: DbConversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    try {
      await api.renameConversation(id, editTitle.trim());
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: editTitle.trim() } : c))
      );
      setEditingId(null);
    } catch (err) {
      alert('Failed to rename conversation');
    }
  };

  return (
    <div id="history-page" className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <History className="w-7 h-7 text-indigo-400" />
            Conversation History
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Resume previous sessions and continue refining your creations
          </p>
        </div>

        <button
          type="button"
          onClick={onNewChat}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Start New Chat</span>
        </button>
      </div>

      {/* Conversations List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/5 border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#0D0D14] rounded-3xl border border-dashed border-white/10">
          <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No history yet</h3>
          <p className="text-sm text-slate-400 mt-1">
            Start an image conversation and your creations will appear here automatically.
          </p>
          <button
            type="button"
            onClick={onNewChat}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create First Image</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => {
            const isEditing = editingId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => onOpenConversation(conv.id)}
                className="p-4 sm:p-5 rounded-2xl bg-[#0D0D14] border border-white/10 hover:border-indigo-500/50 hover:bg-white/5 shadow-lg transition-all cursor-pointer group flex items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-indigo-400 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <form
                        onSubmit={(e) => handleSaveRename(conv.id, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="px-3 py-1 text-sm rounded-lg border border-indigo-500/60 bg-[#161621] text-slate-100 focus:outline-hidden"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="px-3 py-1 text-xs rounded-lg bg-indigo-600 text-white font-bold cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 text-xs rounded-lg bg-white/10 text-slate-300 hover:bg-white/20 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <h3 className="font-bold text-white truncate group-hover:text-indigo-400 transition-colors text-base">
                        {conv.title}
                      </h3>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(conv.updated_at).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>
                        {conv.generation_count || 0}{' '}
                        {conv.generation_count === 1 ? 'image' : 'images'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleStartRename(conv, e)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Rename"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(conv.id, e)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="p-2 text-indigo-400 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
