import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Search,
  Download,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Maximize2,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api.js';
import { Generation, ImageStyle } from '../types/index.js';
import { ImagePreviewModal } from '../components/ImagePreviewModal.js';

interface GalleryPageProps {
  onOpenInChat: (prompt: string, conversationId?: string | null) => void;
}

const FILTER_STYLES = [
  'All',
  'Realistic',
  'Cinematic',
  '3D Render',
  'Anime',
  'Digital Art',
  'Watercolor',
  'Fantasy',
];

export const GalleryPage: React.FC<GalleryPageProps> = ({ onOpenInChat }) => {
  const [items, setItems] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    imageUrl: string;
    prompt: string;
    enhancedPrompt?: string | null;
    style?: string | null;
    aspectRatio?: string | null;
    isDemo?: boolean;
  }>({
    isOpen: false,
    imageUrl: '',
    prompt: '',
  });

  const loadGallery = async () => {
    setLoading(true);
    try {
      const data = await api.getGallery({
        style: selectedStyle !== 'All' ? selectedStyle : undefined,
        search: searchQuery.trim() || undefined,
      });
      setItems(data);
    } catch (err) {
      console.error('Failed to load gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadGallery();
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedStyle, searchQuery]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this image from gallery?')) return;
    try {
      await api.deleteGalleryItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert('Failed to delete image.');
    }
  };

  const handleCopy = (prompt: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (imageUrl: string, prompt: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `chat2image_${prompt.slice(0, 25).replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="gallery-page" className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-7 h-7 text-indigo-400" />
            Image Gallery
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse and manage all AI-generated creations across conversations
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-white/10 bg-[#161621] text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Style Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
        {FILTER_STYLES.map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setSelectedStyle(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedStyle === st
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Grid of Generations */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white/5 border border-white/5 aspect-square animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#0D0D14] rounded-3xl border border-dashed border-white/10 max-w-lg mx-auto">
          <ImageIcon className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No creations found</h3>
          <p className="text-sm text-slate-400 mt-1">
            {searchQuery || selectedStyle !== 'All'
              ? 'Try modifying your search or style filter.'
              : 'You have not created any images yet. Start your first creation in the Chat Studio!'}
          </p>
          <button
            type="button"
            onClick={() => onOpenInChat('')}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Go to Chat Studio</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() =>
                setModalData({
                  isOpen: true,
                  imageUrl: item.image_url,
                  prompt: item.prompt,
                  enhancedPrompt: item.enhanced_prompt,
                  style: item.style,
                  aspectRatio: item.aspect_ratio,
                  isDemo: Boolean(item.is_demo),
                })
              }
              className="group relative rounded-2xl overflow-hidden border border-white/10 bg-[#0D0D14] shadow-lg hover:border-indigo-500/50 hover:shadow-indigo-500/10 transition-all cursor-pointer flex flex-col justify-between"
            >
              {/* Image with Aspect Ratio */}
              <div className="relative aspect-square overflow-hidden bg-black/40 flex items-center justify-center">
                <img
                  src={item.image_url}
                  alt={item.prompt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />

                {/* Badges */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold backdrop-blur-xs border border-white/10">
                    {item.style}
                  </span>
                  {item.is_demo ? (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/90 text-black text-[9px] font-bold uppercase">
                      Demo
                    </span>
                  ) : null}
                </div>

                {/* Hover Quick Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 backdrop-blur-xs">
                  <button
                    type="button"
                    onClick={(e) => handleDownload(item.image_url, item.prompt, e)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs transition-colors border border-white/10"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleCopy(item.prompt, item.id, e)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs transition-colors border border-white/10"
                    title="Copy Prompt"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenInChat(item.prompt, item.conversation_id);
                    }}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs transition-colors border border-white/10"
                    title="Continue in Chat Studio"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-2 rounded-xl bg-rose-500/30 hover:bg-rose-500/50 text-white backdrop-blur-xs transition-colors border border-rose-500/30"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-3.5 text-xs flex flex-col justify-between flex-1">
                <p className="text-slate-200 line-clamp-2 font-medium">
                  "{item.prompt}"
                </p>
                <div className="mt-2.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  <span className="uppercase">{item.aspect_ratio}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <ImagePreviewModal
        isOpen={modalData.isOpen}
        onClose={() => setModalData((prev) => ({ ...prev, isOpen: false }))}
        imageUrl={modalData.imageUrl}
        prompt={modalData.prompt}
        enhancedPrompt={modalData.enhancedPrompt}
        style={modalData.style}
        aspectRatio={modalData.aspectRatio}
        isDemo={modalData.isDemo}
        onRegenerate={(p) => onOpenInChat(p)}
      />
    </div>
  );
};
