import { GoogleGenAI, Content, Type, Modality, LiveServerMessage, Blob } from "@google/genai";
import { ChatMessage } from '../types';

// Initialize the Google Gemini AI client
// FIX: Add comment above each fix.
// Initializes the GoogleGenAI client instance.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

/**
 * Analyzes an image with a text prompt.
 */
export const analyzeImage = async (base64Data: string, mimeType: string, prompt: string): Promise<string> => {
    const imagePart = {
        inlineData: {
            data: base64Data,
            mimeType: mimeType,
        },
    };
    const textPart = {
        text: prompt
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
    });
    
    return response.text;
};

/**
 * Searches for learning materials on a topic, streaming the results.
 */
export async function* searchLearningMaterialsStream(query: string, useSearch: boolean): AsyncGenerator<string> {
    const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: `Provide a detailed explanation of "${query}". Break it down into sections with markdown headings. Use bold markdown (**text**) for keywords or knowledge points, and italic markdown (*text*) for words that require emphasis in a sentence.`,
        config: useSearch ? { tools: [{ googleSearch: {} }] } : {},
    });

    for await (const chunk of response) {
        yield chunk.text;
    }
}

/**
 * Connects to the Live API for real-time voice interaction.
 */
export const connectLive = (callbacks: {
    onopen: () => void;
    onmessage: (message: LiveServerMessage) => void;
    onerror: (e: ErrorEvent) => void;
    onclose: () => void;
}) => {
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            ...callbacks,
            onclose: (e: CloseEvent) => callbacks.onclose(),
        },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
        },
    });
};

/**
 * Refines a block of text into a well-structured report, streaming the result.
 */
export async function* refineTextStream(originalText: string, useSearch: boolean): AsyncGenerator<string> {
    const prompt = `You are an expert editor. Your task is to refine the following text to improve its clarity, coherence, and overall quality. If there are multiple separate reports (each with their own '# H1'), merge them into a single, cohesive document. Generate one new, overarching '# H1' title that accurately summarizes all the combined topics. Convert each original report into a '## Chapter', preserving its internal structure. Ensure the final output is a single, well-structured report formatted in Markdown. Use bold markdown (**text**) for keywords and knowledge points, and italic markdown (*text*) for words that require emphasis.

Original Text:
"""
${originalText}
"""`;

    const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: useSearch ? { tools: [{ googleSearch: {} }] } : {},
    });

    for await (const chunk of response) {
        yield chunk.text;
    }
}

/**
 * Refines a user's search query to be more effective.
 */
export const refineUserPrompt = async (query: string): Promise<string> => {
    const prompt = `Refine the following user query to be more specific, effective, and well-phrased for a web search to find learning materials. Return only the refined query.

Original query: "${query}"`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text.trim().replace(/^"|"$/g, '');
};

/**
 * Suggests extended learning topics based on provided context.
 */
export const suggestExtendedTopics = async (context: string): Promise<string[]> => {
    const prompt = `Based on the following text, suggest 5 related or extended topics that a user might be interested in learning about. Return the topics as a JSON array of strings.

Context:
"""
${context.substring(0, 4000)}
"""

Example output:
["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"]`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
            },
        },
    });

    try {
        const jsonText = response.text;
        const topics = JSON.parse(jsonText);
        return Array.isArray(topics) ? topics.slice(0, 5) : [];
    } catch (e) {
        console.error("Failed to parse suggested topics:", e);
        return [];
    }
};

/**
 * Generates an image based on a text prompt using the cost-effective gemini-2.5-flash-image model.
 */
export const generateImage = async (prompt: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const mimeType = part.inlineData.mimeType || 'image/png';
                return `data:${mimeType};base64,${base64ImageBytes}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Error generating image with gemini-2.5-flash-image:", error);
        return null;
    }
};

/**
 * Refines a user's prompt for the AI Tutor.
 */
export const refineTutorPrompt = async (prompt: string, context: string): Promise<string> => {
    const systemInstruction = `You are an AI assistant helping a user refine their question to an AI Tutor. Based on the user's prompt and the current learning context, rewrite the prompt to be clearer, more specific, and more effective for eliciting a helpful educational response. Return only the refined prompt.

Learning Context:
"""
${context.substring(0, 2000)}
"""`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Original prompt: "${prompt}"`,
        config: {
            systemInstruction
        }
    });

    return response.text.trim();
};

