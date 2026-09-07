import React from 'react';
import {
  Sparkles,
  Layers,
  Database,
  Server,
  Wand2,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Workflow,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div id="about-page" className="w-full max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold mb-4 backdrop-blur-md">
          <GraduationCap className="w-4 h-4 text-indigo-400" />
          <span>College Mini-Project Documentation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Chat2Image
        </h1>
        <p className="mt-2 text-base text-slate-400 font-medium">
          Conversational AI Image Creation Studio
        </p>
      </div>

      {/* 1. Problem & Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#0D0D14] border border-white/10 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-3">
            <span className="p-1 rounded-md bg-rose-500/10 text-rose-400 text-xs border border-rose-500/20">✕</span>
            The Problem
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Traditional AI image generation applications rely on isolated, single-shot prompt forms. If a student or designer generates an image and wants to tweak small elements (e.g. "make the buildings taller", "add flying cars", "make it cinematic"), they must manually re-engineer the entire prompt from scratch, often losing previous composition and aesthetic nuances.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0D0D14] border border-white/10 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-3">
            <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">✓</span>
            The Chat2Image Solution
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Chat2Image brings natural conversational continuity to image creation. Users can converse naturally with an AI assistant that remembers past turns, synthesizes follow-up modifications into coherent prompts, and outputs refined images seamlessly within an interactive chat interface.
          </p>
        </div>
      </div>

      {/* 2. System Architecture Flow */}
      <section className="p-6 rounded-2xl bg-[#0D0D14] border border-white/10 shadow-xl space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Workflow className="w-5 h-5 text-indigo-400" />
          System Architecture Flow
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-[#161621] border border-white/10 flex flex-col items-center text-center">
            <Layers className="w-6 h-6 text-indigo-400 mb-2" />
            <span className="font-bold text-white">1. Client Layer</span>
            <p className="text-[11px] text-slate-400 mt-1">
              React 18 + Vite + Tailwind CSS. Responsive touch UI for Android & desktop.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#161621] border border-white/10 flex flex-col items-center text-center">
            <Server className="w-6 h-6 text-purple-400 mb-2" />
            <span className="font-bold text-white">2. Backend Gateway</span>
            <p className="text-[11px] text-slate-400 mt-1">
              Express.js REST APIs with Multer file uploads & secure env configs.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#161621] border border-white/10 flex flex-col items-center text-center">
            <Cpu className="w-6 h-6 text-pink-400 mb-2" />
            <span className="font-bold text-white">3. AI Intelligence</span>
            <p className="text-[11px] text-slate-400 mt-1">
              Gemini 3.8 Flash for contextual prompt synthesis & prompt expansion.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#161621] border border-white/10 flex flex-col items-center text-center">
            <Wand2 className="w-6 h-6 text-emerald-400 mb-2" />
            <span className="font-bold text-white">4. Image Providers</span>
            <p className="text-[11px] text-slate-400 mt-1">
              Modular Provider Pattern: Pollinations (Free AI), Gemini, or Demo Mode.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Tech Stack Matrix */}
      <section className="p-6 rounded-2xl bg-[#0D0D14] border border-white/10 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-400" />
          Technologies Used
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Frontend</h3>
            <ul className="space-y-1.5 text-slate-300 text-xs">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>React 18 & TypeScript</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Tailwind CSS for responsive layout</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Lucide React icons & motion animations</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Backend & Storage</h3>
            <ul className="space-y-1.5 text-slate-300 text-xs">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Express.js & Node.js</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>SQLite Database with sql.js file persistence</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Modular ImageProvider Interface</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. College Project Evaluation Details */}
      <section className="p-6 rounded-2xl bg-[#161621] border border-white/10 text-xs text-slate-400 space-y-3 shadow-xl">
        <h3 className="font-bold text-sm text-white">
          Project Evaluation Checklist
        </h3>
        <p className="text-slate-300">
          This application meets all requirements for a complete, production-ready college mini-project:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-[11px] text-slate-400">
          <li>Real AI image generation enabled through zero-cost Pollinations AI.</li>
          <li>Intelligent prompt enhancement and conversational refinement powered by Gemini.</li>
          <li>Robust fallback Demo Mode with watermarked SVG rendering when offline or without keys.</li>
          <li>Full SQLite persistence for conversations, messages, and image generations.</li>
          <li>Designed mobile-first for seamless demonstration on Android smartphones.</li>
        </ul>
      </section>
    </div>
  );
};
