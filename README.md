
# Shotblockr — 3D + AI Storyboarding  
> Exploring a faster, more creative workflow for animated storytelling.

## 🎬 Overview

Shotblockr is an early-stage prototype built with the Flux Kontext[max] API. It explores how 3D tools and AI can work together to streamline the storyboarding process for animated films.

### Key Features

- **3D Scene Builder** – Upload and position custom 3D character models (GLB/GLTF)
- **AI Image Generation** – Generate scenes from reference images using AI
- **Iterative Refinement** – Apply AI editing to enhance and refine generated images


## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shotblockr
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Add to your environment or .env file
   REPLICATE_API_TOKEN=your_replicate_api_token_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   npx tsx index.ts
   ```

5. **Open your browser**
   ```
   http://localhost:5000/app
   ```

## 📖 Workflow

1. **Add Characters**
   - Click the "Add Character" button in the top-right corner
   - Choose from default characters or upload custom GLB/GLTF files
   - Use the animation slider to set character poses

2. **Position Characters**
   - Use the 3D viewport to position characters in your scene
   - Adjust camera angles with the camera controls
   - Rotate and scale or fine tuning

3. **Choose Background Reference**
   - Upload custom reference image (up to 10MB)
   - Background serves as reference for AI generation

4. **Generate Images**
   - Click "Generate Shot" to create AI-powered scene images
   - Choose aspect ratio (16:9 landscape or 9:16 portrait)

5. **Refine Results**
   - Use the refine feature to enhance generated images
   - Apply iterative improvements with AI editing
   - Download final results 

## 🏝️ Interface
## 🏝️ Interface

![Shotblockr Screenshot](examples/shotblockr_screenshot.png)

## 🛠️ Architecture

- Node.js + TypeScript
- Babylon.js
- Replicate API - Flux Kontext[max]
- Multi-image Generation: `flux-kontext-apps/multi-image-kontext-max`
- Image Refinement: `black-forest-labs/flux-kontext-max`

```
public/
├── app/
│   ├── index.html      # Main 3D application
│   ├── babylon-stage.js # 3D scene management
│   ├── shot.js         # UI and scene controls
│   └── ai.js           # AI generation workflow
├── styles.css          # Unified styling system
├── assets/             # Dummy character models and images
├── scenes/             # Dummy background reference images
└── expressions/        # Character expression textures
```

## ⚠️ Limitations & Possible Improvements
- Built with Replit – initial prototype; requires refactoring for better performance and maintainability.
- AI multi-image limitations – limited by current model capabilities. Could benefit from more advanced prompting or agentic systems.
- Basic 3D file support – GLB imports work, but need smarter handling.
- No mobile or tablet support – currently optimized only for desktop use.