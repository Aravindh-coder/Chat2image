import { Router, Request, Response } from 'express';
import multer from 'multer';
import { database } from '../database/db.js';
import { geminiService } from '../services/geminiService.js';
import { imageService } from '../services/imageService.js';

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG, JPG, JPEG, and WEBP images are supported.'));
    }
  },
});

export const apiRouter = Router();

// --- GET /api/health ---
apiRouter.get('/health', (req: Request, res: Response) => {
  const imageStatus = imageService.getStatus();
  const geminiAvailable = geminiService.isAvailable();

  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      gemini: {
        connected: geminiAvailable,
        statusText: geminiAvailable ? 'Connected' : 'Not Configured (Fallback Mode)',
      },
      imageProvider: {
        active: imageStatus.activeProvider,
        isDemo: imageStatus.isDemo,
        availableProviders: imageStatus.providers,
        message: imageStatus.message,
      },
    },
  });
});

// --- POST /api/chat ---
apiRouter.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      conversationId: rawConvId,
      message,
      style = 'Auto',
      aspectRatio = '1:1',
      enhancePrompt = true,
      provider,
      referenceImage,
    } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      res.status(400).json({ success: false, error: 'Message cannot be empty.' });
      return;
    }

    const cleanMessage = message.trim();
    let convId = rawConvId;

    // 1. Ensure conversation exists
    if (!convId) {
      const initialTitle = await geminiService.generateTitle(cleanMessage);
      const newConv = database.createConversation(initialTitle);
      convId = newConv.id;
    } else {
      const existing = database.getConversation(convId);
      if (!existing.conversation) {
        const newConv = database.createConversation('Chat Session', convId);
        convId = newConv.id;
      }
    }

    // 2. Save user message
    const userMsg = database.addMessage({
      conversation_id: convId,
      role: 'user',
      content: cleanMessage,
      image_url: referenceImage || null,
    });

    // 3. Check for conversational refinement context
    const { messages } = database.getConversation(convId);
    // Find the latest previous assistant message that had an image
    const previousImageMessages = messages.filter(
      (m) => m.role === 'assistant' && (m.image_url || m.generation_id) && m.id !== userMsg.id
    );
    const lastImageMsg = previousImageMessages[previousImageMessages.length - 1];

    let targetPrompt = cleanMessage;
    let enhancedPromptText: string | null = null;
    let aiResponseText = '';
    let isRefinement = false;
    let refImgUrl = referenceImage || (lastImageMsg ? lastImageMsg.image_url : null);

    if (lastImageMsg && lastImageMsg.original_prompt) {
      // Conversational refinement!
      isRefinement = true;
      const historySummary = messages.map((m) => ({ role: m.role, content: m.content }));
      const basePrompt = lastImageMsg.enhanced_prompt || lastImageMsg.original_prompt;

      const refinement = await geminiService.refinePromptWithContext(
        historySummary,
        basePrompt,
        cleanMessage,
        style
      );
      targetPrompt = refinement.refinedPrompt;
      enhancedPromptText = refinement.refinedPrompt;
      aiResponseText = refinement.aiResponse;
    } else {
      // Fresh generation
      if (enhancePrompt) {
        const enhancement = await geminiService.enhancePrompt(cleanMessage, style);
        targetPrompt = enhancement.enhancedPrompt;
        enhancedPromptText = enhancement.enhancedPrompt;
      }
      aiResponseText = await geminiService.generateAssistantGreeting(cleanMessage, true);
    }

    // 4. Generate Image via ImageProvider abstraction
    const imageResult = refImgUrl
      ? await imageService.edit(
          refImgUrl,
          targetPrompt,
          { style, aspectRatio, isRefinement: true },
          provider
        )
      : await imageService.generate(
          targetPrompt,
          { style, aspectRatio, isRefinement },
          provider
        );

    // 5. Store Generation record
    const generation = database.addGeneration({
      conversation_id: convId,
      prompt: cleanMessage,
      enhanced_prompt: enhancedPromptText,
      image_url: imageResult.imageUrl,
      style: imageResult.style || style,
      aspect_ratio: imageResult.aspectRatio || aspectRatio,
      provider: imageResult.provider,
      is_demo: imageResult.isDemo ? 1 : 0,
    });

    // 6. Save Assistant message with image metadata
    const assistantMsg = database.addMessage({
      conversation_id: convId,
      role: 'assistant',
      content: aiResponseText,
      image_url: imageResult.imageUrl,
      generation_id: generation.id,
      original_prompt: cleanMessage,
      enhanced_prompt: enhancedPromptText,
      style: imageResult.style || style,
      aspect_ratio: imageResult.aspectRatio || aspectRatio,
    });

    res.json({
      success: true,
      data: {
        conversationId: convId,
        userMessage: userMsg,
        assistantMessage: assistantMsg,
        generation,
        isDemo: imageResult.isDemo,
        note: imageResult.note,
      },
    });
  } catch (err: unknown) {
    console.error('Error in /api/chat:', err);
    const errMsg = err instanceof Error ? err.message : 'Failed to process message';
    res.status(500).json({ success: false, error: errMsg });
  }
});