const formatHistoryForGemini = (history: ChatMessage[]): Content[] => {
    const geminiHistory: Content[] = [];
    history.forEach(msg => {
        if (msg.text) {
             geminiHistory.push({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }],
            });
        }
    });
    // The last message is the current user prompt, which shouldn't be in history for a new request.
    if (geminiHistory.length > 0) {
        geminiHistory.pop();
    }
    return geminiHistory;
};

/**
 * Gets a response from the AI Tutor based on a prompt, context, and history.
 */
export const getTutorResponse = async (prompt: string, context: string, history: ChatMessage[], useSearch: boolean): Promise<string> => {
    const systemInstruction = `You are an expert AI Tutor. Your goal is to help a user understand a specific topic based on the provided learning material. Be encouraging, clear, and provide detailed explanations. When relevant, use the conversation history to maintain context.

Current Learning Material (Context):
"""
${context}
"""`;
    
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: formatHistoryForGemini(history),
        config: {
            systemInstruction,
            tools: useSearch ? [{ googleSearch: {} }] : []
        }
    });

    const response = await chat.sendMessage({ message: prompt });
    return response.text;
};

/**
 * Generates a title for a paragraph of text.
 */
export const generateParagraphTitle = async (paragraph: string): Promise<string> => {
    const prompt = `Generate a concise and descriptive title (3-5 words) for the following paragraph. The title should be suitable as a sub-heading in a document. Return only the title text.

Paragraph:
"""
${paragraph.substring(0, 1000)}
"""`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text.trim().replace(/^"|"$/g, '');
};

/**
 * Rewrites a chapter to improve its quality, streaming the result.
 */
export async function* rewriteChapterStream(chapterContent: string): AsyncGenerator<string> {
    const prompt = `You are an expert technical writer and educator. Your task is to completely rewrite and improve the following chapter. Enhance its clarity, structure, and engagement. Add more details, examples, and analogies where appropriate. The final output must be in well-formatted Markdown and should be a significant improvement over the original.

Original Chapter:
"""
${chapterContent}
"""

Rewritten Chapter:`;

    const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });

    for await (const chunk of response) {
        yield chunk.text;
    }
}

/**
 * Generates a new Q&A section for a chapter, streaming the result.
 */
export async function* rewriteQnAStream(chapterContent: string): AsyncGenerator<string> {
    const prompt = `Based on the provided chapter content, generate a "Q&A" section in Markdown. Create 3-5 insightful questions that a student might have after reading the chapter, and provide clear, comprehensive answers.

Chapter Content:
"""
${chapterContent}
"""

Format the output starting with a "### Q&A" heading.`;

    const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    for await (const chunk of response) {
        yield chunk.text;
    }
}

/**
 * Generates a title for a new chapter based on its content.
 */
export const generateChapterTitle = async (chapterContent: string): Promise<string> => {
    const prompt = `Generate a concise and descriptive title for a new chapter based on the following text content. The title should not include the word "Chapter" or a number. Return only the title.

Content:
"""
${chapterContent.substring(0, 2000)}
"""`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text.trim().replace(/^"|"$/g, '');
};

/**
 * Starts a reflection session by providing a greeting and suggestions.
 */
