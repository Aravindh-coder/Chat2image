import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import { ChatMessage, ImageStyle, AspectRatio } from '../types/index.js';

export function useChat(initialConversationId?: string | null) {
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
  const [conversationTitle, setConversationTitle] = useState<string>('New Conversation');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('Creating your image...');
  const [error, setError] = useState<string | null>(null);

  // Active composer controls
  const [style, setStyle] = useState<ImageStyle>('Auto');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [enhancePrompt, setEnhancePrompt] = useState<boolean>(true);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  // Load conversation on mount or change
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setConversationTitle('New Conversation');
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setLoadingStep('Loading conversation...');

    api.getConversation(conversationId)
      .then((data) => {
        if (isMounted) {
          setConversationTitle(data.conversation.title);
          setMessages(data.messages);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load conversation');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [conversationId]);

  // Send message or refinement
  const sendMessage = useCallback(
    async (text: string, providerName?: string) => {
      if (!text.trim() || isLoading) return;

      const trimmed = text.trim();
      setError(null);
      setIsLoading(true);
      setLoadingStep('Understanding prompt & synthesizing context...');

      // Optimistic user message
      const tempUserMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId || 'temp',
        role: 'user',
        content: trimmed,
        image_url: referenceImage,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);

      // Step indicator updates
      const stepTimer1 = setTimeout(() => {
        setLoadingStep(enhancePrompt ? 'Enhancing visual prompt with Gemini...' : 'Calling image generation engine...');
      }, 700);

      const stepTimer2 = setTimeout(() => {
        setLoadingStep('Rendering image with selected provider...');
      }, 1800);

      try {
        const response = await api.sendMessage({
          conversationId,
          message: trimmed,
          style,
          aspectRatio,
          enhancePrompt,
          provider: providerName,
          referenceImage,
        });

        clearTimeout(stepTimer1);
        clearTimeout(stepTimer2);

        if (!conversationId && response.conversationId) {
          setConversationId(response.conversationId);
        }

        // Replace temp user msg with verified userMsg and append assistantMsg
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
          return [...filtered, response.userMessage, response.assistantMessage];
        });

        // Clear one-time reference image after generation
        setReferenceImage(null);
      } catch (err: unknown) {
        clearTimeout(stepTimer1);
        clearTimeout(stepTimer2);
        const errMsg = err instanceof Error ? err.message : 'Failed to generate image';
        setError(errMsg);
        // Keep user message so they don't lose their input
      } finally {
        setIsLoading(false);
        setLoadingStep('Creating your image...');
      }
    },
    [conversationId, isLoading, referenceImage, style, aspectRatio, enhancePrompt]
  );

  // Regenerate a specific prompt
  const regenerate = useCallback(
    async (prompt: string, customStyle?: ImageStyle, customRatio?: AspectRatio) => {
      if (isLoading) return;
      setStyle(customStyle || style);
      if (customRatio) setAspectRatio(customRatio);
      await sendMessage(`Regenerate: ${prompt}`);
    },
    [isLoading, style, sendMessage]
  );

  // Start fresh chat
  const startNewChat = useCallback(() => {
    setConversationId(null);
    setConversationTitle('New Conversation');
    setMessages([]);
    setError(null);
    setReferenceImage(null);
  }, []);

  return {
    conversationId,
    setConversationId,
    conversationTitle,
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
    startNewChat,
  };
}
