import { GoogleGenAI, GenerateContentResponse, Chat, LiveServerMessage, Modality, Type } from "@google/genai";
import { ChatMessage } from '../types';

let ai: GoogleGenAI;
const getAi = () => {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable is not set");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
}

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

export const createChat = (history?: ChatMessage[]) => {
    const formattedHistory = history?.map(message => ({
        role: message.sender === 'user' ? 'user' : 'model',
        parts: [{ text: message.text }]
    }));

    return getAi().chats.create({
        model: 'gemini-flash-lite-latest',
        history: formattedHistory,
    });
};

export const sendMessageToChat = async (chat: Chat, message: string): Promise<GenerateContentResponse> => {
    return await chat.sendMessage({ message });
};

export const analyzeImage = async (imageData: string, mimeType: string, prompt: string) => {
    try {
        const imagePart = {
            inlineData: {
                data: imageData,
                mimeType: mimeType,
            },
        };
        const textPart = { text: prompt };
        const response = await getAi().models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: { parts: [imagePart, textPart] },
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing image:", error);
        return "Sorry, I couldn't analyze the image.";
    }
};

const searchPromptTemplate = (query: string, useSearch: boolean) => `You are a professional research assistant. Your task is to create a comprehensive and well-structured report in Markdown format based on the user's input.

The user's input is:
"""
${query}
"""

Your instructions are:
1.  Analyze the input. It may be a simple search query, or a mix of content, instructions, and URLs.
2.  If the input contains URLs, use them as primary sources. Also, use any accompanying text as context or additional topics to search for to create a comprehensive report.
3.  If the input does NOT contain URLs, treat the entire text as a search query to find information.
4.  ${useSearch ? "Perform a comprehensive web search based on your analysis." : "Use only your internal knowledge to generate the report. Do not perform any web search or list any sources."}
5.  Synthesize all the gathered information into a single, coherent report using the specified Markdown structure below.

# [Report Title]
Provide a clear and descriptive title summarizing the topic.

---

## Table of Contents
- [Introduction](#introduction)
- [Chapter 1: First Main Topic](#chapter-1)
- [Chapter 2: Second Main Topic](#chapter-2)
- [Conclusion](#conclusion)${useSearch ? `\n- [Sources](#sources)` : ''}

(Each TOC item MUST link to a simple anchor. Use '#introduction', '#conclusion',${useSearch ? ` '#sources', and` : ' and'} for chapters, use the format '#chapter-1', '#chapter-2', and so on. The corresponding headings in the report body will be, for example, '## Introduction', '## Chapter 1: First Main Topic', etc.)

---

## Introduction
Provide a concise introduction explaining:
- The background of the topic
- Why it matters
- What this report will cover

---

## Chapter 1: [Main Theme or Finding]
### Subchapter Title
Describe details under this chapter. Use clear structure and explain in your own words.

You may include:
- **Key points** in bullet form
- Inline code snippets: \`example_code_here\`
- Important terms in **bold**
- Quotes or facts in *italic*

### Subchapter Title
(Continue for other subtopics or aspects)

---

## Chapter 2: [Another Major Section]
### Subchapter Title
(Continue structure as above)

---

## Summary / Conclusion
Summarize key insights, implications, and recommendations.
${useSearch ? `
---

## Sources
List all the web sources used to generate this report in a bulleted list of Markdown links.` : ''}

---

### Formatting Rules
- Use \`#\`, \`##\`, \`###\` for H1, H2, and H3 headings.
- Use **bold** for emphasis and *italic* for soft emphasis.
- Wrap code, terms, or special data in backticks \`like_this\`.
- Add bullet points \`-\` for lists when suitable.
- Keep paragraphs short and readable.
`;

export const searchLearningMaterials = async (query: string, useSearch: boolean): Promise<string> => {
    try {
        const prompt = searchPromptTemplate(query, useSearch);
        
        const config: any = {
           systemInstruction: "You are a professional research assistant.",
        };

        if (useSearch) {
            config.tools = [{ googleSearch: {} }];
        }

        const response = await getAi().models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: prompt,
            config
        });

        return response.text;

    } catch (error) {
        console.error("Error searching for materials:", error);
        return "Sorry, I couldn't find any materials.";
    }
};

export async function* searchLearningMaterialsStream(query: string, useSearch: boolean): AsyncGenerator<string, void, unknown> {
    const prompt = searchPromptTemplate(query, useSearch);
    try {
        const config: any = {
           systemInstruction: "You are a professional research assistant.",
        };

        if (useSearch) {
            config.tools = [{ googleSearch: {} }];
        }

        const response = await getAi().models.generateContentStream({
            model: 'gemini-flash-lite-latest',
            contents: prompt,
            config: config
        });

        for await (const chunk of response) {
            yield chunk.text;
        }

    } catch (error) {
        console.error("Error streaming search for materials:", error);
        yield "Sorry, I couldn't find any materials at this moment.";
    }
}

