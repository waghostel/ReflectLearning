
## Project name
A one sentence slogan
ReflectLearning: Learn Smarter Through AI-Powered Reflection

---

## Elevator pitch
Provide a short tagline for the project. You can change this later.

Transform any learning material into an interactive AI tutor experience with personalized reports, voice chat, and adaptive Q&A sessions that help you truly understand and retain knowledge.

---
## About the project
Be sure to write what inspired you, what you learned, how you built your project, and the challenges you faced. Format your story in Markdown, with LaTeX support for math.

### Inspiration

Traditional learning often feels passive—reading materials without truly engaging with them. We wanted to create an active learning experience where AI doesn't just present information but becomes a personalized tutor that adapts to your understanding, asks questions, and helps you reflect on what you've learned. The goal was to bridge the gap between consuming content and truly mastering it.

### What it does

ReflectLearning transforms any learning material (PDFs, documents, images, text, or URLs) into an interactive AI-powered learning experience:

- **Smart Content Processing**: Upload files or paste text, and the AI generates a comprehensive, structured learning report with chapters, Q&A sections, and sources
- **Interactive AI Tutor**: Chat with an AI tutor that has full context of your learning material and can answer questions, provide explanations, and generate visual aids
- **Voice-Based Learning**: Use native audio streaming to have natural voice conversations with your AI tutor
- **Active Reflection Mode**: Switch to an AI coach that proactively asks questions, displays them on a dynamic whiteboard, and guides you through mastery with intelligent questioning
- **Persistent Memory System**: Tracks your understanding per chapter—what you've mastered, what you're struggling with, and your interests—ensuring personalized, non-repetitive sessions
- **Guided Learning Flow**: Warm-up greetings with clickable suggestions, closed-loop evaluation cycles, and adaptive hints that respond to your progress
- **Adaptive Content**: Edit chapters, rewrite sections, append new paragraphs from chat responses, and regenerate Q&A sections on demand
- **Web Search Integration**: Toggle web search to enrich content with up-to-date information from the internet
- **Structured Navigation**: Navigate through chapters with a sidebar, track your progress, and jump to specific sections

### How we built it

**Frontend Architecture:**
- Built with React 19 and TypeScript for type-safe, modern component architecture
- Vite for lightning-fast development and optimized production builds
- Custom Markdown rendering with react-markdown and GitHub Flavored Markdown support
- Responsive UI with Tailwind-style utility classes and custom color palette

**AI Integration:**
- Google Generative AI SDK with multiple Gemini models:
  - `gemini-flash-lite-latest` for text generation and chat
  - `gemini-2.5-flash-native-audio-preview` for voice interactions
  - `imagen-4.0-generate-001` for image generation
- Streaming responses for real-time content generation
- Live audio streaming with native audio support using Web Audio API
- Context-aware prompting with chapter content and chat history

**Key Technical Features:**
- Real-time streaming content generation with async generators
- Dynamic section parsing from Markdown with type classification
- Resizable panels with drag-to-resize functionality
- Audio processing with ScriptProcessorNode for microphone input
- Context menus for chapter editing and content manipulation
- Automatic anchor link generation for navigation
- Persistent memory system for tracking per-chapter learning progress
- Mode switching between passive learning and active reflection
- Dynamic whiteboard display for focused question-answer sessions

### Challenges we ran into

**Audio Streaming Complexity**: Implementing real-time voice chat required deep integration with the Web Audio API, handling PCM audio encoding/decoding, and managing WebSocket-like connections with the Gemini Live API. We had to carefully manage audio context lifecycle and handle browser permission flows.

**Content Structure Parsing**: Creating a single source of truth from streaming Markdown content while maintaining chapter structure, Q&A sections, and navigation was challenging. We solved this by implementing a robust section parser that identifies content types and generates unique IDs.

**State Management**: Managing complex state across multiple features (editing, rewriting, streaming, voice recording) without external state management libraries required careful use of React hooks and refs to prevent race conditions.

**Persistent Memory Architecture**: Designing a memory system that tracks per-chapter progress independently of chat history was challenging. We needed to ensure memory persists across sessions while remaining contextually relevant to each chapter.

**Prompt Engineering**: Crafting effective prompts for different use cases (report generation, Q&A creation, content refinement, and intelligent questioning) required extensive iteration to get consistent, well-formatted Markdown output and adaptive coaching behavior.

### Accomplishments that we're proud of

- **Seamless Voice Integration**: Successfully implemented natural voice conversations with transcription and audio playback
- **Real-time Streaming**: Content appears as it's generated, creating a dynamic and engaging user experience
- **Active AI Coach**: Built a reflection mode where the AI proactively drives the learning conversation with intelligent questioning
- **Persistent Memory System**: Implemented chapter-specific progress tracking that survives chat resets and enables truly personalized learning
- **Flexible Content Editing**: Users can edit chapters in Markdown, append chat responses as new sections, and regenerate Q&A on demand
- **Smart Context Awareness**: The AI tutor maintains context of the current chapter, chat history, and learning progress for relevant responses
- **Clean Architecture**: Built a maintainable codebase with clear separation between components, services, and types