export const startReflection = async (chapterTitle: string, chapterContent:string): Promise<{ greeting: string, suggestions: string[] }> => {
    const prompt = `You are an AI Reflection Coach. Your goal is to help a user deepen their understanding of a specific chapter.
    
Chapter Title: "${chapterTitle}"

Your task is to start the reflection session.
1. Write a brief, encouraging greeting to welcome the user to the reflection for this chapter.
2. Based on the chapter content, generate 3-4 diverse "points of reflection". These should be short, engaging questions or statements (under 10 words) that prompt deeper thinking.
3. Return the greeting and suggestions in a single JSON object.

Chapter Content:
"""
${chapterContent.substring(0, 4000)}
"""

Example Output Format:
{
  "greeting": "Welcome to your reflection on 'The Transformer Architecture'! I'm here to help you explore the key concepts. What would you like to focus on first?",
  "suggestions": [
    "Explain self-attention in your own words.",
    "Why are positional encodings important?",
    "Compare Transformers to RNNs.",
    "Let's discuss emergent abilities."
  ]
}
`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    greeting: { type: Type.STRING },
                    suggestions: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                    },
                },
                required: ['greeting', 'suggestions'],
            },
        },
    });

    try {
        return JSON.parse(response.text);
    } catch (e) {
        console.error("Failed to parse startReflection response:", e);
        return {
            greeting: "Hello! I'm ready to reflect on this chapter with you. What's on your mind?",
            suggestions: ["Summarize the main idea.", "What was most surprising?", "What was most confusing?"]
        };
    }
};

/**
 * Gets a response from the AI Reflection Coach.
 */
