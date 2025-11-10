import { GoogleGenAI, Modality, Blob, GenerateContentResponse, Chat } from '@google/genai';

// Helper to get AI client
const getAiClient = () => {
    // As per guidelines, API key must be from environment variables.
    if (!process.env.API_KEY) {
        throw new Error("API key not found. Please set API_KEY environment variable.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- Functions for UploadPage ---

export async function analyzeImage(base64Data: string, mimeType: string, prompt: string): Promise<string> {
    const ai = getAiClient();
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };
    const textPart = { text: prompt };
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });
    return response.text;
}

export async function* searchLearningMaterialsStream(query: string, useSearch: boolean): AsyncGenerator<string> {
    const ai = getAiClient();
    const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: `You are an expert educator and content creator. Your task is to generate a comprehensive learning report based on the user's query: "${query}".
The report MUST be well-structured and formatted in Markdown.
It MUST begin with a single, overarching '# H1' title that summarizes the topic.
Following the title, the report MUST be broken down into multiple '## Chapter' sections. Each chapter should cover a specific aspect of the topic.
Within each chapter, use bold markdown (**text**) for important keywords and knowledge points, and italic markdown (*text*) for words that require special emphasis in a sentence.
Generate a complete, well-organized report.`,
        config: useSearch ? { tools: [{ googleSearch: {} }] } : {},
    });
    for await (const chunk of response) {
        yield chunk.text;
    }
}

export type LiveCallbacks = {
    onopen: () => void;
    onmessage: (message: any) => void;
    onerror: (e: any) => void;
    onclose: () => void;
};

export type LiveConfig = {
    responseModalities?: Modality[];
    inputAudioTranscription?: {};
    outputAudioTranscription?: {};
};

// FIX: The LiveSession type is not exported from @google/genai. Using Promise<any> instead.
export function connectLive(callbacks: LiveCallbacks, config: LiveConfig): Promise<any> {
    const ai = getAiClient();
    const liveSessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: callbacks,
        config: config
    });
    return liveSessionPromise;
}

export async function refineText(text: string, useSearch: boolean): Promise<string> {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expert editor. Your task is to refine and restructure the following text into a well-organized and comprehensive learning report. The original text may be a mix of pasted content, URLs, and raw notes.
        - Structure the content logically with a clear hierarchy using Markdown headings (#, ##, ###).
        - Start with a single, overarching '# H1' title.
        - Break down the main topics into '## Chapter' sections.
        - Rewrite and rephrase sentences for clarity, conciseness, and better flow.
        - Correct any grammatical errors or typos.
        - Use bold markdown (**text**) for key terms and italic markdown (*text*) for emphasis.
        - If the text is very sparse, expand upon the topics to create a more complete report.
        - Format the final output as a complete Markdown document.
        
        Original text:
        ---
        ${text}
        ---
        `,
        config: useSearch ? { tools: [{ googleSearch: {} }] } : {},
    });
    return response.text;
}

export async function* refineTextStream(text: string, useSearch: boolean): AsyncGenerator<string> {
    const ai = getAiClient();
    const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: `You are an expert editor. Your task is to refine and restructure the following text into a well-organized and comprehensive learning report. The original text may be a mix of pasted content, URLs, and raw notes.
        - Structure the content logically with a clear hierarchy using Markdown headings (#, ##, ###).
        - Start with a single, overarching '# H1' title.
        - Break down the main topics into '## Chapter' sections.
        - Rewrite and rephrase sentences for clarity, conciseness, and better flow.
        - Correct any grammatical errors or typos.
        - Use bold markdown (**text**) for key terms and italic markdown (*text*) for emphasis.
        - If the text is very sparse, expand upon the topics to create a more complete report.
        - Format the final output as a complete Markdown document.
        
        Original text:
        ---
        ${text}
        ---
        `,
        config: useSearch ? { tools: [{ googleSearch: {} }] } : {},
    });
    for await (const chunk of response) {
        yield chunk.text;
    }
}

export async function refineUserPrompt(prompt: string): Promise<string> {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expert instructional designer. A user has provided a topic for a new learning report. Your task is to refine this topic into a detailed and structured prompt that will guide an AI to generate a comprehensive educational document.

The refined prompt you generate should explicitly instruct the AI to:
1.  Create a single, overarching '# H1' title.
2.  Propose multiple relevant '## Chapter' titles that break down the topic logically.
3.  For each proposed chapter, list the key knowledge points or questions that should be covered.

Example:
User's original topic: "history of ai"
Your refined prompt output:
"Generate a comprehensive report on the history of AI. The report should have a main title and be structured into the following chapters, covering the specified key points:
## Chapter 1: The Dawn of AI - Early Concepts and Pioneers
- Key Points: Turing Test, Dartmouth Workshop, Alan Turing, John McCarthy.
## Chapter 2: The First AI Boom and Winter
- Key Points: LISP, early successes in logic and games, limitations of early systems, funding cuts.
## Chapter 3: The Rise of Machine Learning
- Key Points: Expert systems, neural networks, backpropagation, Geoffrey Hinton.
## Chapter 4: The Modern Era - Deep Learning and Foundational Models
- Key Points: ImageNet, AlexNet, breakthroughs in NLP, rise of Transformers and LLMs."

---

User's original topic: "${prompt}"

Refined prompt:`,
    });
    return response.text.replace(/^Refined prompt:\s*/i, '').trim();
}