export const generateImage = async (prompt: string): Promise<string | null> => {
    try {
        const response = await getAi().models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        return null;
    } catch (error) {
        console.error("Error generating image:", error);
        return null;
    }
};

export const connectLive = (callbacks: {
    onopen: () => void;
    onmessage: (message: LiveServerMessage) => Promise<void>;
    onerror: (e: ErrorEvent) => void;
    onclose: (e: CloseEvent) => void;
// Fix: The 'LiveSession' type is not exported by the SDK. The return type should be inferred.
}) => {
    return getAi().live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction: 'You are a friendly and helpful AI Tutor named Reflect. Keep your answers concise and encouraging.',
        },
    });
};

export const refineUserPrompt = async (prompt: string): Promise<string> => {
    try {
        const fullPrompt = `You are an expert prompt engineer and research assistant for an AI Tutor. A user is providing an initial topic or query. This input might contain a mix of content, multiple (and possibly unrelated) topics, and URLs.

Your task is to analyze this input and help the user structure their learning by breaking down the content into logical sections.

Based on the original user input, provide the following in a clear, well-formatted Markdown structure:
1.  **A refined, more effective search prompt.** This prompt should be a clear instruction for the AI to generate a comprehensive report covering all the distinct topics found in the user's input.
2.  **A list of suggested chapter topics.** Identify the distinct topics from the user's input and list them as separate chapters.
3.  **A list of related keywords for each chapter.** For each suggested chapter, provide a set of relevant keywords that can help the user explore that specific topic further.

Use the following format strictly:

**Refined Prompt:**
[Your refined version of the user's prompt, instructing the AI to generate a report covering the identified topics.]

**Suggested Chapter Topics & Keywords:**
- **Chapter: [Chapter Topic 1]**
  - **Keywords:** [Keyword 1], [Keyword 2], [Keyword 3]
- **Chapter: [Chapter Topic 2]**
  - **Keywords:** [Keyword A], [Keyword B], [Keyword C]
- **Chapter: [Chapter Topic 3]**
  - **Keywords:** [Keyword X], [Keyword Y], [Keyword Z]
... (continue for all identified topics)

---

Original user input: "${prompt}"`;
        
        const response = await getAi().models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: fullPrompt,
            config: {
               systemInstruction: "You are an expert prompt engineer and research assistant. Your goal is to help users structure their learning by refining their prompts and suggesting related topics and keywords. You must follow the user's specified Markdown format exactly, without adding any introductory or concluding remarks."
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error refining user prompt:", error);
        // Return original prompt on error
        return prompt; 
    }
};

export const refineTutorPrompt = async (prompt: string, context: string): Promise<string> => {
    try {
        const fullPrompt = `You are an expert prompt engineer assisting a user in a chat with an AI Tutor. The user has provided an input, and your goal is to refine it to be clearer, more effective, and better structured to elicit the best possible response from the AI Tutor. The user might be asking a question, requesting an explanation, asking for an example, wanting to start a creative task, or something else entirely.

Analyze the user's original input and the current learning context. Then, rewrite the user's input to be a more effective prompt.

Consider the following techniques for refinement:
- **Clarity and Specificity:** Rephrase vague statements into precise questions or instructions.
- **Contextualization:** If the prompt is too general, add context from the learning material to make it more specific.
- **Persona Adoption:** Suggest a persona for the AI Tutor if it would help (e.g., "Explain this to me like I'm a 10-year-old.").
- **Format Specification:** If the user wants a structured answer, specify the desired format (e.g., "in a bulleted list," "as a table," "in a short paragraph").
- **Task Decomposition:** If the user's request is complex, break it down into a logical, step-by-step query.
- **Open-ended Exploration:** Rephrase a simple question to encourage a more detailed and exploratory answer from the tutor.

Your output should ONLY be the refined prompt text, without any explanations, introductions, or extra formatting. Do not wrap it in markdown or quotes. Just provide the raw text of the refined prompt.

---
Current Learning Context:
"""
${context || "No specific chapter content is being viewed right now."}
"""
---
Original User Input:
"""
${prompt}
"""
---`;

        const response = await getAi().models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: fullPrompt,
            config: {
               systemInstruction: "You are a prompt engineering assistant. Your task is to rewrite a user's prompt to be more effective for an AI Tutor. You must only return the refined prompt text, with no extra formatting or commentary."
            }
        });
        return response.text.trim();

    } catch (error) {
        console.error("Error refining tutor prompt:", error);
        return prompt; // Return original on error
    }
};

