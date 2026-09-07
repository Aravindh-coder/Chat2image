export interface ImageGenerateOptions {
  style?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | string;
  seed?: number;
  width?: number;
  height?: number;
  isRefinement?: boolean;
  referenceImage?: string;
}

export interface ImageResult {
  imageUrl: string;
  provider: string;
  isDemo: boolean;
  modelUsed?: string;
  note?: string;
  aspectRatio: string;
  style: string;
}

export interface ImageProvider {
  getProviderName(): string;
  isAvailable(): boolean;
  supportsImageToImage(): boolean;
  generateImage(prompt: string, options: ImageGenerateOptions): Promise<ImageResult>;
  editImage(image: string, prompt: string, options: ImageGenerateOptions): Promise<ImageResult>;
}