### What we learned

- **Streaming APIs**: Deep understanding of async generators and streaming responses for real-time UX
- **Audio Processing**: Hands-on experience with Web Audio API, PCM encoding, and real-time audio streaming
- **Prompt Engineering**: The importance of structured prompts and clear formatting instructions for consistent AI outputs, plus crafting coaching behaviors
- **Memory Systems**: Designing persistent state that tracks learning progress independently of ephemeral chat sessions
- **React Performance**: Techniques for managing complex state and preventing unnecessary re-renders in real-time applications
- **User Experience**: How to design intuitive interfaces for complex AI interactions and mode transitions
- **Adaptive AI Behavior**: Creating AI that shifts from passive assistant to active coach based on user context

### What's next for ReflectLearning

- **Knowledge Map Visualization**: Implement a heat map grid showing knowledge points, user understanding levels, and interaction frequency based on memory data
- **Lecture Mode**: Create slide-based presentations with Marp for structured learning journeys
- **Enhanced Memory Analytics**: Visualize learning patterns, identify knowledge gaps, and provide personalized study recommendations
- **Cloud Persistence**: Store user learning history and memory across devices with cloud synchronization
- **Multi-modal Enhancements**: Support for video content analysis and 3D visualizations
- **Spaced Repetition**: Integrate memory system with spaced repetition algorithms for optimal retention
- **Collaborative Learning**: Enable sharing of learning reports and collaborative study sessions
- **Export Features**: Download reports, memory snapshots, and progress analytics as PDF or HTML
- **Mobile App**: Native mobile experience with offline support and push notifications for review sessions



---

## Built with
What languages, frameworks, platforms, cloud services, databases, APIs, or other technologies did you use?

**Frontend Technologies:**
- React 19.2.0
- TypeScript 5.8.2
- Vite 6.2.0
- React Markdown with GitHub Flavored Markdown (GFM)
- Material Symbols Icons

**AI & APIs:**
- Google Generative AI SDK (@google/genai v1.29.0)
- Gemini Flash Lite (text generation & chat)
- Gemini 2.5 Flash Native Audio Preview (voice interactions)
- Imagen 4.0 (image generation)
- Google Search API (web grounding)

**Audio Processing:**
- Web Audio API
- ScriptProcessorNode
- MediaStream API
- PCM Audio Encoding/Decoding

**Development Tools:**
- Node.js & npm
- Environment variables (.env.local)
- Path aliases (@/*)

**Key Libraries:**
- remark-gfm (Markdown parsing)
- Async generators (streaming responses)

---


## YouTube Description

🎓 **ReflectLearning: Your AI-Powered Learning Companion**

Stop passively reading—start actively mastering! ReflectLearning transforms any learning material into an intelligent, interactive tutor that adapts to YOUR understanding.

**🚀 What Makes ReflectLearning Different?**

✅ **Upload Anything** - PDFs, documents, images, text, or URLs → Instant structured learning reports
✅ **AI Tutor Chat** - Ask questions, get explanations, and generate visual aids with full context awareness
✅ **Voice Conversations** - Natural voice interactions with real-time transcription using Gemini's native audio
✅ **Active Reflection Mode** - The AI becomes your coach, proactively asking questions on a dynamic whiteboard
✅ **Persistent Memory** - Tracks what you've mastered per chapter, ensuring personalized, non-repetitive sessions
✅ **Adaptive Learning Flow** - Warm-up greetings, intelligent hints, and closed-loop evaluation cycles
✅ **Live Content Editing** - Rewrite chapters, append chat responses, regenerate Q&A sections on the fly
✅ **Web Search Integration** - Enrich content with up-to-date information from the internet

**🛠️ Built With:**
React 19 • TypeScript • Google Gemini AI • Web Audio API • Real-time Streaming • Persistent Memory System

**💡 Perfect For:**
Students preparing for exams, professionals learning new skills, researchers exploring topics, or anyone who wants to truly understand and retain knowledge—not just read it.

**🎯 How It Works:**
1. Upload your learning materials or paste text
2. AI generates a comprehensive report with chapters & Q&A
3. Chat with your AI tutor or switch to Reflection Mode
4. AI asks questions, evaluates your answers, and adapts to your progress
5. Master the material through active engagement, not passive reading

**🔮 Coming Soon:**
Knowledge map visualization, lecture mode with slides, spaced repetition, cloud sync, and mobile app!

---

**Try ReflectLearning and experience the future of personalized learning!**

#AI #Education #MachineLearning #EdTech #GoogleGemini #ReactJS #LearningApp #StudyTool #AITutor #PersonalizedLearning #ActiveLearning #ReflectiveLearning #TechForGood #Innovation

---

🔗 GitHub: [Your Repo Link]
🌐 Demo: [Your Demo Link]
📧 Contact: [Your Email]

Built with ❤️ for learners everywhere
