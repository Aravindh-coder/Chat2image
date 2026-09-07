import { ImageProvider, ImageGenerateOptions, ImageResult } from './imageProviders/ImageProvider.js';
import { DemoProvider } from './imageProviders/DemoProvider.js';
import { PollinationsProvider } from './imageProviders/PollinationsProvider.js';
import { GeminiImageProvider } from './imageProviders/GeminiImageProvider.js';

class ImageService {
  private providers: Map<string, ImageProvider> = new Map();
  private defaultProviderName: string = 'pollinations';

  constructor() {
    this.registerProvider(new DemoProvider());
    this.registerProvider(new PollinationsProvider());
    this.registerProvider(new GeminiImageProvider());

    const envProvider = process.env.IMAGE_PROVIDER?.toLowerCase();
    if (envProvider && this.providers.has(envProvider)) {
      this.defaultProviderName = envProvider;
    } else if (!process.env.GEMINI_API_KEY && !process.env.IMAGE_API_KEY) {
      // Free default: pollinations or demo
      this.defaultProviderName = 'pollinations';
    }
    console.log(`[ImageService] Initialized with default provider: ${this.defaultProviderName}`);
  }

  public registerProvider(provider: ImageProvider): void {
    this.providers.set(provider.getProviderName().toLowerCase(), provider);
  }

  public getProvider(name?: string): ImageProvider {
    const target = (name || this.defaultProviderName).toLowerCase();
    const provider = this.providers.get(target);

    if (provider && provider.isAvailable()) {
      return provider;
    }

    // Fallback: If requested provider isn't available, try pollinations
    const pollinations = this.providers.get('pollinations');
    if (pollinations && pollinations.isAvailable()) {
      return pollinations;
    }

    // Final fallback: DemoProvider is always available
    return this.providers.get('demo')!;
  }

  public async generate(prompt: string, options: ImageGenerateOptions, providerName?: string): Promise<ImageResult> {
    const provider = this.getProvider(providerName);
    console.log(`[ImageService] Generating image with provider: ${provider.getProviderName()}`);

    try {
      return await provider.generateImage(prompt, options);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[ImageService] Provider ${provider.getProviderName()} failed: ${errMsg}. Falling back to Demo Mode.`);
      const demo = this.providers.get('demo')!;
      return await demo.generateImage(prompt, {
        ...options,
        isRefinement: options.isRefinement,
      });
    }
  }

  public async edit(image: string, prompt: string, options: ImageGenerateOptions, providerName?: string): Promise<ImageResult> {
    const provider = this.getProvider(providerName);
    console.log(`[ImageService] Editing image with provider: ${provider.getProviderName()}`);

    try {
      if (provider.supportsImageToImage()) {
        return await provider.editImage(image, prompt, options);
      } else {
        // Synthesizes a refined prompt maintaining previous context
        return await provider.generateImage(prompt, {
          ...options,
          isRefinement: true,
          referenceImage: image,
        });
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[ImageService] Edit failed on ${provider.getProviderName()}: ${errMsg}. Falling back to Demo Mode.`);
      const demo = this.providers.get('demo')!;
      return await demo.editImage(image, prompt, options);
    }
  }

  public getStatus() {
    const active = this.getProvider();
    const isDemo = active.getProviderName() === 'demo';

    return {
      activeProvider: active.getProviderName(),
      isDemo,
      providers: Array.from(this.providers.entries()).map(([name, p]) => ({
        name,
        available: p.isAvailable(),
        supportsImageToImage: p.supportsImageToImage(),
      })),
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      hasImageKey: Boolean(process.env.IMAGE_API_KEY),
      message: isDemo
        ? 'Demo Mode Active. Add an image-generation API key to enable real AI image generation, or switch to Pollinations AI.'
        : `Active Image Provider: ${active.getProviderName().toUpperCase()} (Ready)`,
    };
  }
}

export const imageService = new ImageService();