// --- POST /api/generate ---
apiRouter.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, style = 'Auto', aspectRatio = '1:1', enhancePrompt = true, provider, conversationId } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      res.status(400).json({ success: false, error: 'Prompt is required.' });
      return;
    }

    let finalPrompt = prompt.trim();
    let enhancedPrompt: string | null = null;

    if (enhancePrompt) {
      const res = await geminiService.enhancePrompt(finalPrompt, style);
      enhancedPrompt = res.enhancedPrompt;
      finalPrompt = res.enhancedPrompt;
    }

    const imageResult = await imageService.generate(finalPrompt, { style, aspectRatio }, provider);

    const generation = database.addGeneration({
      conversation_id: conversationId || null,
      prompt: prompt.trim(),
      enhanced_prompt: enhancedPrompt,
      image_url: imageResult.imageUrl,
      style: imageResult.style || style,
      aspect_ratio: imageResult.aspectRatio || aspectRatio,
      provider: imageResult.provider,
      is_demo: imageResult.isDemo ? 1 : 0,
    });

    res.json({
      success: true,
      data: {
        generation,
        isDemo: imageResult.isDemo,
        note: imageResult.note,
      },
    });
  } catch (err: unknown) {
    console.error('Error in /api/generate:', err);
    const errMsg = err instanceof Error ? err.message : 'Image generation failed';
    res.status(500).json({ success: false, error: errMsg });
  }
});

// --- POST /api/edit-image ---
apiRouter.post('/edit-image', async (req: Request, res: Response): Promise<void> => {
  try {
    const { image, prompt, style = 'Auto', aspectRatio = '1:1', provider, conversationId } = req.body;

    if (!image || !prompt) {
      res.status(400).json({ success: false, error: 'Both image and prompt are required for editing.' });
      return;
    }

    const imageResult = await imageService.edit(image, prompt.trim(), { style, aspectRatio }, provider);

    const generation = database.addGeneration({
      conversation_id: conversationId || null,
      prompt: prompt.trim(),
      enhanced_prompt: null,
      image_url: imageResult.imageUrl,
      style: imageResult.style || style,
      aspect_ratio: imageResult.aspectRatio || aspectRatio,
      provider: imageResult.provider,
      is_demo: imageResult.isDemo ? 1 : 0,
    });

    res.json({
      success: true,
      data: {
        generation,
        isDemo: imageResult.isDemo,
        note: imageResult.note,
      },
    });
  } catch (err: unknown) {
    console.error('Error in /api/edit-image:', err);
    const errMsg = err instanceof Error ? err.message : 'Image editing failed';
    res.status(500).json({ success: false, error: errMsg });
  }
});

// --- POST /api/upload ---
apiRouter.post('/upload', upload.single('image'), (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No image file uploaded.' });
      return;
    }

    const base64 = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

    res.json({
      success: true,
      data: {
        imageUrl: dataUrl,
        filename: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  } catch (err: unknown) {
    console.error('Error in /api/upload:', err);
    const errMsg = err instanceof Error ? err.message : 'Upload failed';
    res.status(500).json({ success: false, error: errMsg });
  }
});

// --- Conversations API ---
apiRouter.get('/conversations', (req: Request, res: Response) => {
  try {
    const list = database.getConversations();
    res.json({ success: true, data: list });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to retrieve conversations';
    res.status(500).json({ success: false, error: errMsg });
  }
});

apiRouter.get('/conversations/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const result = database.getConversation(id);
    if (!result.conversation) {
      res.status(404).json({ success: false, error: 'Conversation not found' });
      return;
    }
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to retrieve conversation';
    res.status(500).json({ success: false, error: errMsg });
  }
});

apiRouter.post('/conversations', (req: Request, res: Response) => {
  try {
    const { title = 'New Creation' } = req.body;
    const conv = database.createConversation(title);
    res.json({ success: true, data: conv });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to create conversation';
    res.status(500).json({ success: false, error: errMsg });
  }
});

apiRouter.put('/conversations/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    if (!title) {
      res.status(400).json({ success: false, error: 'Title is required' });
      return;
    }
    const updated = database.updateConversation(id, title.trim());
    res.json({ success: true, data: { updated } });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to update conversation';
    res.status(500).json({ success: false, error: errMsg });
  }
});

apiRouter.delete('/conversations/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = database.deleteConversation(id);
    res.json({ success: true, data: { deleted } });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to delete conversation';
    res.status(500).json({ success: false, error: errMsg });
  }
});

// --- Gallery API ---
apiRouter.get('/gallery', (req: Request, res: Response) => {
  try {
    const { style, search, limit, offset } = req.query;
    const items = database.getGallery({
      style: typeof style === 'string' ? style : undefined,
      search: typeof search === 'string' ? search : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    });
    res.json({ success: true, data: items });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to retrieve gallery';
    res.status(500).json({ success: false, error: errMsg });
  }
});

apiRouter.delete('/gallery/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = database.deleteGeneration(id);
    res.json({ success: true, data: { deleted } });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to delete gallery item';
    res.status(500).json({ success: false, error: errMsg });
  }
});
