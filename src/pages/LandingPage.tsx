import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Image as ImageIcon,
  MessageSquare,
  Wand2,
  Layers,
  History,
  CheckCircle2,
} from 'lucide-react';

interface LandingPageProps {
  onStartCreating: (initialPrompt?: string) => void;
  onExploreGallery: () => void;
}

const EXAMPLE_PROMPTS = [
  {
    title: 'Futuristic Metropolis',
    prompt: 'A futuristic city in 2050 at night with neon spires and flying cars',
    style: 'Cinematic',
    tag: 'Popular',
  },
  {
    title: 'Mars Explorer',
    prompt: 'A cinematic astronaut on Mars looking at a glowing sandstorm',
    style: 'Realistic',
    tag: 'Sci-Fi',
  },
  {
    title: 'Robot Mascot',
    prompt: 'A cute 3D robot mascot with glowing cyan eyes holding a coffee cup',
    style: '3D Render',
    tag: '3D Art',
  },
  {
    title: 'Sky Castle',
    prompt: 'A fantasy castle above the clouds during golden hour with water waterfalls',
    style: 'Fantasy',
    tag: 'Mythic',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartCreating,
  onExploreGallery,
}) => {
  return (
    <div id="landing-page" className="w-full flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-5xl mx-auto px-4 pt-12 sm:pt-16 pb-12 sm:pb-20 text-center flex flex-col items-center">
        {/* Subtle pill badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs sm:text-sm font-semibold mb-6 shadow-xs backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Conversational AI Image Creation Studio</span>
        </div>

        {/* Required Landing Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15] max-w-3xl">
          Turn Your Words Into{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Images
          </span>
        </h1>

        {/* Required Subtitle */}
        <p className="mt-4 sm:mt-6 text-base sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
          Create, refine and explore AI-generated images through a simple conversation.
        </p>

        {/* Required Action Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
          <button
            type="button"
            id="landing-start-creating-btn"
            onClick={() => onStartCreating()}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <span>Start Creating</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            id="landing-explore-gallery-btn"
            onClick={onExploreGallery}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold text-base transition-colors flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md"
          >
            <ImageIcon className="w-5 h-5 text-slate-400" />
            <span>Explore Gallery</span>
          </button>
        </div>

        {/* Core Differentiator Showcase: Conversational Flow */}
        <div className="mt-12 sm:mt-16 w-full max-w-3xl rounded-2xl bg-[#0D0D14] border border-white/10 p-5 sm:p-7 text-left shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              The Conversational Refinement Difference
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs sm:text-sm">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-200">
              <span className="text-indigo-400 font-bold">You:</span> "Create a futuristic city at night."
            </div>
            <div className="p-3.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-100">
              <span className="text-purple-400 font-bold">AI:</span> "Sure! I'll create that for you." <span className="text-slate-400 text-xs ml-2">[GENERATED IMAGE]</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-200">
              <span className="text-indigo-400 font-bold">You:</span> "Make the buildings taller and add flying cars."
            </div>
            <div className="p-3.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-100">
              <span className="text-purple-400 font-bold">AI:</span> "Synthesized context with towering skyscrapers and aerial hover-vehicles!" <span className="text-slate-400 text-xs ml-2">[UPDATED IMAGE]</span>
            </div>
          </div>
        </div>
      </section>

      {/* Example Prompts Grid (Required) */}
      <section className="w-full max-w-5xl mx-auto px-4 py-8 border-t border-white/10">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Try Example Prompts
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Click any prompt below to begin creating instantly
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EXAMPLE_PROMPTS.map((item, idx) => (
            <div
              key={idx}
              id={`example-prompt-card-${idx}`}
              onClick={() => onStartCreating(item.prompt)}
              className="p-5 rounded-2xl bg-[#0D0D14] border border-white/10 hover:border-indigo-500/60 hover:bg-white/5 shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/5 border border-white/10 text-slate-300">
                    {item.style}
                  </span>
                </div>
                <p className="text-sm text-slate-400 line-clamp-2">
                  "{item.prompt}"
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-indigo-400 font-semibold pt-2 border-t border-white/5">
                <span>Load in Chat Studio</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="w-full max-w-5xl mx-auto px-4 py-12 border-t border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-[#0D0D14] border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4">
              <Wand2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white mb-1.5">
              Conversational Refinement
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Continue your chat naturally. Say "make it cinematic" or "add rain", and Chat2Image maintains context.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D0D14] border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white mb-1.5">
              Gemini Prompt Enhancer
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Intelligently elevates short prompts into rich descriptive visual recipes with dramatic lighting and atmosphere.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D0D14] border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center justify-center mb-4">
              <History className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white mb-1.5">
              SQLite History & Gallery
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Your conversations, generations, styles, and prompt iterations are automatically persisted locally.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