export const getTutorResponse = async (
    prompt: string,
    context: string,
    history: ChatMessage[],
    useSearch: boolean
): Promise<string> => {
    try {
        const systemInstructionWithSearch = `You are a helpful and knowledgeable AI Tutor named Reflect. Your goal is to provide comprehensive, well-organized answers to the user's questions.

- First, use the provided "Current Chapter Content" as the primary context for your answer.
- If the answer isn't fully available in the chapter content, use your own general knowledge to provide a complete response.
- If the question requires up-to-date information, specific facts you don't know, or deeper details, perform a web search to find the information.
- Structure your answers clearly using Markdown (headings, lists, bold text) for readability.
- If you use web search, you MUST cite your sources by listing the URLs you used at the end of your response under a "Sources:" heading.
- Be friendly and encouraging.`;

        const systemInstructionWithoutSearch = `You are a helpful and knowledgeable AI Tutor named Reflect. Your goal is to provide comprehensive, well-organized answers to the user's questions using only your pre-existing knowledge and the provided chapter content. Do not perform any web searches.

- First, use the provided "Current Chapter Content" as the primary context for your answer.
- If the answer isn't fully available in the chapter content, use your own general knowledge to provide a complete response.
- Structure your answers clearly using Markdown (headings, lists, bold text) for readability.
- Be friendly and encouraging.`;

        const contextualPrompt = `
Here is the content for the chapter we are currently studying:
---
**Current Chapter Content:**
${context || "No specific chapter content is being viewed right now."}
---

Now, please answer my question: ${prompt}
`;

        const historyForModel = history.slice(0, -1).map(message => ({
            role: message.sender === 'user' ? 'user' : 'model',
            parts: [{ text: message.text }]
        }));

        historyForModel.push({
            role: 'user',
            parts: [{ text: contextualPrompt }]
        });

        const config: any = {
            systemInstruction: useSearch ? systemInstructionWithSearch : systemInstructionWithoutSearch,
        };

        if (useSearch) {
            config.tools = [{ googleSearch: {} }];
        }

        const response = await getAi().models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: historyForModel,
            config,
        });

        return response.text;
    } catch (error) {
        console.error("Error getting tutor response:", error);
        return "Sorry, I encountered an error while trying to answer your question.";
    }
};

export const generateParagraphTitle = async (paragraph: string): Promise<string> => {
    try {
        const prompt = `Generate a very short, concise, and relevant subtitle (3-5 words) for the following paragraph. The subtitle should be suitable for a '##' Markdown heading. Do not include any prefix like "Title:", quotes, or markdown formatting. Just return the raw text for the title.

Paragraph:
"""
${paragraph}
"""`;

        const response = await getAi().models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: prompt,
            config: {
               systemInstruction: "You are a title generation assistant. Your task is to create a short, relevant subtitle for a given text."
            }
        });
        // Clean up any markdown, quotes, or newlines
        return response.text.trim().replace(/['"#*\r\n]/g, '');
    } catch (error) {
        console.error("Error generating paragraph title:", error);
        return "Additional Notes"; // Fallback title
    }
};

export const generateChapterTitle = async (chapterText: string): Promise<string> => {
    try {
        const prompt = `Generate a concise and engaging title for a new chapter based on the following text. The title should be suitable for a '##' Markdown heading. Do not include any prefix like "Title:", quotes, or markdown formatting like '##'. Just return the raw text for the title.

Text:
"""
${chapterText}
"""`;

        const response = await getAi().models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: prompt,
            config: {
               systemInstruction: "You are a title generation assistant. Your task is to create a short, relevant chapter title for a given text."
            }
        });
        // Clean up any markdown, quotes, or newlines
        return response.text.trim().replace(/['"#*\r\n]/g, '');
    } catch (error) {
        console.error("Error generating chapter title:", error);
        return "New Chapter"; // Fallback title
    }
};

