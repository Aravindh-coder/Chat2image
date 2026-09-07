import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { DemoModeBanner } from './components/DemoModeBanner.js';
import { LandingPage } from './pages/LandingPage.js';
import { ChatPage } from './pages/ChatPage.js';
import { GalleryPage } from './pages/GalleryPage.js';
import { HistoryPage } from './pages/HistoryPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { useSettings } from './hooks/useSettings.js';
import { api } from './services/api.js';
import { SystemHealth } from './types/index.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<'landing' | 'chat' | 'gallery' | 'history' | 'about' | 'settings'>('landing');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);

  const { settings, updateSetting } = useSettings();

  const fetchHealth = async () => {
    try {
      const health = await api.getHealth();
      setSystemHealth(health);
    } catch (err) {
      console.warn('Could not fetch backend health:', err);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleStartCreating = (prompt?: string) => {
    if (prompt) {
      setInitialPrompt(prompt);
    }
    setConversationId(null);
    setActiveTab('chat');
  };

  const handleNewChat = () => {
    setConversationId(null);
    setInitialPrompt(null);
    setActiveTab('chat');
  };

  const handleOpenConversation = (id: string) => {
    setConversationId(id);
    setActiveTab('chat');
  };

  const handleOpenInChat = (prompt: string, convId?: string | null) => {
    if (convId) {
      setConversationId(convId);
    } else {
      setConversationId(null);
    }
    setInitialPrompt(prompt);
    setActiveTab('chat');
  };

  const isDemoActive = Boolean(systemHealth?.imageProvider?.isDemo);
  const activeProviderName = systemHealth?.imageProvider?.active || settings.preferredProvider;

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSetting('theme', nextTheme);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08080C] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Immersive UI Ambient Background Glows */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-[140px] pointer-events-none opacity-15 -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-[140px] pointer-events-none opacity-10 -z-10" />

      {/* Demo Mode Alert Banner */}
      <DemoModeBanner
        isDemoActive={isDemoActive}
        onOpenSettings={() => setActiveTab('settings')}
        onSwitchToFreeAi={() => {
          updateSetting('preferredProvider', 'pollinations');
          fetchHealth();
        }}
      />

      {/* Main Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewChat={handleNewChat}
        isDemoActive={isDemoActive}
        theme={settings.theme}
        onToggleTheme={toggleTheme}
        activeProvider={activeProviderName}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 flex flex-col relative z-0">
        {activeTab === 'landing' && (
          <LandingPage
            onStartCreating={handleStartCreating}
            onExploreGallery={() => setActiveTab('gallery')}
          />
        )}

        {activeTab === 'chat' && (
          <ChatPage
            conversationId={conversationId}
            setConversationId={setConversationId}
            initialPrompt={initialPrompt}
            clearInitialPrompt={() => setInitialPrompt(null)}
            activeProvider={activeProviderName}
          />
        )}

        {activeTab === 'gallery' && (
          <GalleryPage onOpenInChat={handleOpenInChat} />
        )}

        {activeTab === 'history' && (
          <HistoryPage
            onOpenConversation={handleOpenConversation}
            onNewChat={handleNewChat}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage
            settings={settings}
            updateSetting={updateSetting}
            systemHealth={systemHealth}
            onRefreshHealth={fetchHealth}
          />
        )}

        {activeTab === 'about' && <AboutPage />}
      </main>
    </div>
  );
}