export async function suggestExtendedTopics(text: string): Promise<string[]> {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on the following learning material, suggest 5 distinct but related topics that the user might be interested in exploring next. Provide only the topic titles, one per line. Do not add any extra formatting or numbering.
        
        Material:
        ---
        ${text}
        ---
        `,
    });
    return response.text.split('\n').filter(topic => topic.trim() !== '');
}

// --- Functions for MainPage ---

export async function generateImage(prompt: string): Promise<string | null> {
    const ai = getAiClient();
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '16:9',
        },
    });
    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return null;
}

export async function refineTutorPrompt(prompt: string, chapterContext: string): Promise<string> {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an AI assistant helping a user refine their question to an AI tutor. The user is currently studying a specific chapter. Refine the user's prompt to be clearer, more specific, and better suited to elicit a helpful, educational response from the tutor.
        
        Current Chapter Context:
        ---
        ${chapterContext}
        ---
        
        User's original prompt: "${prompt}"
        
        Refined prompt:`,
    });
    return response.text.replace(/^Refined prompt:\s*/i, '').trim();
}

export async function getTutorResponse(prompt: string, chapterContext: string, chatHistory: any[], useSearch: boolean): Promise<string> {
    const ai = getAiClient();

    const history = chatHistory.slice(0, -1).map(message => ({
        role: message.sender === 'user' ? 'user' : 'model',
        parts: [{ text: message.text }],
    }));

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history,
        config: {
            systemInstruction: `You are an expert AI Tutor. Your role is to help the user understand the provided chapter content. 
            - Your responses must be directly related to the chapter context.
            - Be encouraging, clear, and concise.
            - When explaining concepts, use markdown for formatting (bold, italics, lists).
            - Do not answer questions outside the scope of the provided learning material unless the user explicitly asks you to search the web.
            
            Current Chapter Context:
            ---
            ${chapterContext}
            ---
            `,
        }
    });

    const response = await chat.sendMessage({
        message: prompt,
        ...(useSearch ? { config: { tools: [{ googleSearch: {} }] } } : {}),
    });

    return response.text;
}

export async function generateParagraphTitle(paragraph: string): Promise<string> {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a concise and descriptive title (3-5 words) for the following paragraph. The title should be suitable for a '###' markdown subheading. Respond with only the title text, without any prefixes or markdown.
        
        Paragraph:
        ---
        ${paragraph}
        ---
        `,
    });
    return response.text.trim();
}

export async function* rewriteChapterStream(chapterContent: string): AsyncGenerator<string> {
    const ai = getAiClient();
    const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-pro',
        contents: `You are an expert educator and writer. Rewrite the following chapter to be more engaging, clear, and comprehensive.
        - Maintain the core information and topic of the chapter.
        - Improve the structure and flow.
        - Add relevant examples or analogies to clarify complex points.
        - Ensure the language is accessible and easy to understand.
        - The output must be a complete chapter in Markdown format, starting with the original '##' heading.
        
        Original Chapter:
        ---
        ${chapterContent}
        ---
        `,
    });
    for await (const chunk of response) {
        yield chunk.text;
    }
}

export async function* rewriteQnAStream(chapterContent: string): AsyncGenerator<string> {
    const ai = getAiClient();
    const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: `Based on the provided chapter content, generate a "Q&A" section.
        - Create 3-5 relevant questions that a student might ask about the material.
        - Provide clear and concise answers to each question.
        - Format the entire output in Markdown. Start with a '### Q&A' heading.
        - Each question should be a '#### Q:' heading, and each answer should be prefixed with '**A:**'.
        
        Chapter Content:
        ---
        ${chapterContent}
        ---
        `,
    });
    for await (const chunk of response) {
        yield chunk.text;
    }
}

export async function generateChapterTitle(chapterText: string): Promise<string> {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a concise and descriptive title for a new chapter based on the following text. The title should not include the word "Chapter" or any numbering. Respond with only the title text.
        
        Chapter Text:
        ---
        ${chapterText}
        ---
        `,
    });
    return response.text.trim();
}

