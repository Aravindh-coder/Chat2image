import React, { useState } from 'react';
import {
  Sparkles,
  User,
  Download,
  Copy,
  Check,
  RefreshCw,
  Maximize2,
  Trash2,
  Layers,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Wand2,
} from 'lucide-react';
import { ChatMessage as ChatMessageType, ImageStyle, AspectRatio } from '../types/index.js';

interface ChatMessageProps {
  message: ChatMessageType;
  onRegenerate: (prompt: string, style?: ImageStyle, ratio?: AspectRatio) => void;
  onUseAsReference: (imageUrl: string) => void;
  onDeleteMessage?: (id: string) => void;
  onOpenModal: (data: {
    imageUrl: string;
    prompt: string;
    enhancedPrompt?: string | null;
    style?: string | null;
    aspectRatio?: string | null;
    isDemo?: boolean;
  }) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRegenerate,
  onUseAsReference,
  onDeleteMessage,
  onOpenModal,
}) => {
  const [copied, setCopied] = useState(false);
  const [showPromptDetails, setShowPromptDetails] = useState(false);

  const isUser = message.role === 'user';
  const hasImage = Boolean(message.image_url);

  const handleCopy = () => {
    const textToCopy = message.enhanced_prompt || message.original_prompt || message.content;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!message.image_url) return;
    const link = document.createElement('a');
    link.href = message.image_url;
    const promptSlug = (message.original_prompt || 'creation').slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `chat2image_${promptSlug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-3 my-3 sm:my-4 px-2 sm:px-4">
        <div className="max-w-[85%] sm:max-w-[70%] space-y-1.5">
          {message.image_url && (
            <div className="flex justify-end">
              <div className="rounded-xl overflow-hidden border border-indigo-500/30 shadow-md max-w-[220px]">
                <img
                  src={message.image_url}
                  alt="User reference"
                  className="w-full h-auto object-cover max-h-48"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}
          <div className="bg-indigo-600/20 border border-indigo-500/30 p-4 rounded-2xl rounded-tr-none text-indigo-100 text-sm leading-relaxed shadow-sm break-words">
            {message.content}
          </div>
          <span className="text-[10px] text-slate-500 block text-right pr-1">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="h-8 w-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 flex items-center justify-center shrink-0 text-xs font-semibold shadow-xs">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-start gap-3 sm:gap-4 my-3 sm:my-4 px-2 sm:px-4">
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-md">
        AI
      </div>

      <div className="max-w-[95%] sm:max-w-[85%] space-y-3">
        {/* Text Message Bubble & Card Container */}
        <div className="bg-white/5 border border-white/10 p-4 sm:p-5 rounded-2xl rounded-tl-none text-slate-200 shadow-sm space-y-4">
          <div className="text-sm sm:text-base leading-relaxed break-words text-slate-100">
            {message.content}
          </div>

          {/* Collapsible Prompt Details (Original vs Enhanced Prompt) */}
          {(message.original_prompt || message.enhanced_prompt) && (
            <div className="rounded-xl border border-white/10 bg-[#0D0D14] text-xs overflow-hidden">
              <button
                type="button"
                onClick={() => setShowPromptDetails(!showPromptDetails)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-slate-400 hover:text-slate-200 transition-colors font-medium cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded uppercase">
                    {message.enhanced_prompt ? 'Enhanced' : 'Prompt'}
                  </span>
                  <span className="text-xs text-slate-400 italic">
                    {message.enhanced_prompt ? 'Original prompt refined for quality...' : 'View prompt details'}
                  </span>
                </div>
                {showPromptDetails ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {showPromptDetails && (
                <div className="px-3.5 pb-3.5 pt-1 space-y-2.5 border-t border-white/5">
                  {message.original_prompt && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">
                        Original Prompt
                      </span>
                      <p className="text-slate-300 bg-black/40 p-2.5 rounded-lg border border-white/5 font-mono text-[11px] leading-relaxed">
                        "{message.original_prompt}"
                      </p>
                    </div>
                  )}
                  {message.enhanced_prompt && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 block mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-400" /> Gemini Enhanced Prompt
                      </span>
                      <p className="text-slate-200 bg-indigo-950/20 p-2.5 rounded-lg border border-indigo-500/20 font-sans text-xs leading-relaxed">
                        "{message.enhanced_prompt}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Generated Image Card with Actions */}
          {hasImage && message.image_url && (
            <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-slate-900 shadow-xl">
              {/* Image Container */}
              <div className="relative overflow-hidden bg-black/40 flex items-center justify-center">
                <img
                  src={message.image_url}
                  alt={message.original_prompt || 'Generated image'}
                  className="w-full h-auto object-cover max-h-[520px] transition-transform duration-300 group-hover:scale-[1.01]"
                  referrerPolicy="no-referrer"
                />

                {/* Overlay Action Buttons */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenModal({
                        imageUrl: message.image_url!,
                        prompt: message.original_prompt || message.content,
                        enhancedPrompt: message.enhanced_prompt,
                        style: message.style,
                        aspectRatio: message.aspect_ratio,
                        isDemo: message.isDemo,
                      })
                    }
                    className="p-2 bg-black/60 backdrop-blur-md rounded-lg text-white hover:bg-black/80 transition-colors cursor-pointer shadow-md"
                    title="Fullscreen Zoom"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="p-2 bg-black/60 backdrop-blur-md rounded-lg text-white hover:bg-black/80 transition-colors cursor-pointer shadow-md"
                    title="Download Image"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                {/* Demo Mode Preview Overlay Banner */}
                {message.isDemo && (
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                    <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                      Demo Mode Preview
                    </p>
                  </div>
                )}
              </div>

              {/* Image Footer / Action Toolbar */}
              <div className="p-3 border-t border-white/5 bg-[#0D0D14] flex flex-wrap items-center justify-between gap-2 text-xs">
                {/* Style & Ratio Info */}
                <div className="flex items-center gap-1.5 text-slate-400">
                  {message.style && (
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 font-medium text-[11px]">
                      {message.style}
                    </span>
                  )}
                  {message.aspect_ratio && (
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 font-medium text-[11px]">
                      {message.aspect_ratio}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5">
                  {/* Regenerate */}
                  <button
                    type="button"
                    onClick={() =>
                      onRegenerate(
                        message.original_prompt || message.content,
                        message.style as ImageStyle,
                        message.aspect_ratio as AspectRatio
                      )
                    }
                    className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-indigo-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                    title="Regenerate Image"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Regenerate</span>
                  </button>

                  {/* Copy Prompt */}
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                    title="Copy Prompt"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{copied ? 'Copied' : 'Prompt'}</span>
                  </button>

                  {/* Use as Reference */}
                  <button
                    type="button"
                    onClick={() => onUseAsReference(message.image_url!)}
                    className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Use as reference for next edit"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Refine</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <span className="text-[10px] text-slate-500 block pl-1">
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
