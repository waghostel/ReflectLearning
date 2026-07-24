# ReflectLearning - Simple Architecture Overview

## How Data Flows Between Pages

```mermaid
graph LR
    subgraph "Upload Page"
        A[User Uploads<br/>Files/Text/Voice]
        B[Process Content]
    end
    
    subgraph "Google AI Services"
        C[Gemini AI<br/>Text Model]
        D[Imagen AI<br/>Image Model]
        E[Audio AI<br/>Voice Model]
    end
    
    subgraph "Learning Page"
        F[Display Report<br/>with Chapters]
        G[Chat with<br/>AI Tutor]
    end
    
    A -->|Send| B
    B -->|Ask AI to analyze| C
    B -->|Ask AI to analyze| D
    B -->|Ask AI to transcribe| E
    
    C -->|Return learning report| B
    D -->|Return image analysis| B
    E -->|Return text from voice| B
    
    B -->|Pass report text| F
    
    F -->|User asks question| G
    G -->|Send question + context| C
    C -->|Return answer| G

    style A fill:#135bec,color:#fff
    style F fill:#135bec,color:#fff
    style G fill:#135bec,color:#fff
    style C fill:#34405a,color:#fff
    style D fill:#34405a,color:#fff
    style E fill:#34405a,color:#fff
```

## Step-by-Step Journey

```mermaid
sequenceDiagram
    participant User
    participant Upload Page
    participant Google AI
    participant Learning Page
    
    Note over User,Learning Page: Step 1: Upload & Generate Report
    User->>Upload Page: Upload files or type text
    Upload Page->>Google AI: "Create a learning report from this"
    Google AI-->>Upload Page: "Here's your structured report"
    Upload Page->>Learning Page: Pass the report text
    
    Note over User,Learning Page: Step 2: Interactive Learning
    Learning Page->>User: Show chapters & content
    User->>Learning Page: Ask a question in chat
    Learning Page->>Google AI: "Answer this based on chapter content"
    Google AI-->>Learning Page: "Here's the answer"
    Learning Page->>User: Display AI tutor response
```

## What Happens on Each Page

```mermaid
graph TB
    subgraph "UPLOAD PAGE - Prepare Your Learning Material"
        A1[You can:]
        A2[Upload PDF/Word files]
        A3[Upload images]
        A4[Type or paste text]
        A5[Speak your topic]
        A6[Search for topics]
        
        A1 --> A2
        A1 --> A3
        A1 --> A4
        A1 --> A5
        A1 --> A6
        
        A2 --> B[AI analyzes everything]
        A3 --> B
        A4 --> B
        A5 --> B
        A6 --> B
        
        B --> C[Creates structured<br/>learning report]
        C --> D[Click 'Start Learning']
    end
    
    subgraph "LEARNING PAGE - Study & Interact"
        E1[Read chapters]
        E2[Chat with AI tutor]
        E3[Edit content]
        E4[Rewrite sections]
        
        D --> E1
        E1 --> E2
        E2 --> F[AI answers using<br/>chapter context]
        E1 --> E3
        E3 --> G[AI helps improve<br/>content]
        E1 --> E4
        E4 --> G
    end

    style A1 fill:#135bec,color:#fff
    style B fill:#34405a,color:#fff
    style C fill:#135bec,color:#fff
    style E1 fill:#135bec,color:#fff
    style F fill:#34405a,color:#fff
    style G fill:#34405a,color:#fff
```

## The Three AI Models Used

```mermaid
graph TB
    subgraph "Google AI Services"
        A[Gemini Text AI<br/>Thinks & Writes]
        B[Imagen Image AI<br/>Analyzes Pictures]
        C[Gemini Audio AI<br/>Listens & Speaks]
    end
    
    subgraph "What Each AI Does"
        A --> A1[Creates learning reports]
        A --> A2[Answers your questions]
        A --> A3[Rewrites content]
        A --> A4[Searches the web]
        
        B --> B1[Describes images]
        B --> B2[Generates new images]
        
        C --> C1[Converts speech to text]
        C --> C2[Speaks answers back]
    end

    style A fill:#34405a,color:#fff
    style B fill:#34405a,color:#fff
    style C fill:#34405a,color:#fff
```

## Key Points

### Data Transfer Between Pages
1. **Upload Page** collects your materials (files, text, voice)
2. **AI processes** everything and creates a structured report
3. **Report text** is passed to the Learning Page
4. **Learning Page** displays the report and lets you interact with it

### What Gets Saved
- Your uploaded files are analyzed but **not stored permanently**
- The **generated report text** is kept in memory while you learn
- Your **chat history** with the AI tutor is saved during your session
- When you refresh or close, everything resets (no database)

### Internet Connection Required
- All AI processing happens on **Google's servers**
- Your browser sends requests and receives responses
- No AI runs on your computer - it's all in the cloud

### Privacy Note
- Files and text are sent to Google AI for processing
- No data is stored in a database by this app
- Each session is independent and temporary
