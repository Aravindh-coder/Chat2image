import React, { useState, useRef, ChangeEvent } from 'react';
import {
  Sparkles,
  Plus,
  ArrowUp,
  X,
  Sliders,
  Crop,
  Layers,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { ImageStyle, AspectRatio } from '../types/index.js';
import { api } from '../services/api.js';

interface PromptComposerProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  loadingStep?: string;
  style: ImageStyle;
  setStyle: (s: ImageStyle) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (r: AspectRatio) => void;
  enhancePrompt: boolean;
  setEnhancePrompt: (e: boolean) => void;
  referenceImage: string | null;
  setReferenceImage: (img: string | null) => void;
  placeholder?: string;
}

const STYLES: ImageStyle[] = [
  'Auto',
  'Realistic',
  'Cinematic',
  '3D Render',
  'Anime',
  'Digital Art',
  'Watercolor',
  'Oil Painting',
  'Pixel Art',
  'Fantasy',
  'Minimalist',
];

const RATIOS: { id: AspectRatio; label: string; iconDesc: string }[] = [
  { id: '1:1', label: '1:1 Square', iconDesc: 'Square' },
  { id: '16:9', label: '16:9 Landscape', iconDesc: 'Wide' },
  { id: '9:16', label: '9:16 Portrait', iconDesc: 'Tall' },
  { id: '4:3', label: '4:3 Classic', iconDesc: 'Classic' },
];

export const PromptComposer: React.FC<PromptComposerProps> = ({
  onSend,
  isLoading,
  loadingStep = 'Creating your image...',
  style,
  setStyle,
  aspectRatio,
  setAspectRatio,
  enhancePrompt,
  setEnhancePrompt,
  referenceImage,
  setReferenceImage,
  placeholder = 'Describe the image you want or refine the previous creation...',
}) => {
  const [prompt, setPrompt] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isLoading || isUploading) return;
    onSend(prompt.trim());
    setPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds 10MB limit.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const result = await api.uploadImage(file);
      setReferenceImage(result.imageUrl);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Upload failed';
      setUploadError(errMsg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div
      id="prompt-composer-container"
      className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-4 space-y-3"
    >
      {/* Uploaded Reference Image Pill */}
      {referenceImage && (
        <div
          id="reference-image-preview"
          className="flex items-center gap-3 px-3.5 py-2 border border-indigo-500/30 bg-indigo-950/30 rounded-xl text-xs"
        >
          <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-indigo-500/30 shrink-0">
            <img
              src={referenceImage}
              alt="Reference upload"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-indigo-200 truncate">
              Reference Image Attached
            </p>
            <p className="text-[11px] text-indigo-400">
              Will be used to guide or edit the scene
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReferenceImage(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Remove reference image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="px-3.5 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center justify-between">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="cursor-pointer font-bold text-rose-400 hover:text-rose-200"
          >
            ×
          </button>
        </div>
      )}

      {/* Composer Input Box: [ + ] [Input Textarea] [Generate] */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        {/* File Upload Hidden Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/jpg, image/webp"
          className="hidden"
          id="composer-image-upload-input"
        />

        <div className="flex-1 flex items-center bg-[#161621] border border-white/10 rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 focus-within:border-indigo-500/60 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all shadow-lg">
          {/* File Upload Button [ + ] */}
          <button
            type="button"
            id="composer-add-image-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isUploading}
            aria-label="Upload reference image"
            title="Upload reference photo (PNG, JPG, WEBP)"
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer shrink-0 disabled:opacity-40"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            ) : (
              <Plus className="w-5 h-5 stroke-[2.2]" />
            )}
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            id="composer-prompt-input"
            rows={1}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-100 placeholder:text-slate-500 outline-none px-2.5 py-1.5 resize-none max-h-32 leading-relaxed"
          />

          {/* Generate Button */}
          <button
            type="submit"
            id="composer-generate-btn"
            disabled={!prompt.trim() || isLoading || isUploading}
            aria-label="Generate Image"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden xs:inline">Creating...</span>
              </>
            ) : (
              <>
                <span>Generate</span>
                <ArrowUp className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Toolbar Controls (Style, Aspect Ratio, Enhance Prompt Toggle) */}
      <div
        id="composer-controls-bar"
        className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-400 px-1"
      >
        {/* Style Selector Badge */}
        <div className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Style:</span>
          <select
            id="composer-style-select"
            value={style}
            onChange={(e) => setStyle(e.target.value as ImageStyle)}
            disabled={isLoading}
            className="bg-transparent border-none text-xs font-semibold text-slate-200 focus:outline-hidden cursor-pointer"
          >
            {STYLES.map((s) => (
              <option key={s} value={s} className="bg-[#161621] text-slate-200">
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Aspect Ratio Selector Badge */}
        <div className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Ratio:</span>
          <select
            id="composer-aspect-ratio-select"
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
            disabled={isLoading}
            className="bg-transparent border-none text-xs font-semibold text-slate-200 focus:outline-hidden cursor-pointer"
          >
            {RATIOS.map((r) => (
              <option key={r.id} value={r.id} className="bg-[#161621] text-slate-200">
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Enhance Prompt Toggle Badge */}
        <button
          type="button"
          id="composer-toggle-enhancement-btn"
          onClick={() => setEnhancePrompt(!enhancePrompt)}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors cursor-pointer"
          title="Enhance simple prompts with Gemini visual intelligence"
        >
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Enhance:</span>
          <span className={`text-xs font-bold ${enhancePrompt ? 'text-emerald-400' : 'text-slate-500'}`}>
            {enhancePrompt ? 'ON' : 'OFF'}
          </span>
          <Sparkles className={`w-3 h-3 ${enhancePrompt ? 'text-emerald-400' : 'text-slate-500'}`} />
        </button>
      </div>

      {/* Generation in Progress Banner */}
      {isLoading && (
        <div
          id="generation-loading-banner"
          className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-between text-xs text-indigo-300 animate-pulse"
        >
          <div className="flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            <span className="font-semibold">{loadingStep}</span>
          </div>
          <span className="text-[11px] text-slate-400">Please wait</span>
        </div>
      )}
    </div>
  );
};
