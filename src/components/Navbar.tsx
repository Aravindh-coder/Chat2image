import React, { useState } from 'react';
import {
  Sparkles,
  PlusCircle,
  Image as ImageIcon,
  History,
  Settings as SettingsIcon,
  Info,
  Menu,
  X,
  Sun,
  Moon,
  Zap,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'landing' | 'chat' | 'gallery' | 'history' | 'about' | 'settings';
  setActiveTab: (tab: 'landing' | 'chat' | 'gallery' | 'history' | 'about' | 'settings') => void;
  onNewChat: () => void;
  isDemoActive: boolean;
  theme: 'dark' | 'light' | 'system';
  onToggleTheme: () => void;
  activeProvider: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onNewChat,
  isDemoActive,
  theme,
  onToggleTheme,
  activeProvider,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'chat', label: 'Chat Studio', icon: Sparkles },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'history', label: 'History', icon: History },
    { id: 'about', label: 'About', icon: Info },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ] as const;

  const handleNavClick = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const handleNewChatClick = () => {
    onNewChat();
    setActiveTab('chat');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#08080C]/80 backdrop-blur-md transition-colors text-slate-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="brand-home-btn"
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-hidden"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white">
                  Chat2Image
                </span>
                {isDemoActive ? (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    Demo
                  </span>
                ) : (
                  <span className="hidden xs:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-white/5 text-slate-300 border border-white/10">
                    <Zap className="w-2.5 h-2.5 text-indigo-400" />
                    {activeProvider}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 -mt-0.5 hidden sm:block">
                Conversational AI Image Studio
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white/10 text-white border border-white/10 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 opacity-80" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: New Chat & Theme & Mobile Hamburger */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="nav-new-chat-btn"
            onClick={handleNewChatClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-98 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          <button
            type="button"
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label="Toggle color mode"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Mobile hamburger button */}
          <button
            type="button"
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu for 360px, 390px, 430px Android Viewports */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden border-t border-white/10 bg-[#0D0D14] px-4 py-3 space-y-1 shadow-2xl animate-in slide-in-from-top-2 duration-200"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                id={`mobile-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 text-indigo-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
