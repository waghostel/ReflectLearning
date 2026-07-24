# ReflectLearning AI Tutor - Architecture

## System Architecture Diagram

```mermaid
graph TB
    subgraph "User Interface Layer"
        A[index.html] --> B[index.tsx]
        B --> C[App.tsx]
        C --> D[UploadPage]
        C --> E[MainPage]
        D --> F[Icons]
        E --> F
    end

    subgraph "Component Layer"
        D --> D1[File Upload UI]
        D --> D2[Text Input UI]
        D --> D3[Voice Recording UI]
        D --> D4[Search Interface]
        
        E --> E1[Sidebar Navigation]
        E --> E2[Content Viewer]
        E --> E3[Chat Interface]
        E --> E4[Editor Interface]
    end

    subgraph "Service Layer"
        G[geminiService.ts]
        G --> G1[Chat Management]
        G --> G2[Image Analysis]
        G --> G3[Content Generation]
        G --> G4[Search & Research]
        G --> G5[Live Audio Streaming]
        G --> G6[Text Refinement]
    end

    subgraph "External Services"
        H[Google Generative AI SDK]
        H --> H1[gemini-flash-lite-latest]
        H --> H2[gemini-2.5-flash-native-audio-preview]
        H --> H3[imagen-4.0-generate-001]
        H --> H4[Google Search API]
    end

    subgraph "Data Flow"
        I[User Input] --> J{Input Type}
        J -->|Files| K[File Processing]
        J -->|Text| L[Text Processing]
        J -->|Voice| M[Audio Processing]
        J -->|Search Query| N[Search Processing]
        
        K --> O[Analysis & Extraction]
        L --> P[Content Refinement]
        M --> Q[Transcription]
        N --> R[Research & Report Generation]
        
        O --> S[Learning Report]
        P --> S
        Q --> S
        R --> S
        
        S --> T[Markdown Parsing]
        T --> U[Section Generation]
        U --> V[Interactive Learning Interface]
    end

    subgraph "State Management"
        W[React Hooks]
        W --> W1[useState - Component State]
        W --> W2[useCallback - Memoized Functions]
        W --> W3[useRef - DOM References]
        W --> W4[useEffect - Side Effects]
    end

    subgraph "Build & Development"
        X[Vite]
        X --> X1[Dev Server :3000]
        X --> X2[Build Pipeline]
        X --> X3[Environment Variables]
        X --> X4[Path Aliases @/*]
    end

    %% Connections between layers
    D --> G
    E --> G
    G --> H
    
    D1 --> K
    D2 --> L
    D3 --> M
    D4 --> N
    
    E1 --> U
    E2 --> V
    E3 --> G1
    E4 --> G6
    
    G1 --> H1
    G2 --> H1
    G3 --> H1
    G4 --> H1
    G4 --> H4
    G5 --> H2
    G6 --> H1
    
    V --> E3
    
    C --> W
    D --> W
    E --> W
    
    B --> X
    
    style A fill:#135bec,color:#fff
    style B fill:#135bec,color:#fff
    style C fill:#135bec,color:#fff
    style G fill:#232f48,color:#fff
    style H fill:#111722,color:#fff
    style S fill:#135bec,color:#fff
    style V fill:#135bec,color:#fff
```

## Component Architecture