const refinePromptTemplate = (text: string) => `You are a professional research assistant. Your task is to create a comprehensive and well-structured report in Markdown format based on the user's provided text.

The provided text may contain a mix of content, multiple (and possibly unrelated) topics, and URLs.

Your instructions are:
1.  Analyze all the content provided in the text.
2.  Identify all distinct topics. If the topics are unrelated, plan to address them in separate chapters.
3.  If URLs are present, use the information from those URLs as primary sources for the relevant topics. Also, perform a web search to gather additional information to enrich the content and create a comprehensive report.
4.  If no URLs are present, but topics for research are mentioned, perform a web search to build the report. If the text is just content to be reformatted, then simply reformat and structure it.
5.  Synthesize all gathered information into a single, coherent report.
6.  For each chapter, identify and list 3-5 relevant keywords that summarize the main concepts of that chapter. These keywords should be placed on a new line immediately following the chapter title, formatted in bold.
7.  Create a report title that accurately reflects the main subject or subjects of the report.
8.  Strictly follow the structure and formatting rules below.

---
Provided Content:
"""
${text}
"""
---

### Report Structure and Formatting Rules

# [Report Title]
Provide a clear and descriptive title summarizing the topic(s).

---

## Table of Contents
- [Introduction](#introduction)
- [Chapter 1: First Main Topic](#chapter-1)
- [Chapter 2: Second Main Topic](#chapter-2)
... you may add more chapters as needed for distinct topics ...
- [Conclusion](#conclusion)
- [Sources](#sources)

(Each TOC item MUST link to a simple anchor. Use '#introduction', '#conclusion', '#sources', and for chapters, use the format '#chapter-1', '#chapter-2', and so on. The corresponding headings in the report body will be, for example, '## Introduction', '## Chapter 1: First Main Topic', etc.)

---

## Introduction
Provide a concise introduction explaining the background, importance, and what the report will cover. For reports with multiple unrelated topics, the introduction should briefly mention each topic and state that the report will cover them separately.

---

## Chapter 1: [Main Theme or Finding]
**Keywords:** Keyword A, Keyword B, Keyword C

### Subchapter Title
Describe details under this chapter. Use clear structure and explain in your own words.

You may include:
- **Key points** in bullet form
- Inline code snippets: \`example_code_here\`
- Important terms in **bold**
- Quotes or facts in *italic*

### Subchapter Title
(Continue for other subtopics or aspects)

---

## Chapter 2: [Another Major Section]
**Keywords:** Keyword X, Keyword Y, Keyword Z

### Subchapter Title
(Continue structure as above)

---

## Summary / Conclusion
Summarize key insights, implications, and recommendations for each topic covered.

---

## Sources
List all the web sources used to generate this report in a bulleted list of Markdown links. If you performed a web search, this should include the URLs provided by the user and any additional sources you found.

---

### Formatting Rules
- Use \`#\`, \`##\`, \`###\` for H1, H2, and H3 headings.
- Use **bold** for emphasis and *italic* for soft emphasis.
`;


export const refineText = async (text: string, useSearch = false): Promise<string> => {
    try {
        const prompt = refinePromptTemplate(text);
        
        const config: any = {
            systemInstruction: "You are a professional research assistant. Your task is to write a structured, well-formatted report based on the provided text, strictly following the user's instructions for structure and Markdown formatting."
        };

        if (useSearch) {
            config.tools = [{ googleSearch: {} }];
        }

        const response = await getAi().models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: prompt,
            config: config
        });
        return response.text;
    } catch (error) {
        console.error("Error refining text:", error);
        // Return original text on error so user work is not lost
        return `Sorry, I couldn't process the content. The original text is preserved below:\n\n---\n\n${text}`; 
    }
};

export async function* refineTextStream(text: string, useSearch = false): AsyncGenerator<string, void, unknown> {
    try {
        const prompt = refinePromptTemplate(text);

        const config: any = {
            systemInstruction: "You are a professional research assistant. Your task is to write a structured, well-formatted report based on the provided text, strictly following the user's instructions for structure and Markdown formatting."
        };

        if (useSearch) {
            config.tools = [{ googleSearch: {} }];
        }

        const response = await getAi().models.generateContentStream({
            model: 'gemini-flash-lite-latest',
            contents: prompt,
            config: config
        });
        
        for await (const chunk of response) {
            yield chunk.text;
        }

    } catch (error) {
        console.error("Error refining text stream:", error);
        yield `Sorry, I couldn't refine the text at this moment. The original text is preserved below:\n\n---\n\n${text}`;
    }
}

export const suggestExtendedTopics = async (contextText: string): Promise<string[]> => {
    if (!contextText.trim()) {
        return [];
    }

    try {
        const prompt = `Based on the following text, suggest 5 related topics for further learning and research. The topics should extend beyond the core concepts mentioned in the text, providing a broader spectrum of knowledge.

Return the topics as a JSON array of strings. For example: ["topic 1", "topic 2", "topic 3", "topic 4", "topic 5"].
Do not include any other text or formatting in your response, only the JSON array.

Text:
"""
${contextText}
"""`;

        const response = await getAi().models.generateContent({
            model: 'gemini-flash-lite-latest',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                        description: 'A suggested learning topic that extends from the provided text.'
                    },
                },
            }
        });

        const jsonStr = response.text.trim();
        const topics = JSON.parse(jsonStr);
        if (Array.isArray(topics) && topics.every(t => typeof t === 'string')) {
            return topics;
        }
        return [];

    } catch (error) {
        console.error("Error suggesting extended topics:", error);
        return [];
    }
};

