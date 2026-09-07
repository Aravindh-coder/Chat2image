import React from 'react';
import { Sparkles, Wand2 } from 'lucide-react';

interface RefinementSuggestionsProps {
  onSelectRefinement: (suggestion: string) => void;
  disabled?: boolean;
}

const SUGGESTIONS = [
  'Make the buildings taller and add flying cars',
  'Make it cinematic with dramatic night lighting',
  'Change the weather to rainy with reflections',
  'Add mountains in the background',
  'Make it blue and futuristic',
  'Turn it into a vintage travel poster',
  'Change style to studio anime aesthetic',
];

export const RefinementSuggestions: React.FC<RefinementSuggestionsProps> = ({
  onSelectRefinement,
  disabled = false,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-2">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2 px-1">
        <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
          Quick Refinements
        </span>
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {SUGGESTIONS.map((sug, i) => (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => onSelectRefinement(sug)}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/40 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50 text-left whitespace-nowrap active:scale-95 shadow-xs"
          >
            "{sug}"
          </button>
        ))}
      </div>
    </div>
  );
};
