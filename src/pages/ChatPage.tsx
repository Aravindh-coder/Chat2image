import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { useChat } from '../hooks/useChat.js';
import { ChatMessage } from '../components/ChatMessage.js';
import { PromptComposer } from '../components/PromptComposer.js';
import { RefinementSuggestions } from '../components/RefinementSuggestions.js';
import { ImagePreviewModal } from '../components/ImagePreviewModal.js';
import { ImageStyle, AspectRatio } from '../types/index.js';

interface ChatPageProps {
  conversationId: string | null;
  setConversationId: (id: string | null) => void;
  initialPrompt?: string | null;
  clearInitialPrompt?: () => void;
  activeProvider: string;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  conversationId,
  setConversationId,
  initialPrompt,
  clearInitialPrompt,
  activeProvider,
}) => {
  const {
    messages,
    isLoading,
    loadingStep,
    error,
    setError,
    style,
    setStyle,
    aspectRatio,
    setAspectRatio,
    enhancePrompt,
    setEnhancePrompt,
    referenceImage,
    setReferenceImage,
    sendMessage,
    regenerate,
    conversationTitle,
  } = useChat(conversationId);

  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    imageUrl: string;
    prompt: string;
    enhancedPrompt?: string | null;
    style?: string | null;
    aspectRatio?: string | null;
    isDemo?: boolean;
  }>({
    isOpen: false,
    imageUrl: '',
    prompt: '',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle initial prompt from landing page
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() !== '') {
      sendMessage(initialPrompt, activeProvider);
      if (clearInitialPrompt) clearInitialPrompt();
    }
  }, [initialPrompt, clearInitialPrompt, sendMessage, activeProvider]);

  // Check if conversation has at least one image
  const hasGeneratedImages = messages.some((m) => m.role === 'assistant' && m.image_url);

  return (
    <div id="chat-page" className="flex flex-col flex-1 h-[calc(100vh-4rem)] overflow-hidden bg-[#08080C] text-slate-100">
      {/* Top Chat Bar */}
      <div className="h-14 border-b border-white/5 bg-[#08080C]/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <h2 className="text-sm font-semibold text-slate-400 truncate">
            Active Session: <span className="text-white font-medium">{conversationTitle}</span>
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 font-medium">
            Provider: <strong className="text-indigo-400 uppercase">{activeProvider}</strong>
          </span>
        </div>
      </div>

      {/* Main Conversation Scroll Area */}
      <div
        id="messages-scroll-area"
        className="flex-1 overflow-y-auto px-2 sm:px-6 md:px-8 py-6 space-y-4"
      >
        {/* Welcome Empty State */}
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-white/10 text-indigo-400 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/10">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Start Your Image Conversation
            </h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Describe what you want to visualize. Once the image is created, keep the conversation going to refine, tweak, or add new elements!
            </p>

            <div className="mt-6 w-full space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">
                Quick Starters
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left text-xs">
                <button
                  type="button"
                  onClick={() => sendMessage('Create a futuristic Indian city at night with neon lights', activeProvider)}
                  className="p-3.5 rounded-xl bg-[#0D0D14] border border-white/10 hover:border-indigo-500/50 hover:bg-white/5 text-slate-300 transition-all cursor-pointer text-left shadow-xs group"
                >
                  <span className="group-hover:text-indigo-300 transition-colors">
                    "Create a futuristic Indian city at night with neon lights"
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => sendMessage('A cute 3D robot mascot drinking bubble tea', activeProvider)}
                  className="p-3.5 rounded-xl bg-[#0D0D14] border border-white/10 hover:border-indigo-500/50 hover:bg-white/5 text-slate-300 transition-all cursor-pointer text-left shadow-xs group"
                >
                  <span className="group-hover:text-indigo-300 transition-colors">
                    "A cute 3D robot mascot drinking bubble tea"
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message Bubble Feed */}
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onRegenerate={(prompt, st, ra) => regenerate(prompt, st, ra)}
            onUseAsReference={(imgUrl) => setReferenceImage(imgUrl)}
            onOpenModal={(data) => setModalData({ isOpen: true, ...data })}
          />
        ))}

        {/* Error Alert */}
        {error && (
          <div className="max-w-xl mx-auto my-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5 backdrop-blur-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <div className="flex-1">
              <p className="font-semibold text-rose-200">Generation encountered an error</p>
              <p className="mt-0.5 text-xs text-rose-300/80">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-xs font-bold underline cursor-pointer text-rose-400 hover:text-rose-200"
            >
              Dismiss
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Refinement Suggestions (Shown after at least one image is generated) */}
      {hasGeneratedImages && !isLoading && (
        <RefinementSuggestions
          disabled={isLoading}
          onSelectRefinement={(sug) => sendMessage(sug, activeProvider)}
        />
      )}

      {/* Bottom Composer */}
      <div className="shrink-0 bg-[#0D0D14] border-t border-white/10">
        <PromptComposer
          onSend={(text) => sendMessage(text, activeProvider)}
          isLoading={isLoading}
          loadingStep={loadingStep}
          style={style}
          setStyle={setStyle}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          enhancePrompt={enhancePrompt}
          setEnhancePrompt={setEnhancePrompt}
          referenceImage={referenceImage}
          setReferenceImage={setReferenceImage}
        />
      </div>

      {/* Fullscreen Preview Modal */}
      <ImagePreviewModal
        isOpen={modalData.isOpen}
        onClose={() => setModalData((prev) => ({ ...prev, isOpen: false }))}
        imageUrl={modalData.imageUrl}
        prompt={modalData.prompt}
        enhancedPrompt={modalData.enhancedPrompt}
        style={modalData.style}
        aspectRatio={modalData.aspectRatio}
        isDemo={modalData.isDemo}
        onRegenerate={(prompt) => regenerate(prompt)}
        onUseAsReference={(img) => setReferenceImage(img)}
      />
    </div>
  );
};