```mermaid
graph LR
    subgraph "App.tsx - Root Component"
        A1[Page State Management]
        A2[Chat History State]
        A3[Initial Text State]
        A1 --> A4{Current Page}
        A4 -->|upload| A5[UploadPage]
        A4 -->|main| A6[MainPage]
    end

    subgraph "UploadPage Component"
        B1[File Upload Handler]
        B2[Text Input Handler]
        B3[Voice Recording Handler]
        B4[Search Handler]
        B5[Content Refinement]
        B6[Topic Suggestions]
        
        B1 --> B7[File Analysis]
        B2 --> B8[Text Processing]
        B3 --> B9[Audio Transcription]
        B4 --> B10[Search & Generate Report]
        
        B7 --> B11[onDone Callback]
        B8 --> B11
        B9 --> B11
        B10 --> B11
    end

    subgraph "MainPage Component"
        C1[Sidebar - Chapter Navigation]
        C2[Content Viewer - Markdown Rendering]
        C3[Chat Interface - AI Tutor]
        C4[Editor - Content Editing]
        
        C1 --> C5[Section Selection]
        C2 --> C6[Markdown Parsing]
        C3 --> C7[Message Handling]
        C4 --> C8[Content Rewriting]
        
        C6 --> C9[Section State]
        C9 --> C5
        C9 --> C2
        
        C7 --> C10[Chat History]
        C8 --> C9
    end

    A5 --> B1
    A5 --> B2
    A5 --> B3
    A5 --> B4
    
    A6 --> C1
    A6 --> C2
    A6 --> C3
    A6 --> C4
    
    B11 --> A2
    B11 --> A3
    B11 --> A1
    
    style A1 fill:#135bec,color:#fff
    style A6 fill:#232f48,color:#fff
    style A5 fill:#232f48,color:#fff
    style C9 fill:#135bec,color:#fff
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant UploadPage
    participant GeminiService
    participant GoogleAI
    participant MainPage
    
    User->>UploadPage: Upload Files/Text/Voice
    UploadPage->>GeminiService: analyzeImage() / searchLearningMaterialsStream()
    GeminiService->>GoogleAI: API Request
    GoogleAI-->>GeminiService: Streaming Response
    GeminiService-->>UploadPage: Content Chunks
    UploadPage->>UploadPage: Accumulate Content
    UploadPage->>UploadPage: Parse Markdown
    UploadPage->>MainPage: Navigate with Content
    
    MainPage->>MainPage: Parse Sections
    MainPage->>MainPage: Generate Outline
    
    User->>MainPage: Select Chapter
    MainPage->>MainPage: Update Current Section
    
    User->>MainPage: Send Chat Message
    MainPage->>GeminiService: getTutorResponse()
    GeminiService->>GoogleAI: Chat Request with Context
    GoogleAI-->>GeminiService: AI Response
    GeminiService-->>MainPage: Tutor Message
    MainPage->>MainPage: Update Chat History
    
    User->>MainPage: Edit Chapter
    MainPage->>MainPage: Enable Editor Mode
    User->>MainPage: Save/Rewrite
    MainPage->>GeminiService: rewriteChapterStream()
    GeminiService->>GoogleAI: Rewrite Request
    GoogleAI-->>GeminiService: Streaming Response
    GeminiService-->>MainPage: Updated Content
    MainPage->>MainPage: Update Section State
```

## Service Layer Architecture

```mermaid
graph TB
    subgraph "geminiService.ts"
        A[GoogleGenAI Client]
        
        subgraph "Content Generation"
            B1[searchLearningMaterialsStream]
            B2[refineTextStream]
            B3[rewriteChapterStream]
            B4[rewriteQnAStream]
        end
        
        subgraph "Chat & Interaction"
            C1[createChat]
            C2[sendMessageToChat]
            C3[getTutorResponse]
            C4[refineTutorPrompt]
        end
        
        subgraph "Media Processing"
            D1[analyzeImage]
            D2[generateImage]
            D3[connectLive - Audio]
        end
        
        subgraph "Utilities"
            E1[refineUserPrompt]
            E2[suggestExtendedTopics]
            E3[generateParagraphTitle]
            E4[generateChapterTitle]
        end
    end
    
    A --> B1
    A --> B2
    A --> B3
    A --> B4
    A --> C1
    A --> C2
    A --> C3
    A --> C4
    A --> D1
    A --> D2
    A --> D3
    A --> E1
    A --> E2
    A --> E3
    A --> E4
    
    B1 --> F[Streaming Generator]
    B2 --> F
    B3 --> F
    B4 --> F
    
    C3 --> G[Search Integration]
    B1 --> G
    B2 --> G
    
    D3 --> H[WebRTC Audio Stream]
    
    style A fill:#135bec,color:#fff
    style F fill:#232f48,color:#fff
    style G fill:#232f48,color:#fff
    style H fill:#232f48,color:#fff
```