export async function* rewriteChapterStream(chapterContent: string): AsyncGenerator<string, void, unknown> {
    const prompt = `You are an expert educator and content strategist. Your task is to rewrite the provided chapter content into a highly organized, engaging, and clear educational article.

Retain all essential information, including original content, appended paragraphs, and Q&A sections. Improve the overall flow and clarity.

Follow these instructions strictly:

1.  **Chapter Title:**
    *   Start with the original chapter title using a \`##\` Markdown heading.

2.  **Main Content Table of Contents:**
    *   Immediately after the chapter title, create a bulleted list of hyperlinks.
    *   Each item in the list should link to a main content subtitle (\`###\` heading) that appears later in the chapter.
    *   Use simple anchor links (e.g., \`[Subtitle Name](#subtitle-name)\`).
    *   **Do not** include the Q&A section in this table of contents.

3.  **Main Content Body:**
    *   Separate this section from the TOC with a \`---\` divider.
    *   Rewrite and combine the original chapter text and any appended paragraphs into logical sections.
    *   Give each section a concise and descriptive subtitle using a \`###\` Markdown heading. These headings will be the targets for the TOC links.
    *   Use formatting like **bold** for key terms and bullet points for lists to improve readability.
    *   Use \`---\` dividers to separate distinct sections within the main content if it improves structure.

4.  **Q&A Section:**
    *   Place the entire Q&A section at the very end of the chapter, separated from the main content by a \`---\` divider.
    *   Start the section with a \`### Q&A\` heading.
    *   **Q&A Table of Contents:** Immediately after the \`### Q&A\` heading, create a bulleted list where each item is a full question that hyperlinks to its corresponding answer below (e.g., \`[Full Question Text?](#full-question-text)\`).
    *   Separate the Q&A TOC from the answers with a \`---\` divider.
    *   **Q&A Pairs:** Format each question-answer pair as follows:
        *   The question should be a \`####\` heading (e.g., \`#### Q: Full Question Text?\`). This creates the anchor for the hyperlink.
        *   The answer should follow directly, starting with \`**A:**\`.

5.  **Final Output:**
    *   The result must be a single, coherent Markdown document adhering to this structure.

---
Original Chapter Content to Rewrite:
"""
${chapterContent}
"""
---`;

    try {
        const response = await getAi().models.generateContentStream({
            model: 'gemini-flash-lite-latest',
            contents: prompt,
            config: {
               systemInstruction: "You are an expert educator and content writer. Rewrite the user's text following their instructions precisely."
            }
        });

        for await (const chunk of response) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error rewriting chapter:", error);
        yield `Sorry, an error occurred while rewriting the chapter. The original content is preserved below:\n\n---\n\n${chapterContent}`;
    }
}

export async function* rewriteQnAStream(chapterContent: string): AsyncGenerator<string, void, unknown> {
    const prompt = `You are an expert educator. Your task is to generate or rewrite the Q&A section for the provided chapter content.

**CRITICAL INSTRUCTIONS:**
1.  **YOUR OUTPUT MUST BE ONLY THE Q&A SECTION.** Do NOT include the main article content, the chapter title, or any introductory text. Your response must start directly with the \`### Q&A\` heading.
2.  If the provided content already has a Q&A section, rewrite it for clarity, accuracy, and improved formatting.
3.  If the provided content does NOT have a Q&A section, create a new one from scratch based on the main article text.
4.  Follow this Markdown format strictly:

### Q&A
- [Full Question Text 1?](#full-question-text-1)
- [Full Question Text 2?](#full-question-text-2)
...

---

#### Q: Full Question Text 1?
**A:** The detailed answer to the first question.

---

#### Q: Full Question Text 2?
**A:** The detailed answer to the second question.

---

**Provided Chapter Content:**
"""
${chapterContent}
"""
---
`;

    try {
        const response = await getAi().models.generateContentStream({
            model: 'gemini-flash-lite-latest',
            contents: prompt,
            config: {
               systemInstruction: "You are an expert educator focused on creating high-quality Q&A sections. Follow the user's formatting instructions precisely, and only output the Q&A section itself."
            }
        });

        for await (const chunk of response) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error rewriting Q&A:", error);
        yield `Sorry, an error occurred while rewriting the Q&A section.`;
    }
}