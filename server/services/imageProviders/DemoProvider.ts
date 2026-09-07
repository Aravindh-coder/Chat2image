import { ImageProvider, ImageGenerateOptions, ImageResult } from './ImageProvider.js';

export class DemoProvider implements ImageProvider {
  public getProviderName(): string {
    return 'demo';
  }

  public isAvailable(): boolean {
    return true; // Always available
  }

  public supportsImageToImage(): boolean {
    return false;
  }

  public async generateImage(prompt: string, options: ImageGenerateOptions): Promise<ImageResult> {
    const aspectRatio = options.aspectRatio || '1:1';
    const style = options.style || 'Auto';
    const seed = options.seed || Math.floor(Math.random() * 1000000);

    // Dimensions for SVG based on aspect ratio
    let width = 800;
    let height = 800;
    if (aspectRatio === '16:9') {
      width = 960;
      height = 540;
    } else if (aspectRatio === '9:16') {
      width = 540;
      height = 960;
    } else if (aspectRatio === '4:3') {
      width = 800;
      height = 600;
    }

    // Color palettes based on style
    const palette = this.getStylePalette(style);
    const escapedPrompt = this.escapeXml(prompt.slice(0, 140));

    // Create an explicit, elegant visual demonstration card (SVG Data URI)
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.bg1}" />
      <stop offset="50%" stop-color="${palette.bg2}" />
      <stop offset="100%" stop-color="${palette.bg3}" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="${palette.accent}" stop-opacity="0.3" />
      <stop offset="100%" stop-color="${palette.bg1}" stop-opacity="0" />
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
  <rect width="${width}" height="${height}" fill="url(#glow)" />
  <rect width="${width}" height="${height}" fill="url(#grid)" />

  <!-- Abstract Geometry representing generative composition -->
  <g opacity="0.4">
    <circle cx="${width * 0.5}" cy="${height * 0.42}" r="${Math.min(width, height) * 0.28}" fill="none" stroke="${palette.accent}" stroke-width="2" stroke-dasharray="8 6" />
    <circle cx="${width * 0.5}" cy="${height * 0.42}" r="${Math.min(width, height) * 0.18}" fill="none" stroke="${palette.accent2}" stroke-width="1.5" />
    <polygon points="${width * 0.5},${height * 0.2} ${width * 0.68},${height * 0.52} ${width * 0.32},${height * 0.52}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
  </g>

  <!-- Top Demo Banner Ribbon -->
  <rect x="${width * 0.08}" y="${height * 0.08}" width="${width * 0.84}" height="42" rx="8" fill="rgba(245, 158, 11, 0.18)" stroke="#f59e0b" stroke-width="1.5" />
  <text x="${width * 0.5}" y="${height * 0.08 + 26}" fill="#fbbf24" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" text-anchor="middle" letter-spacing="1">
    ★ DEMO PREVIEW (DEMO MODE) ★
  </text>

  <!-- Center Artwork Info Box -->
  <g transform="translate(${width * 0.1}, ${height * 0.35})">
    <rect width="${width * 0.8}" height="${height * 0.4}" rx="12" fill="rgba(15, 23, 42, 0.8)" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1" filter="drop-shadow(0 10px 15px rgba(0,0,0,0.5))" />
    
    <!-- Badges -->
    <rect x="20" y="20" width="90" height="24" rx="12" fill="${palette.accent}" fill-opacity="0.25" stroke="${palette.accent}" stroke-width="1" />
    <text x="65" y="36" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="600" text-anchor="middle">${style}</text>

    <rect x="120" y="20" width="80" height="24" rx="12" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
    <text x="160" y="36" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="500" text-anchor="middle">${aspectRatio}</text>

    <!-- Prompt Quote -->
    <text x="24" y="80" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12" font-weight="600" text-transform="uppercase" letter-spacing="1">Prompt Concept</text>
    <text x="24" y="110" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="16" font-weight="500" width="${width * 0.72}">
      "${escapedPrompt}${prompt.length > 140 ? '...' : ''}"
    </text>

    <!-- Demo Disclaimer -->
    <text x="24" y="${height * 0.4 - 24}" fill="#f59e0b" font-family="system-ui, sans-serif" font-size="13" font-weight="500">
      Add an image-generation API key to enable live AI image generation.
    </text>
  </g>

  <!-- Bottom watermark -->
  <text x="${width * 0.5}" y="${height * 0.94}" fill="rgba(148, 163, 184, 0.7)" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">
    Chat2Image Studio • Simulated Preview • Seed: ${seed}
  </text>
</svg>
    `.trim();

    const base64Svg = Buffer.from(svg).toString('base64');
    const imageUrl = `data:image/svg+xml;base64,${base64Svg}`;

    return {
      imageUrl,
      provider: 'demo',
      isDemo: true,
      note: 'Demo Mode: Add an image-generation API key to enable real AI image generation.',
      aspectRatio,
      style,
    };
  }

  public async editImage(image: string, prompt: string, options: ImageGenerateOptions): Promise<ImageResult> {
    return this.generateImage(prompt, { ...options, isRefinement: true, referenceImage: image });
  }

  private getStylePalette(style: string) {
    switch (style.toLowerCase()) {
      case 'cyberpunk':
      case 'cinematic':
        return { bg1: '#090a0f', bg2: '#0d1527', bg3: '#1e112a', accent: '#38bdf8', accent2: '#f43f5e' };
      case 'anime':
        return { bg1: '#1a102f', bg2: '#2b1b54', bg3: '#4c1d95', accent: '#ec4899', accent2: '#8b5cf6' };
      case 'watercolor':
        return { bg1: '#132e35', bg2: '#1e4853', bg3: '#2d6a78', accent: '#34d399', accent2: '#67e8f9' };
      case '3d render':
        return { bg1: '#0f172a', bg2: '#1e293b', bg3: '#334155', accent: '#a855f7', accent2: '#38bdf8' };
      case 'fantasy':
        return { bg1: '#190a28', bg2: '#2c1245', bg3: '#45176d', accent: '#fbbf24', accent2: '#e879f9' };
      case 'pixel art':
        return { bg1: '#18181b', bg2: '#27272a', bg3: '#3f3f46', accent: '#22c55e', accent2: '#eab308' };
      default:
        return { bg1: '#0b0f19', bg2: '#111827', bg3: '#1f2937', accent: '#6366f1', accent2: '#a855f7' };
    }
  }

  private escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }
}