## State Management Architecture

```mermaid
graph TB
    subgraph "App State"
        A1[currentPage: 'upload' | 'main']
        A2[initialText: string]
        A3[chatHistory: ChatMessage[]]
    end
    
    subgraph "UploadPage State"
        B1[pastedText: string]
        B2[uploadedFiles: UploadFile[]]
        B3[searchQuery: string]
        B4[isSearching: boolean]
        B5[isRecording: boolean]
        B6[isRefining: boolean]
        B7[suggestedTopics: string[]]
        B8[isMarkdownMode: boolean]
    end
    
    subgraph "MainPage State"
        C1[messages: ChatMessage[]]
        C2[userInput: string]
        C3[isLoading: boolean]
        C4[sections: Section[]]
        C5[currentSectionIndex: number]
        C6[reportTitle: string]
        C7[isGenerating: boolean]
        C8[editingSectionIndex: number | null]
        C9[editingContent: string]
        C10[viewMode: 'learning' | 'reflection']
        C11[isSidebarCollapsed: boolean]
    end
    
    subgraph "Section Type"
        D1[id: string]
        D2[type: 'preamble' | 'chapter' | 'conclusion' | 'sources']
        D3[title: string]
        D4[content: string]
    end
    
    A2 --> C4
    A3 --> C1
    
    B1 --> A2
    B2 --> A2
    B3 --> A2
    
    C4 --> D1
    C4 --> D2
    C4 --> D3
    C4 --> D4
    
    C5 --> C4
    C8 --> C4
    
    style A1 fill:#135bec,color:#fff
    style C4 fill:#135bec,color:#fff
    style C1 fill:#232f48,color:#fff
```

## Key Features & Flows

### 1. Upload & Content Generation Flow
- User uploads files (PDF, images, documents) or provides text/URLs
- Files are analyzed using Gemini AI (image analysis, content extraction)
- Search queries trigger web-grounded research
- Content is refined and structured into a comprehensive learning report
- Report is parsed into sections (preamble, chapters, conclusion, sources)

### 2. Interactive Learning Flow
- Sidebar navigation shows chapter outline with progress tracking
- Content viewer renders Markdown with custom components for navigation
- Users can navigate between chapters, edit content, and rewrite sections
- Q&A sections provide structured learning checkpoints

### 3. AI Tutor Chat Flow
- Context-aware chat using current chapter content
- Optional web search integration for up-to-date information
- Message history maintained for conversation continuity
- Support for image generation via `/generate` command
- Prompt refinement to improve user queries

### 4. Voice Interaction Flow
- Live audio streaming using Gemini native audio support
- Real-time transcription of user speech
- Voice-based tutoring with audio responses
- WebRTC integration for microphone access

### 5. Content Editing Flow
- Right-click context menu for chapter actions
- Inline editing with live preview
- AI-powered chapter rewriting
- Q&A section regeneration
- Append chat responses to chapters

## Technology Stack Summary

**Frontend:**
- React 19.2.0 with TypeScript 5.8.2
- Vite 6.2.0 (dev server, build tooling)
- React Markdown with GFM support
- Tailwind-style utility classes

**AI Services:**
- Google Generative AI SDK v1.29.0
- Models: gemini-flash-lite-latest, gemini-2.5-flash-native-audio-preview, imagen-4.0-generate-001
- Features: Chat, streaming, image generation, audio, web search

**State Management:**
- React Hooks (useState, useCallback, useRef, useEffect)
- Component-level state (no external state library)

**Build & Dev:**
- TypeScript with bundler module resolution
- Path aliases (@/* → root)
- Environment variables via .env.local
- Dev server on port 3000
