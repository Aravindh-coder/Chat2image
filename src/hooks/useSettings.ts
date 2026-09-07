import { useState, useEffect } from 'react';
import { AppSettings, ImageStyle, AspectRatio } from '../types/index.js';

const STORAGE_KEY = 'chat2image_settings';

const defaultSettings: AppSettings = {
  theme: 'dark',
  enhancePrompt: true,
  saveHistory: true,
  defaultStyle: 'Auto',
  defaultAspectRatio: '1:1',
  preferredProvider: 'pollinations',
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (err) {
      console.warn('Failed to save settings to localStorage:', err);
    }

    // Apply theme
    const root = document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return {
    settings,
    updateSetting,
  };
}
