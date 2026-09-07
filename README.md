# Chat2Image — Conversational AI Image Creation Studio

> A complete, modern AI image generation platform with conversational refinement, intelligent prompt enhancement, SQLite persistence, and a mobile-first responsive interface.

---

## 📌 1. Project Overview

**Chat2Image** is a full-stack AI studio designed to bridge the gap between human language and visual creation. Unlike traditional single-shot generation tools where every adjustment requires re-typing the entire prompt from scratch, Chat2Image allows users to **continue the conversation** after an image is generated.

### The Conversational Differentiator

```
User: "Create a futuristic city at night."
AI:   "Sure! I'll create that for you." [GENERATED IMAGE]

User: "Make the buildings taller and add flying cars."
AI:   "Synthesizing your scene with towering spires and neon hovercraft!" [UPDATED IMAGE]

User: "Make it cinematic."
AI:   "Adjusted atmospheric lighting and cinematic 35mm depth of field!" [UPDATED IMAGE]
```

---

## 💡 2. Problem Statement & Solution

* **The Problem**: Conventional AI image generation tools offer only isolated prompt input boxes. When users want to make incremental adjustments, they must manually re-engineer the prompt, losing previous compositional context and aesthetic consistency.
* **The Solution**: Chat2Image introduces a **Conversational Refinement Engine**. When a user types follow-up instructions, the backend uses Gemini visual intelligence to analyze previous context, merge existing subjects with new instructions, and generate a cohesive refined image.

---

## 🚀 3. Key Features

1. **Conversational Image Refinement**: Contextual multi-turn chat that maintains creative focus across iterations.
2. **Intelligent Prompt Enhancement**: Automatically expands simple concepts into rich descriptions with camera angles, lighting, and textures.
3. **Multi-Style & Aspect Ratio Controls**:
   * Styles: *Auto, Realistic, Cinematic, 3D Render, Anime, Digital Art, Watercolor, Oil Painting, Pixel Art, Fantasy, Minimalist*
   * Aspect Ratios: *1:1 Square, 16:9 Landscape, 9:16 Portrait, 4:3 Classic*
4. **Image Upload & Reference Edit**: Upload PNG, JPG, or WEBP photos to guide or modify existing artwork.
5. **Interactive Actions**:
   * Download high-resolution outputs
   * 1-click prompt copying
   * Regenerate variations
   * Fullscreen zoom modal
   * Use as reference for subsequent edits
6. **SQLite Persistence**: Complete conversation sessions, prompts, and generation history stored in SQLite (`sql.js`).
7. **Zero-Cost Operation & Demo Mode**: Runs completely free with **Pollinations AI** or standalone **Demo Mode** with watermarked SVG visuals. No credit card required.
8. **Mobile-First Design**: Optimized touch controls and fluid layouts tested on standard Android viewports (360px, 390px, 430px).

---

## 🛠️ 4. Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Express.js, Node.js, Multer (file uploads), esbuild |
| **AI Reasoning** | Google Gen AI SDK (`gemini-3.8-flash`) |
| **Image Engine** | Modular `ImageProvider` (Pollinations AI, Gemini, Demo Mode) |
| **Database** | SQLite via `sql.js` with filesystem persistence |

---

## 🏛️ 5. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React 18 Frontend                    │
│   (Studio Chat, Gallery, History, Settings, About)      │
└────────────────────────────┬────────────────────────────┘
                             │ HTTP / JSON & Multipart
┌────────────────────────────▼────────────────────────────┐
│                   Express.js Backend                    │
│            (/api/chat, /api/generate, /api/upload)      │
└───────────────┬─────────────────────────┬───────────────┘
                │                         │
┌───────────────▼──────────────┐ ┌────────▼───────────────┐
│        Gemini Service        │ │   Modular ImageService │
│  - Prompt Enhancement        │ │  ├─ PollinationsProvider
│  - Conversational Refinement │ │  ├─ GeminiImageProvider│
│  - Heuristic Fallbacks       │ │  └─ DemoProvider (SVG) │
└───────────────┬──────────────┘ └────────┬───────────────┘
                │                         │
┌───────────────▼─────────────────────────▼───────────────┐
│                   SQLite Database                       │
│        (conversations, messages, generations)           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 6. Environment Variables

All secrets remain server-side and are configured in `.env`:

```env
# Optional Gemini API key for prompt enhancement & conversation reasoning
GEMINI_API_KEY=

# Preferred Image Provider: 'pollinations', 'gemini', or 'demo'
IMAGE_PROVIDER=pollinations

# Optional dedicated image generation API key
IMAGE_API_KEY=

# Path to SQLite database file
DATABASE_PATH=./data/chat2image.sqlite
```

---

## 🎓 7. College Viva Q&A Guide

### Q1: What is the main difference between single-shot generation and conversational refinement?
> **Answer**: Single-shot generation treats every request in total isolation. In contrast, conversational refinement preserves conversational history. When a user submits an instruction like *"add flying cars"*, our backend analyzes the previous generation's prompt and scene, synthesizing a new composite prompt that retains the original architecture while introducing the aerial vehicles.

### Q2: How does the application avoid vendor lock-in for image generation?
> **Answer**: The backend implements the **Strategy Pattern** via the `ImageProvider` TypeScript interface (`generateImage`, `editImage`, `getProviderName`, `isAvailable`). We can swap between Pollinations, Gemini, or custom image microservices without modifying our Express routes or React UI.

### Q3: How does the application guarantee zero financial cost?
> **Answer**: The default provider is **Pollinations AI**, an open image generation API that requires no paid subscriptions or billing setups. If network access fails or no API keys are present, the system automatically falls back to **Demo Mode**, which generates synthetic SVG previews marked with a visible *"DEMO PREVIEW"* watermark.

### Q4: How is API key security maintained?
> **Answer**: All API keys reside exclusively in backend environment variables (`process.env`). The client bundle (React/Vite) contains zero API keys and only communicates with internal `/api/*` endpoints.

---

## 📜 License
MIT License — Created for Academic & Educational Demonstration.
