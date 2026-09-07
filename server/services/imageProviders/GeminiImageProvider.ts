import { GoogleGenAI } from '@google/genai';
import { ImageProvider, ImageGenerateOptions, ImageResult } from './ImageProvider.js';

export class GeminiImageProvider implements ImageProvider {
  private ai: GoogleGenAI | null = null;

  constructor() {
    if (process.env.GEMINI_API_KEY) {
      try {
        this.ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
      } catch (err) {
        console.warn('[GeminiImageProvider] Failed to initialize GoogleGenAI:', err);
      }
    }
  }

  public getProviderName(): string {
    return 'gemini';
  }

  public isAvailable(): boolean {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  public supportsImageToImage(): boolean {
    return true; // Gemini image models support image input parts!
  }

  public async generateImage(prompt: string, options: ImageGenerateOptions): Promise<ImageResult> {
    if (!this.ai) {
      throw new Error('Gemini API key is not configured.');
    }

    const aspectRatio = (options.aspectRatio as '1:1' | '3:4' | '4:3' | '9:16' | '16:9') || '1:1';
    const style = options.style || 'Auto';
    const finalPrompt = style && style !== 'Auto' ? `${prompt}, style: ${style}` : prompt;

    // Use gemini-3.1-flash-lite-image
    const response = await this.ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [{ text: finalPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio === '4:3' || aspectRatio === '16:9' || aspectRatio === '9:16' || aspectRatio === '1:1' ? aspectRatio : '1:1',
        },
      },
    });

    const candidates = response.candidates;
    if (candidates && candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          return {
            imageUrl: `data:${mimeType};base64,${part.inlineData.data}`,
            provider: 'gemini',
            isDemo: false,
            modelUsed: 'gemini-3.1-flash-lite-image',
            aspectRatio,
            style,
          };
        }
      }
    }

    throw new Error('Gemini image model did not return image data');
  }

  public async editImage(image: string, prompt: string, options: ImageGenerateOptions): Promise<ImageResult> {
    if (!this.ai) {
      throw new Error('Gemini API key is not configured.');
    }

    // Extract base64 data and mimeType from data URL
    let base64Data = image;
    let mimeType = 'image/jpeg';
    if (image.startsWith('data:')) {
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
    }

    const aspectRatio = (options.aspectRatio as '1:1' | '3:4' | '4:3' | '9:16' | '16:9') || '1:1';
    const style = options.style || 'Auto';

    const response = await this.ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: `Refine this image based on the following instruction: ${prompt}${style !== 'Auto' ? `, style: ${style}` : ''}`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio === '4:3' || aspectRatio === '16:9' || aspectRatio === '9:16' || aspectRatio === '1:1' ? aspectRatio : '1:1',
        },
      },
    });

    const candidates = response.candidates;
    if (candidates && candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const outMime = part.inlineData.mimeType || 'image/png';
          return {
            imageUrl: `data:${outMime};base64,${part.inlineData.data}`,
            provider: 'gemini',
            isDemo: false,
            modelUsed: 'gemini-3.1-flash-lite-image',
            aspectRatio,
            style,
          };
        }
      }
    }

    throw new Error('Gemini image editing did not return image data');
  }
}
