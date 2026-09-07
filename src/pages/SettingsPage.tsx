import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Layers,
  Crop,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { AppSettings, ImageStyle, AspectRatio, SystemHealth } from '../types/index.js';
import { api } from '../services/api.js';

interface SettingsPageProps {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  systemHealth: SystemHealth | null;
  onRefreshHealth: () => void;
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

const RATIOS: { id: AspectRatio; label: string }[] = [
  { id: '1:1', label: '1:1 Square' },
  { id: '16:9', label: '16:9 Landscape' },
  { id: '9:16', label: '9:16 Portrait' },
  { id: '4:3', label: '4:3 Classic' },
];

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  updateSetting,
  systemHealth,
  onRefreshHealth,
}) => {
  return (
    <div id="settings-page" className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-indigo-400" />
          Settings & Configuration
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Customize generation preferences, appearance, and view AI provider statuses
        </p>
      </div>

      {/* 1. API Status Section */}
      <section className="p-6 rounded-2xl bg-[#0D0D14] border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            Backend API & Provider Status
          </h2>
          <button
            type="button"
            onClick={onRefreshHealth}
            className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 cursor-pointer font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Status</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Gemini AI Status */}
          <div className="p-4 rounded-xl bg-[#161621] border border-white/10 flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Gemini Intelligence
              </span>
              <p className="text-sm font-semibold text-white mt-1">
                {systemHealth?.gemini.statusText || 'Checking...'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Used for prompt enhancement & conversational refinement
              </p>
            </div>
            {systemHealth?.gemini.connected ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                <AlertTriangle className="w-3.5 h-3.5" /> Fallback Mode
              </span>
            )}
          </div>

          {/* Image Provider Status */}
          <div className="p-4 rounded-xl bg-[#161621] border border-white/10 flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Image Generator
              </span>
              <p className="text-sm font-semibold text-white mt-1 uppercase">
                {systemHealth?.imageProvider.active || 'Pollinations'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {systemHealth?.imageProvider.isDemo ? 'Demo Mode active' : 'Live real AI generation'}
              </p>
            </div>
            {systemHealth?.imageProvider.isDemo ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                <ShieldAlert className="w-3.5 h-3.5" /> Demo Mode
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </span>
            )}
          </div>
        </div>

        {/* Informative Note for College Students & Reviewers */}
        <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white">Zero-Cost Guarantee & Architecture:</p>
            <p className="mt-0.5 text-slate-300">
              This application is configured to run free without paid API subscriptions. It defaults to <strong>Pollinations AI</strong> (free live AI generation) or <strong>Demo Mode</strong> (visual watermark SVG mock). Server secrets are kept secure in environment variables.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Appearance Section */}
      <section className="p-6 rounded-2xl bg-[#0D0D14] border border-white/10 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-400" />
          Appearance & Theme
        </h2>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark (Immersive)', icon: Moon },
            { id: 'system', label: 'System', icon: Monitor },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = settings.theme === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => updateSetting('theme', item.id as any)}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500/60 bg-indigo-600/20 text-indigo-300 font-bold shadow-lg shadow-indigo-600/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. AI & Generation Controls */}
      <section className="p-6 rounded-2xl bg-[#0D0D14] border border-white/10 shadow-xl space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          AI & Prompt Configuration
        </h2>

        {/* Prompt Enhancement Toggle */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <p className="font-semibold text-sm text-white">
              Prompt Enhancement
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Automatically expand simple user prompts into rich visual details and lighting instructions
            </p>
          </div>
          <button
            type="button"
            onClick={() => updateSetting('enhancePrompt', !settings.enhancePrompt)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              settings.enhancePrompt ? 'bg-indigo-600' : 'bg-white/10'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                settings.enhancePrompt ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Save History Toggle */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <p className="font-semibold text-sm text-white">
              Save Conversation History
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Persist conversations and generations in the local SQLite database
            </p>
          </div>
          <button
            type="button"
            onClick={() => updateSetting('saveHistory', !settings.saveHistory)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              settings.saveHistory ? 'bg-indigo-600' : 'bg-white/10'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                settings.saveHistory ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Default Style Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Default Visual Style
          </label>
          <select
            value={settings.defaultStyle}
            onChange={(e) => updateSetting('defaultStyle', e.target.value as ImageStyle)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#161621] text-slate-100 text-sm focus:outline-hidden focus:border-indigo-500/50"
          >
            {STYLES.map((st) => (
              <option key={st} value={st} className="bg-[#161621] text-slate-200">
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Default Aspect Ratio Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Default Aspect Ratio
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {RATIOS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => updateSetting('defaultAspectRatio', r.id)}
                className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  settings.defaultAspectRatio === r.id
                    ? 'border-indigo-500/60 bg-indigo-600/20 text-indigo-300 font-bold shadow-lg shadow-indigo-600/10'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