export const getReflectionResponse = async (
    chapterContent: string,
    memory: string,
    history: ChatMessage[],
    latestUserMessage: string
): Promise<{ updatedMemory: string; responseToUser: string; nextQuestion: string; imagePrompt: string | null; choices: string[] | null; }> => {
    
    const historyString = history
        .map(m => `${m.sender === 'user' ? 'User' : 'AI'}: ${m.text}`)
        .join('\n');

    const prompt = `
**Current Chapter Content:**
"""
${chapterContent}
"""

**Your Memory of the User's Progress on This Chapter:**
"""
${memory || 'No previous reflection session for this chapter.'}
"""

**Recent Conversation History:**
"""
${historyString}
"""

**User's Latest Message:**
"""
${latestUserMessage}
"""
`;
    
    const systemInstruction = `You are an AI Reflection Coach and expert educator named Reflect. Your primary goal is to foster deep understanding using a patient, Socratic teaching method. Each concept is explored through a clear, structured loop: Question -> Guidance -> Explanation. You are always energetic, encouraging, and insightful.

**Your Task: Execute the Teaching Loop**

Based on the provided context (chapter, memory, history), analyze the user's latest message and follow this non-negotiable process:

**STEP 1: EVALUATE THE USER'S MESSAGE**
- Is the user answering a question I previously asked?
- Is their answer correct, partially correct, or incorrect?
- Are they asking for a hint or saying they don't know?
- Are they simply acknowledging a previous explanation (e.g., "okay", "got it", "thanks")?

**STEP 2: CHOOSE YOUR ACTION**

**Action A: The user's answer is CORRECT.**
- If the user answers correctly (on any attempt):
    - **You MUST now provide the 'Final Explanation'.** Do not immediately ask a new question.
    - See 'FINAL EXPLANATION' phase instructions below.

**Action B: The user's answer is INCORRECT or INCOMPLETE (and they have had less than 2 previous attempts on this question).**
    - **You MUST now provide a 'Guiding Hint'.** Do not give the full answer yet.
    - See 'GUIDING HINT' phase instructions below.

**Action C: The user is STUCK.**
- This happens if the user's answer is incorrect after 2 attempts, OR if they say "I don't know", "give up", or ask for the answer.
    - **You MUST now provide the 'Final Explanation'.**
    - See 'FINAL EXPLANATION' phase instructions below.

**Action D: The user is ACKNOWLEDGING a Final Explanation.**
- This happens *after* you have already given a 'Final Explanation' (e.g., the user says "okay", "got it", "thanks").
    - **You MUST now generate a COMPLETELY NEW QUESTION** on a different topic from the chapter.
    - See 'NEW QUESTION' phase instructions below.

--- **PHASE INSTRUCTIONS** ---

**PHASE: GUIDING HINT**
- **\`responseToUser\` (Chat):** Be encouraging. You MUST start by giving direct feedback on the user's answer. Use phrases like *'You're on the right track!', 'That's partially correct.', 'Good guess, but let's look closer.',* or *'You've got part of it!'*.
- After the initial feedback, briefly explain *what part* of their answer was correct and where the misconception might be.
- Then, provide a small, targeted hint or ask a simpler, leading sub-question to guide them toward the full answer. *'You're right about the 'cool' and 'dark' parts, but let's think about why 'bright' might not be ideal. What did the chapter say about light's effect on sleep hormones?'*
- **\`nextQuestion\` (Slide):** The slide content MUST be this new hint or sub-question. It must still relate to the original question.
- **\`updatedMemory\`:** Note that the user is struggling with the current concept and what their specific misconception is.
- **Do not move to a new topic.**

**PHASE: FINAL EXPLANATION**
- **\`responseToUser\` (Chat):** This is a detailed, conversational explanation.
    - Start by affirming the user's journey. *'Exactly! You got it.'* or *'Let's break down the full answer.'*
    - State the correct answer clearly.
    - **You MUST explain in detail WHY it is correct**, linking it back to the chapter's core principles.
    - If the user had a misconception, gently and explicitly address it, explaining why their initial thought might have been incorrect. *'Earlier, you mentioned X, which is a common thought because of Y. However, in this context, the key is Z, which is why [Correct Answer] is the right conclusion.'*
- **\`nextQuestion\` (Slide):** This is a **final summary slide**, NOT a question. It must contain: 1. The concise correct answer. 2. The most critical part of the 'why' as a key takeaway.
- **\`updatedMemory\`:** Update memory to reflect the user's final understanding (e.g., 'mastered' if they got it right, 'explained' if you had to tell them).

**PHASE: NEW QUESTION**
- **\`responseToUser\` (Chat):** A brief transition. *'Great! Let's move to the next concept.'* or *'Alright, ready for the next one?'*
- **\`nextQuestion\` (Slide):** A brand new question slide on a different topic from the chapter.
- **Follow General Slide Formatting Rules:**
    - Format as a rich Markdown "slide" with headings.
    - **Interactivity (Multiple Choice):** If suitable, provide 3-4 options in the slide's Markdown (formatted as '1)', '2)', etc.) and return them in the 'choices' JSON array.
    - **Visuals:** If a slide feels sparse or a concept is complex, generate a descriptive 'imagePrompt'.
    - **Highlighting:** Use bold (\`**text**\`) for keywords (yellow) and italics (\`*text*\`) for emphasis (red).

**Output Format:**
You MUST return a single JSON object with the following structure. Do not add any text outside of the JSON object.
{
  "updatedMemory": "The new, updated summary of the user's progress.",
  "responseToUser": "Your conversational response to the user's last message.",
  "nextQuestion": "Your next question, hint, or final answer summary, formatted as a rich Markdown slide.",
  "imagePrompt": "A descriptive prompt for a helpful image, or null if not needed.",
  "choices": "An array of strings for multiple choice options, or null if not applicable."
}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    updatedMemory: { type: Type.STRING },
                    responseToUser: { type: Type.STRING },
                    nextQuestion: { type: Type.STRING },
                    imagePrompt: { type: Type.STRING, nullable: true },
                    choices: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        nullable: true,
                    },
                },
                required: ['updatedMemory', 'responseToUser', 'nextQuestion', 'imagePrompt', 'choices'],
            },
        },
    });

    try {
        return JSON.parse(response.text);
    } catch (e) {
        console.error("Failed to parse getReflectionResponse:", e, response.text);
        return {
            updatedMemory: memory,
            responseToUser: "I'm sorry, I got a little lost in my thoughts. Could you please repeat your answer or choose another topic?",
            nextQuestion: "## Let's try again!\n\nWhat would you like to focus on from this chapter?",
            imagePrompt: null,
            choices: null,
        };
    }
};

/**
 * Dummy export for refineText to satisfy imports. The stream version is used.
 */
export const refineText = async (text: string): Promise<string> => {
    let result = '';
    for await (const chunk of refineTextStream(text, true)) {
        result += chunk;
    }
    return result;
}