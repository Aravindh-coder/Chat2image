import { ImageProvider, ImageGenerateOptions, ImageResult } from './ImageProvider.js';

export class PollinationsProvider implements ImageProvider {
  public getProviderName(): string {
    return 'pollinations';
  }

  public isAvailable(): boolean {
    return true; // Free, open API
  }

  public supportsImageToImage(): boolean {
    return false; // Uses prompt-based contextual synthesis
  }

  public async generateImage(prompt: string, options: ImageGenerateOptions): Promise<ImageResult> {
    const aspectRatio = options.aspectRatio || '1:1';
    const style = options.style || 'Auto';
    const seed = options.seed || Math.floor(Math.random() * 1000000);

    const dimensions = this.resolveDimensions(aspectRatio);
    const styledPrompt = this.applyStyleToPrompt(prompt, style);

    // Pollinations AI API format
    const encodedPrompt = encodeURIComponent(styledPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dimensions.width}&height=${dimensions.height}&seed=${seed}&nologo=true`;

    return {
      imageUrl,
      provider: 'pollinations',
      isDemo: false,
      modelUsed: 'Flux / Pollinations AI',
      aspectRatio,
      style,
      note: 'Generated using free AI Image Provider (Pollinations Flux)',
    };
  }

  public async editImage(image: string, prompt: string, options: ImageGenerateOptions): Promise<ImageResult> {
    // Conversational refinement synthesis: incorporate conversational guidance
    const refinedPrompt = `Refined version: ${prompt}`;
    return this.generateImage(refinedPrompt, { ...options, isRefinement: true, referenceImage: image });
  }

  private resolveDimensions(aspectRatio: string): { width: number; height: number } {
    switch (aspectRatio) {
      case '16:9':
        return { width: 1280, height: 720 };
      case '9:16':
        return { width: 720, height: 1280 };
      case '4:3':
        return { width: 1024, height: 768 };
      case '1:1':
      default:
        return { width: 1024, height: 1024 };
    }
  }

  private applyStyleToPrompt(prompt: string, style: string): string {
    const styleModifiers: Record<string, string> = {
      'realistic': 'photorealistic, ultra-high detail, professional photography, natural lighting, 8k resolution',
      'cinematic': 'cinematic shot, 35mm photograph, dramatic atmospheric lighting, depth of field, anamorphic lens',
      '3d render': 'unreal engine 5, octane render, 3D digital art, raytracing, smooth textures',
      'anime': 'modern anime aesthetic, vibrant studio ghibli and makoto shinkai style, crisp line work',
      'digital art': 'concept art, trending on artstation, digital illustration, smooth shading',
      'watercolor': 'delicate watercolor painting, soft pigment washes, paper texture, expressive brushstrokes',
      'oil painting': 'classic oil painting on canvas, heavy impasto, rich textured brush strokes, artistic masterpiece',
      'pixel art': 'detailed 16-bit pixel art, retro gaming aesthetic, vibrant palette, clean sprites',
      'fantasy': 'high fantasy concept art, mystical glow, ethereal lighting, mythical ambiance, intricate details',
      'minimalist': 'minimalist design, clean shapes, high contrast, elegant negative space, subtle tones',
    };

    const modifier = styleModifiers[style.toLowerCase()];
    if (modifier && style.toLowerCase() !== 'auto') {
      return `${prompt}, in ${style} style, ${modifier}`;
    }
    return prompt;
  }
}
