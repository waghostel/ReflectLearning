## Tech Stack

**Framework & Build System:**
- React 19.2.0 with TypeScript 5.8.2
- Vite 6.2.0 for build tooling and dev server
- Path aliases configured: `@/*` maps to project root

**AI & Services:**
- Google Generative AI SDK (`@google/genai` v1.29.0)
- Gemini models: `gemini-flash-lite-latest`, `gemini-2.5-flash-native-audio-preview`, `imagen-4.0-generate-001`
- Live audio streaming with native audio support

**UI & Rendering:**
- React Markdown with GitHub Flavored Markdown (GFM) support
- Custom Markdown components for navigation and anchors
- Material Symbols icons

**Environment:**
- API key managed via `.env.local` file
- Environment variables injected at build time via Vite config
- Dev server runs on port 3000

## Common Commands

```bash
# Install dependencies
npm install

# Run development server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Configuration Notes

- TypeScript uses `bundler` module resolution with path aliases
- JSX transform: `react-jsx`
- Experimental decorators enabled
- API key accessed via `process.env.API_KEY` or `process.env.GEMINI_API_KEY`
