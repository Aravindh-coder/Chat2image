import { GoogleGenAI } from '@google/genai';

export interface PromptEnhancementResult {
  originalPrompt: string;
  enhancedPrompt: string;
  styleApplied?: string;
}

export interface RefinementResult {
  refinedPrompt: string;
  aiResponse: string;
  changesDetected: string[];
}

class GeminiService {
  private ai: GoogleGenAI | null = null;
  private hasKey: boolean = false;

  constructor() {
    const key = process.env.GEMINI_API_KEY;
    if (key && key.trim() !== '' && key !== 'MY_GEMINI_API_KEY') {
      try {
        this.ai = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
        this.hasKey = true;
        console.log('[GeminiService] Initialized successfully with GEMINI_API_KEY.');
      } catch (err) {
        console.warn('[GeminiService] Failed to initialize GoogleGenAI client:', err);
      }
    } else {
      console.log('[GeminiService] No GEMINI_API_KEY detected. Running in heuristic fallback mode.');
    }
  }

  public isAvailable(): boolean {
    return this.hasKey && this.ai !== null;
  }

  public async enhancePrompt(prompt: string, style?: string): Promise<PromptEnhancementResult> {
    if (!this.ai) {
      return {
        originalPrompt: prompt,
        enhancedPrompt: this.heuristicEnhance(prompt, style),
        styleApplied: style || 'Auto',
      };
    }

    try {
      const systemInstruction = `You are an expert AI prompt engineer specializing in visual image generation (Diffusion, Flux, Midjourney).
Your goal is to transform simple, concise user prompts into rich, vivid, descriptive visual prompts that maximize image quality.
Include descriptive details about lighting, textures, composition, atmosphere, camera perspective, and color palette.
Ensure the core concept remains true to the user's intent.
Do not add introductory or conversational filler. Return ONLY the enhanced visual prompt string.`;

      const userContent = `User Prompt: "${prompt}"\nTarget Style: ${style || 'Auto'}\n\nPlease output the enhanced descriptive prompt.`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userContent,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const enhanced = response.text?.trim() || this.heuristicEnhance(prompt, style);
      return {
        originalPrompt: prompt,
        enhancedPrompt: enhanced,
        styleApplied: style || 'Auto',
      };
    } catch (err) {
      console.warn('[GeminiService] enhancePrompt failed, falling back to heuristic:', err);
      return {
        originalPrompt: prompt,
        enhancedPrompt: this.heuristicEnhance(prompt, style),
        styleApplied: style || 'Auto',
      };
    }
  }

  public async refinePromptWithContext(
    conversationContext: Array<{ role: string; content: string }>,
    basePrompt: string,
    userInstruction: string,
    style?: string
  ): Promise<RefinementResult> {
    if (!this.ai) {
      return this.heuristicRefine(basePrompt, userInstruction, style);
    }

    try {
      const systemInstruction = `You are Chat2Image's conversational image intelligence engine.
A user has previously generated an image with a specific prompt, and now they are giving a natural-language follow-up instruction (e.g. "make the buildings taller and add flying cars", "make it blue", "remove the person", "change the weather to heavy rain", "make it cinematic").
Your job is to:
1. Synthesize a COMPLETE NEW IMAGE PROMPT that preserves the subject and core scene of the previous image while accurately incorporating the user's requested modifications.
2. Provide a short, enthusiastic 1-2 sentence response to the user confirming what you're adjusting (e.g., "I've added futuristic flying cars and raised the skyscrapers with cinematic night lighting for you!").
3. List 1-3 key changes made.

Return your response strictly in JSON format matching this schema:
{
  "refinedPrompt": "Complete descriptive image prompt combining original scene and new changes",
  "aiResponse": "Short 1-2 sentence conversational reply",
  "changes": ["added flying cars", "elevated skyscrapers", "cinematic lighting"]
}`;

      const historySummary = conversationContext
        .slice(-6)
        .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
        .join('\n');

      const userContent = `Previous image prompt: "${basePrompt}"
User follow-up instruction: "${userInstruction}"
Target style: ${style || 'Auto'}

Recent conversation context:
${historySummary}

Synthesize the revised image prompt and conversational response as JSON.`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userContent,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text?.trim() || '';
      const parsed = JSON.parse(text);

      return {
        refinedPrompt: parsed.refinedPrompt || `${basePrompt}, with ${userInstruction}`,
        aiResponse: parsed.aiResponse || `I've updated the image according to your request: "${userInstruction}".`,
        changesDetected: parsed.changes || [userInstruction],
      };
    } catch (err) {
      console.warn('[GeminiService] refinePromptWithContext failed, falling back to heuristic:', err);
      return this.heuristicRefine(basePrompt, userInstruction, style);
    }
  }

  public async generateTitle(firstPrompt: string): Promise<string> {
    if (!this.ai) {
      return this.heuristicTitle(firstPrompt);
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Generate a very short (2 to 4 words), punchy, descriptive title for an image generation conversation starting with prompt: "${firstPrompt}". Do not use quotes, punctuation, or "Title:". Example: "Futuristic City Night"`,
        config: {
          temperature: 0.5,
        },
      });

      const text = response.text?.trim().replace(/["'\n.]/g, '') || '';
      return text.slice(0, 32) || this.heuristicTitle(firstPrompt);
    } catch (err) {
      return this.heuristicTitle(firstPrompt);
    }
  }

  public async generateAssistantGreeting(prompt: string, isImageCreated: boolean): Promise<string> {
    if (!this.ai) {
      return isImageCreated
        ? `Here is your generated image for "${prompt}"! You can continue our conversation to refine, modify, or add details.`
        : `I've prepared your creative visual concept!`;
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `The user just generated an image with prompt: "${prompt}". Write a friendly, 1-sentence AI assistant message presenting the image and inviting them to continue chatting to refine or tweak it.`,
        config: {
          temperature: 0.7,
        },
      });
      return response.text?.trim() || `Here is your creation! What would you like to adjust or add next?`;
    } catch (err) {
      return `Here is your generated image! You can continue our conversation to refine or modify it.`;
    }
  }

  // --- Heuristic fallbacks when Gemini is not configured or fails ---
  private heuristicEnhance(prompt: string, style?: string): string {
    const s = style && style !== 'Auto' ? ` in ${style} aesthetic` : '';
    return `Highly detailed masterwork of ${prompt}${s}, with intricate textures, cinematic volumetric lighting, depth of field, rich color grading, sharp focus, 8k resolution, professional composition`;
  }

  private heuristicRefine(basePrompt: string, instruction: string, style?: string): RefinementResult {
    const refined = `${basePrompt}, modified with: ${instruction}${style && style !== 'Auto' ? `, styled as ${style}` : ''}`;
    return {
      refinedPrompt: refined,
      aiResponse: `Sure thing! I've updated the scene to incorporate "${instruction}". Here is your refined image!`,
      changesDetected: [instruction],
    };
  }

  private heuristicTitle(prompt: string): string {
    const cleaned = prompt.replace(/[^\w\s]/gi, '').trim();
    const words = cleaned.split(/\s+/).slice(0, 4);
    if (words.length === 0) return 'New Creation';
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }
}

export const geminiService = new GeminiService();
