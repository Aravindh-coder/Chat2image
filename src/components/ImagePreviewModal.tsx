import React, { useEffect } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Layers,
  Crop,
  ShieldAlert,
} from 'lucide-react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  prompt: string;
  enhancedPrompt?: string | null;
  style?: string | null;
  aspectRatio?: string | null;
  isDemo?: boolean;
  onRegenerate?: (prompt: string) => void;
  onUseAsReference?: (imageUrl: string) => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  prompt,
  enhancedPrompt,
  style,
  aspectRatio,
  isDemo,
  onRegenerate,
  onUseAsReference,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(enhancedPrompt || prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    const cleanName = prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `chat2image_${cleanName || 'generated'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      id="image-preview-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full max-h-[92vh] flex flex-col md:flex-row bg-[#0D0D14] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer backdrop-blur-md"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left / Center Image View */}
        <div className="flex-1 min-h-[300px] md:min-h-[500px] max-h-[60vh] md:max-h-[90vh] bg-black/60 flex items-center justify-center p-4 overflow-hidden">
          <img
            src={imageUrl}
            alt={prompt}
            className="max-h-full max-w-full object-contain rounded-xl shadow-lg"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Right Info Panel */}
        <div className="w-full md:w-84 lg:w-96 p-5 sm:p-6 flex flex-col justify-between bg-[#0D0D14] border-t md:border-t-0 md:border-l border-white/10 text-slate-100 overflow-y-auto">
          <div className="space-y-4">
            {/* Header & Badges */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                {style && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white/5 text-slate-300 border border-white/10">
                    <Layers className="w-3 h-3 text-indigo-400" />
                    {style}
                  </span>
                )}
                {aspectRatio && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 text-slate-300 border border-white/10">
                    <Crop className="w-3 h-3 text-indigo-400" />
                    {aspectRatio}
                  </span>
                )}
                {isDemo && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <ShieldAlert className="w-3 h-3" />
                    Demo Preview
                  </span>
                )}
              </div>
              <h3 className="font-bold text-base text-white line-clamp-2">
                "{prompt}"
              </h3>
            </div>

            {/* Prompt details */}
            <div className="space-y-3 text-xs">
              {enhancedPrompt && enhancedPrompt !== prompt && (
                <div className="p-3.5 rounded-xl bg-[#161621] border border-white/10">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-semibold mb-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gemini Enhanced Prompt</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed max-h-40 overflow-y-auto pr-1">
                    {enhancedPrompt}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
            <button
              type="button"
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm text-white shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download High-Res</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Prompt'}</span>
              </button>

              {onRegenerate && (
                <button
                  type="button"
                  onClick={() => {
                    onRegenerate(prompt);
                    onClose();
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-indigo-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              )}
            </div>

            {onUseAsReference && (
              <button
                type="button"
                onClick={() => {
                  onUseAsReference(imageUrl);
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Use as Reference for Edit</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
