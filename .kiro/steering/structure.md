## Project Structure

```
/
├── components/          # React components
│   ├── Icons.tsx       # Icon components (Logo, etc.)
│   ├── MainPage.tsx    # Main learning interface with chat and content
│   └── UploadPage.tsx  # File upload and initial setup
├── services/           # External service integrations
│   └── geminiService.ts # Google Gemini AI API wrapper
├── user-needs/         # User requirements and templates
│   └── page-templates/ # Page template definitions
├── docs/              # Documentation (empty)
├── App.tsx            # Root component with page routing
├── index.tsx          # React app entry point
├── types.ts           # TypeScript type definitions
├── index.html         # HTML entry point
├── metadata.json      # App metadata and permissions
├── vite.config.ts     # Vite configuration
└── tsconfig.json      # TypeScript configuration
```

## Architecture Patterns

**Component Organization:**
- Page-level components in `/components` (MainPage, UploadPage)
- Shared UI components also in `/components` (Icons)
- Service layer in `/services` for API interactions

**State Management:**
- React hooks (useState, useCallback, useRef, useEffect)
- State lifted to parent components (App.tsx manages page navigation)
- No external state management library

**Data Flow:**
- Upload → Process → Generate Report → Interactive Learning
- Chat history maintained in component state
- Sections parsed from markdown content (single source of truth)

**Key Concepts:**
- `Page` type: 'upload' | 'main' for navigation
- `Section` objects: parsed from markdown with type classification (preamble, chapter, conclusion, sources)
- `ChatMessage` interface: user/ai messages with optional images
- Streaming responses for real-time content generation

## Conventions

**File Naming:**
- PascalCase for React components (MainPage.tsx)
- camelCase for services (geminiService.ts)
- lowercase for config files (vite.config.ts)

**Styling:**
- Tailwind-style utility classes inline
- Custom color palette: `#111722` (bg), `#232f48` (secondary), `#135bec` (accent)
- Font: Lexend (primary), Inter (UI elements)

**Markdown Structure:**
- H1 (`#`) for report title
- H2 (`##`) for chapters
- H3 (`###`) for subchapters and Q&A
- H4 (`####`) for Q&A questions
- Anchor links use slugified headings