export async function startReflection(chapterTitle: string, chapterContent: string): Promise<{ greeting: string; suggestions: string[] }> {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an AI Tutor initiating a reflection session for a student who just finished a chapter.
        - The goal is to test their understanding and encourage deeper thinking.
        - Generate a friendly, encouraging opening message (greeting).
        - Generate 3-4 thought-provoking, open-ended questions or discussion topics based on the chapter content. These will be presented as suggestions.
        - Format your response as a JSON object with two keys: "greeting" (a string) and "suggestions" (an array of strings).
        
        Chapter Title: "${chapterTitle}"
        
        Chapter Content:
        ---
        ${chapterContent}
        ---
        `,
        config: {
            responseMimeType: 'application/json',
        }
    });
    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse JSON from startReflection:", response.text);
        return {
            greeting: `Let's reflect on what you've learned about "${chapterTitle}". What stood out to you the most?`,
            suggestions: [
                `What was the main takeaway from this chapter?`,
                `What did you find most confusing?`,
                `How does this connect to what you already know?`,
            ]
        };
    }
}

interface ReflectionResponse {
    updatedMemory: string;
    responseToUser: string;
    nextQuestion: string;
    imagePrompt?: string;
    choices?: string[];
}
export async function getReflectionResponse(chapterContent: string, memory: string, chatHistory: any[], userInput: string): Promise<ReflectionResponse> {
    const ai = getAiClient();
    const historyText = chatHistory.map(m => `${m.sender}: ${m.text}`).join('\n');
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `You are an AI Tutor in a "Reflection Mode" session. Your goal is to guide the user through a Socratic dialogue to deepen their understanding of the chapter content.
        
        **Chapter Content:**
        ---
        ${chapterContent}
        ---
        
        **Reflection Memory (a summary of the conversation so far):**
        ---
        ${memory || 'No memory yet.'}
        ---
        
        **Recent Conversation History:**
        ---
        ${historyText}
        ---

        **User's Latest Input:** "${userInput}"
        
        **Your Task:**
        1.  **Update Memory:** Briefly summarize the key points from the user's latest input and update the reflection memory. The new memory should be a concise paragraph.
        2.  **Respond to User:** Formulate a direct response to the user's input. This should acknowledge their point, gently correct any misconceptions, and praise their insights.
        3.  **Ask Next Question:** Pose a new, follow-up question that builds on the conversation and encourages the user to think more deeply. This can be a multiple-choice question, an open-ended question, or a request to explain a concept in their own words.
        4.  **(Optional) Image Prompt:** If a visual aid would be highly beneficial for the next question (e.g., a diagram, a chart, a conceptual image), provide a detailed prompt for an image generation model. Otherwise, leave it as null. The prompt should be descriptive, e.g., "A simple diagram showing the flow of data through the transformer architecture, with labels for encoder, decoder, and self-attention layers."
        5.  **(Optional) Choices:** If the next question is multiple-choice, provide an array of 3-4 strings for the choices. Otherwise, leave it as null.

        **Output Format:**
        Your entire response MUST be a single, valid JSON object with the following keys: "updatedMemory", "responseToUser", "nextQuestion", "imagePrompt", "choices".
        `,
        config: {
            responseMimeType: 'application/json',
        }
    });
    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse JSON from getReflectionResponse:", response.text);
        return {
            updatedMemory: memory,
            responseToUser: "That's an interesting point. Could you elaborate a bit more on that?",
            nextQuestion: "What do you think is the most important concept we've discussed so far?",
        };
    }
}