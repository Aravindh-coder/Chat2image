export type ImageStyle =
  | 'Auto'
  | 'Realistic'
  | 'Cinematic'
  | '3D Render'
  | 'Anime'
  | 'Digital Art'
  | 'Watercolor'
  | 'Oil Painting'
  | 'Pixel Art'
  | 'Fantasy'
  | 'Minimalist';

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3';

export interface DbConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  generation_count?: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  image_url: string | null;
  created_at: string;
  generation_id?: string | null;
  original_prompt?: string | null;
  enhanced_prompt?: string | null;
  style?: string | null;
  aspect_ratio?: string | null;
  isDemo?: boolean;
  note?: string;
}

export interface Generation {
  id: string;
  conversation_id: string | null;
  prompt: string;
  enhanced_prompt: string | null;
  image_url: string;
  style: string;
  aspect_ratio: string;
  provider: string;
  is_demo: number | boolean;
  created_at: string;
}

export interface SystemHealth {
  status: string;
  gemini: {
    connected: boolean;
    statusText: string;
  };
  imageProvider: {
    active: string;
    isDemo: boolean;
    availableProviders: Array<{ name: string; available: boolean; supportsImageToImage: boolean }>;
    message: string;
  };
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  enhancePrompt: boolean;
  saveHistory: boolean;
  defaultStyle: ImageStyle;
  defaultAspectRatio: AspectRatio;
  preferredProvider: string;
}
