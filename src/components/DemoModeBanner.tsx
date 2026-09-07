import React from 'react';
import { AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

interface DemoModeBannerProps {
  onOpenSettings?: () => void;
  onSwitchToFreeAi?: () => void;
  isDemoActive: boolean;
}

export const DemoModeBanner: React.FC<DemoModeBannerProps> = ({
  onOpenSettings,
  onSwitchToFreeAi,
  isDemoActive,
}) => {
  if (!isDemoActive) return null;

  return (
    <div
      id="demo-mode-banner"
      className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-amber-200 text-xs sm:text-sm flex flex-wrap items-center justify-between gap-2 shadow-xs transition-all backdrop-blur-md"
    >
      <div className="flex items-center gap-2 font-medium">
        <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold tracking-wide uppercase text-[10px]">
          Demo Mode
        </span>
        <span className="text-amber-200/90 text-xs">
          Add an image-generation API key to enable real AI image generation.
        </span>
      </div>

      <div className="flex items-center gap-2">
        {onSwitchToFreeAi && (
          <button
            type="button"
            id="switch-to-free-ai-btn"
            onClick={onSwitchToFreeAi}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 font-semibold text-amber-200 text-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Enable Free Pollinations AI</span>
          </button>
        )}
        {onOpenSettings && (
          <button
            type="button"
            id="open-settings-from-banner-btn"
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1 font-semibold text-amber-300 hover:text-amber-200 hover:underline text-xs cursor-pointer"
          >
            <span>Configure</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
