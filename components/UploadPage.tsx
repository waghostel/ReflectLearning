import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UploadFile, FileIconType } from '../types';
// FIX: Update import to include LiveConfig type
import { analyzeImage, searchLearningMaterialsStream, connectLive, refineTextStream, refineUserPrompt, suggestExtendedTopics, LiveConfig } from '../services/geminiService';
import { LogoIcon, FilePdfIcon, FilePptIcon, FileDocIcon, FileImageIcon } from './Icons';
import { LiveServerMessage, Blob } from '@google/genai';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const EXAMPLE_CONTENT = `# The Generative AI Revolution: From Foundational Models to Future Frontiers

---

## Table of Contents
- [Introduction](#introduction)
- [Chapter 1: The Building Blocks - What are Foundational Models?](#chapter-1)
- [Chapter 2: The Transformer Architecture - A Deep Dive](#chapter-2)
- [Chapter 3: Training Large Language Models (LLMs)](#chapter-3)
- [Chapter 4: The Art of the Prompt - Prompt Engineering](#chapter-4)
- [Chapter 5: Beyond Text - Multimodal Models](#chapter-5)
- [Chapter 6: Ethical Considerations and Responsible AI](#chapter-6)
- [Chapter 7: Real-World Applications and Case Studies](#chapter-7)
- [Chapter 8: The Future of Generative AI](#chapter-8)
- [Conclusion](#conclusion)
- [Sources](#sources)

---

## Introduction
Welcome to this comprehensive overview of the Generative AI revolution. In recent years, AI has taken a monumental leap forward, moving from specialized, narrow tasks to broad, creative, and reasoning capabilities. This transformation is largely driven by the advent of foundational models, particularly Large Language Models (LLMs). This report will guide you through the core concepts, underlying technologies, practical applications, and critical ethical considerations shaping this exciting field. We will explore everything from the transformer architecture that powers modern LLMs to the future frontiers of multimodal and responsible AI.

---

## Chapter 1: The Building Blocks - What are Foundational Models?
A foundational model is a large-scale AI model trained on a vast quantity of broad, unlabeled data that can be adapted to a wide range of downstream tasks. Unlike traditional models designed for a single purpose (e.g., sentiment analysis), foundational models like GPT-4 or Gemini are pre-trained with a general "understanding" of language, images, or other data modalities. This pre-training allows them to be fine-tuned for specific applications with significantly less task-specific data.

### Key Characteristics:
- **Scale:** Trained on massive datasets (often petabytes) using immense computational resources.
- **Generality:** They are not built for one task but can perform many, such as text generation, summarization, translation, and question-answering.
- **Emergent Abilities:** At a certain scale, these models exhibit surprising new capabilities that they were not explicitly trained for.

---

## Chapter 2: The Transformer Architecture - A Deep Dive
The transformer, introduced in the 2017 paper "Attention Is All You Need," is the neural network architecture that underpins most modern foundational models. Its key innovation is the **self-attention mechanism**.

### Self-Attention Explained:
Self-attention allows the model to weigh the importance of different words in the input text when processing a particular word. For example, in the sentence "The robot picked up the ball because it was heavy," the attention mechanism helps the model understand that "it" refers to the "ball," not the "robot." This ability to capture long-range dependencies in text is a significant advantage over previous architectures like RNNs and LSTMs.

### Components of a Transformer:
- **Encoder:** Processes the input sequence and builds a rich representation.
- **Decoder:** Generates the output sequence, paying attention to the encoded input.
- **Positional Encodings:** Since transformers process all words simultaneously, they need information about word order, which is injected via positional encodings.

---

## Chapter 3: Training Large Language Models (LLMs)
Training an LLM is a multi-stage, computationally intensive process.

1.  **Pre-training:** The model is trained on a massive corpus of text from the internet, books, and other sources. The primary objective is typically next-word prediction. The model learns grammar, facts, reasoning abilities, and even biases from this data.
2.  **Fine-tuning:** After pre-training, the model is further trained on a smaller, curated dataset to align it with specific tasks or behaviors. This can include:
    - **Supervised Fine-Tuning (SFT):** Training on high-quality examples of instructions and desired outputs.
    - **Reinforcement Learning with Human Feedback (RLHF):** Using human preferences to rank different model outputs, which trains a reward model. The LLM is then fine-tuned to maximize the score from this reward model, making it more helpful, harmless, and honest.

---

## Chapter 4: The Art of the Prompt - Prompt Engineering
Prompt engineering is the practice of designing and refining inputs (prompts) to elicit desired outputs from an AI model. A well-crafted prompt can be the difference between a generic, unhelpful response and a precise, insightful one.

### Key Techniques:
- **Zero-shot Prompting:** Simply asking the model to perform a task without any examples. (e.g., "Translate this text to French.")
- **Few-shot Prompting:** Providing a few examples of the task within the prompt to guide the model.
- **Chain-of-Thought (CoT) Prompting:** Encouraging the model to "think step-by-step" by including reasoning steps in the examples, which improves performance on complex logical tasks.

---

## Chapter 5: Beyond Text - Multimodal Models
The latest generation of foundational models is multimodal, meaning they can understand and process information from multiple data types, such as text, images, audio, and video.

- **Example:** A user can provide an image of the inside of their refrigerator and ask, "What can I make for dinner with these ingredients?" A multimodal model can identify the food items and suggest recipes.
- **Architecture:** These models often use techniques like cross-attention to learn relationships between different modalities, creating a unified representational space.

---

## Chapter 6: Ethical Considerations and Responsible AI
The power of generative AI comes with significant ethical responsibilities. Key challenges include:

- **Bias:** Models can perpetuate and amplify societal biases present in their training data.
- **Misinformation:** The ability to generate convincing but false text and images can be exploited for malicious purposes.
- **Toxicity:** Models can generate harmful, hateful, or inappropriate content if not properly safeguarded.
- **Copyright and Data Privacy:** The use of vast datasets raises questions about intellectual property and the privacy of individuals whose data was used for training.

Developing AI responsibly involves bias mitigation, content filtering, data transparency, and creating robust safety guardrails.

---

## Chapter 7: Real-World Applications and Case Studies
Generative AI is already transforming numerous industries:

- **Software Development:** AI assistants like GitHub Copilot help developers write, debug, and document code faster.
- **Content Creation:** Marketers and writers use AI to generate blog posts, ad copy, and social media updates.
- **Customer Support:** AI-powered chatbots handle customer queries with increasing sophistication.
- **Drug Discovery:** AI models can predict protein structures and design new molecules, accelerating pharmaceutical research.

---

## Chapter 8: The Future of Generative AI
The field is evolving at a breakneck pace. Future trends to watch include:

- **Increased Agency:** Models transitioning from being tools to becoming autonomous agents that can perform multi-step tasks to achieve a goal.
- **On-Device AI:** Smaller, more efficient models running directly on personal devices, improving privacy and reducing latency.
- **Hyper-Personalization:** AI tutors, therapists, and assistants tailored to an individual's unique needs and context.
- **New Modalities:** Integration of more complex data types, such as 3D environments and biological data.

---

## Summary / Conclusion
Generative AI represents a paradigm shift in computing. From the foundational transformer architecture to the complex ecosystem of applications and ethical challenges, this technology is reshaping our world. Understanding its core principles is no longer just for engineers but is becoming essential for everyone. As we move forward, the key will be to harness the immense potential of these models while proactively mitigating their risks, ensuring that the AI revolution benefits all of humanity.

---

## Sources
- Vaswani, A., et al. (2017). "Attention Is All You Need." arXiv preprint arXiv:1706.03762.
- Brown, T. B., et al. (2020). "Language Models are Few-Shot Learners." arXiv preprint arXiv:2005.14165.
- Ouyang, L., et al. (2022). "Training language models to follow instructions with human feedback." arXiv preprint arXiv:2203.02155.
`;

// --- Audio Helper Functions ---
function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function createPcmBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}

// List of potential learning topics for suggestions
const learningTopics = [
    'The history of the Roman Empire',
    'How do black holes work?',
    'Introduction to Quantum Computing',
    'The basics of cognitive psychology',
    'Learn Spanish for beginners',
    'The impact of Shakespeare on modern literature',
    'Understanding blockchain technology',
    'The art of landscape photography',
    'Key principles of microeconomics',
    'The science of climate change',
    'How to write a business plan',
    'The fundamentals of machine learning',
    'History of Jazz music',
    'Beginner\'s guide to Python programming',
    'The philosophy of Stoicism',
    'How does the stock market work?',
    'The life cycle of a star',
    'Introduction to graphic design',
    'The main events of World War II',
    'The basics of neuroscience',
];

interface UploadPageProps {
    onDone: (files: UploadFile[], rawText: string) => void;
    initialText?: string;
}

const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return { component: <FileImageIcon />, color: 'text-green-500' };
    if (fileType === 'application/pdf') return { component: <FilePdfIcon />, color: 'text-red-500' };
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return { component: <FilePptIcon />, color: 'text-orange-500' };
    if (fileType.includes('document') || fileType.includes('word')) return { component: <FileDocIcon />, color: 'text-blue-500' };
    return { component: <FileDocIcon />, color: 'text-gray-400' };
};

const UploadStatusItem: React.FC<{ file: UploadFile }> = ({ file }) => {
    const { component, color } = getFileIcon(file.file.type);
    return (
        <div className="flex items-center gap-4 bg-[#111722] px-4 min-h-[72px] py-2 justify-between">
            <div className="flex items-center gap-4 overflow-hidden">
                <div className={`shrink-0 flex items-center justify-center rounded-lg bg-[#232f48] size-12 ${color}`}>
                    {component}
                </div>
                <div className="flex flex-col justify-center overflow-hidden">
                    <p className="text-white text-base font-medium leading-normal truncate">{file.file.name}</p>
                    <p className="text-[#92a4c9] text-sm font-normal leading-normal truncate">
                        {file.status !== 'completed' ? `Analyzing...` : `Content appended to editor`}
                    </p>
                </div>
            </div>
            <div className="shrink-0">
                <div className="relative w-[160px]">
                    <div className={`w-full overflow-hidden rounded-sm bg-[#324467] ${file.status === 'in_progress' ? 'animate-breathing' : ''}`}>
                        <div className="h-1 rounded-full bg-[#135bec] transition-all duration-300 ease-in-out" style={{ width: `${file.progress}%` }}></div>
                    </div>
                    <p className="absolute -top-5 right-0 text-white text-sm font-medium leading-normal">{file.progress}%</p>
                </div>
            </div>
        </div>
    );
};

const UploadPage: React.FC<UploadPageProps> = ({ onDone, initialText }) => {
    const [pastedText, setPastedText] = useState(initialText || '');
    const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [isSuggestingTopics, setIsSuggestingTopics] = useState(false);
    const [isSearchRefining, setIsSearchRefining] = useState(false);
    const [isMarkdownMode, setIsMarkdownMode] = useState(!!initialText && (initialText.includes('## ') || initialText.includes('\n---\n')));
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
    const [isUploadSectionVisible, setIsUploadSectionVisible] = useState(!initialText);
    const [isInputActive, setIsInputActive] = useState(false);
    const [isEditorFocused, setIsEditorFocused] = useState(false);
    const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
    const [isSearchGroundingEnabled, setIsSearchGroundingEnabled] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const editorTextareaRef = useRef<HTMLTextAreaElement>(null);
    const markdownContainerRef = useRef<HTMLDivElement>(null);

    const sessionPromiseRef = useRef<ReturnType<typeof connectLive> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const fileProgressIntervals = useRef<Record<string, number>>({});
    const hideSuggestionsTimeoutRef = useRef<number | null>(null);
    const dragCounter = useRef(0);

    const focusOnPasting = () => {
        if (isUploadSectionVisible) {
            setIsUploadSectionVisible(false);
        }
    };

    useEffect(() => {
        const shuffled = [...learningTopics].sort(() => 0.5 - Math.random());
        setSuggestedTopics(shuffled.slice(0, 5)); // Get 5 random topics

        return () => {
            if (hideSuggestionsTimeoutRef.current) {
                clearTimeout(hideSuggestionsTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [searchQuery]);

    useEffect(() => {
        if (editorTextareaRef.current && !isUserScrolledUp && !isMarkdownMode) {
            editorTextareaRef.current.scrollTop = editorTextareaRef.current.scrollHeight;
        }
    }, [pastedText, isUserScrolledUp, isMarkdownMode]);

    const animateProgress = useCallback((uploadId: string, from: number, to: number, duration: number, onComplete?: () => void) => {
        if (fileProgressIntervals.current[uploadId]) {
            clearInterval(fileProgressIntervals.current[uploadId]);
        }
    
        const steps = duration / 20;
        const stepTime = 20;
        const increment = (to - from) / steps;
        let currentProgress = from;

        if (duration <= 0 || steps <= 0) {
            setUploadedFiles(prev => prev.map(f => f.id === uploadId ? { ...f, progress: to } : f));
            if (onComplete) onComplete();
            return;
        }
    
        const intervalId = window.setInterval(() => {
            currentProgress += increment;
    
            if (currentProgress >= to) {
                currentProgress = to;
                clearInterval(intervalId);
                delete fileProgressIntervals.current[uploadId];
            }
    
            setUploadedFiles(prev => prev.map(f => f.id === uploadId ? { ...f, progress: Math.round(currentProgress) } : f));
    
            if (currentProgress === to && onComplete) {
                onComplete();
            }
        }, stepTime);
        fileProgressIntervals.current[uploadId] = intervalId;
    }, []);

    const processFile = useCallback((upload: UploadFile) => {
        setUploadedFiles(prev => prev.map(f => f.id === upload.id ? { ...f, status: 'in_progress' } : f));
        animateProgress(upload.id, upload.progress, 90, 8000); // Animate to 90% while processing

        const handleProcessingComplete = (contentToAppend: string) => {
            animateProgress(upload.id, 90, 100, 400, () => {
                setUploadedFiles(prev => prev.map(f =>
                    f.id === upload.id
                    ? { ...f, status: 'completed', progress: 100, analysis: "Content extracted and appended." }
                    : f
                ));
            });

            setPastedText(prev => {
                const separator = prev.trim() ? '\n\n---\n\n' : '';
                return prev + separator + contentToAppend;
            });
            focusOnPasting();
            setIsMarkdownMode(true);
        };

        const file = upload.file;
        const reader = new FileReader();

        if (file.type.startsWith('image/')) {
            reader.onload = async (e) => {
                try {
                    const base64Data = (e.target?.result as string).split(',')[1];
                    const analysisResult = await analyzeImage(base64Data, file.type, "Describe this image in detail. What are the key elements and what context can be inferred from it?");
                    const content = `### Analysis of image: ${file.name}\n\n${analysisResult}`;
                    handleProcessingComplete(content);
                } catch (error: any) {
                     console.error("Image analysis failed:", error);
                    // FIX: Updated error handling for API key
                    if (error.message.includes("API key")) {
                         alert("API key not configured. Please ensure your API_KEY environment variable is set.");
                    }
                    setUploadedFiles(prev => prev.map(f => f.id === upload.id ? { ...f, status: 'error', progress: 0 } : f));
                }
            };
            reader.readAsDataURL(file);
        } else if (file.type === 'text/plain' || file.type === 'text/markdown') {
            reader.onload = (e) => {
                const textContent = e.target?.result as string;
                const content = `### Content from: ${file.name}\n\n${textContent}`;
                handleProcessingComplete(content);
            };
            reader.readAsText(file);
        } else {
            // For PDF, DOC, PPT, etc., use the filename as a research topic.
            const fileName = file.name;
            const placeholderContent = `### Sourced from: ${fileName}\n\n*This document will be used as a primary source during the "Refine" process to generate a comprehensive report on the topics it contains.*`;
            
            setTimeout(() => {
                handleProcessingComplete(placeholderContent);
            }, 1500); // Simulate processing time
        }
    }, [animateProgress]);

    const handleFiles = useCallback((files: File[]) => {
        const newUploads: UploadFile[] = files.map(file => ({
            id: crypto.randomUUID(),
            file,
            progress: 0,
            status: 'pending',
        }));
        setUploadedFiles(prev => [...prev, ...newUploads]);
        newUploads.forEach(processFile);
    }, [processFile]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            handleFiles(Array.from(event.target.files));
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        dragCounter.current = 0;
        setIsDraggingOver(false);
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            handleFiles(Array.from(event.dataTransfer.files));
        }
    };
    
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        focusOnPasting();
        setIsSearching(true);
        setIsMarkdownMode(false);
        setIsUserScrolledUp(false);
    
        const currentQuery = searchQuery;
        setSearchQuery('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    
        let isFirstChunk = true;
    
        try {
            const stream = searchLearningMaterialsStream(currentQuery, isSearchGroundingEnabled);
            for await (const chunk of stream) {
                if (isFirstChunk) {
                    isFirstChunk = false;
                    setPastedText(prev => {
                        const separator = prev.trim() ? '\n\n---\n\n' : '';
                        return prev + separator + chunk;
                    });
                } else {
                    setPastedText(prev => prev + chunk);
                }
            }
        } catch (error: any) {
            console.error("Streaming search failed:", error);
            // FIX: Updated error handling for API key
            if (error.message.includes("API key")) {
                alert("API key not configured. Please ensure your API_KEY environment variable is set.");
            } else {
                 setPastedText(prev => {
                    const separator = prev.trim() ? '\n\n---\n\n' : '';
                    return prev + separator + "Sorry, an error occurred while searching for materials.";
                });
            }
        } finally {
            setIsSearching(false);
            setIsMarkdownMode(true);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };
    
    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (!isUploadSectionVisible) {
            setIsUploadSectionVisible(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        dragCounter.current++;
        if (dragCounter.current > 0) {
            setIsDraggingOver(true);
        }
    };
    
    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setIsDraggingOver(false);
        }
    };

    const handleRefineText = async () => {
        if (!pastedText.trim() || isRefining) return;
        focusOnPasting();
        setIsRefining(true);
        setIsMarkdownMode(false);
        setIsUserScrolledUp(false);
        const originalText = pastedText;
        setPastedText('');
    
        const useSearch = true;

        try {
            const stream = refineTextStream(originalText, useSearch);
            for await (const chunk of stream) {
                setPastedText(prev => prev + chunk);
            }
        } catch (error: any) {
            console.error("Error refining text:", error);
            // FIX: Updated error handling for API key
            if (error.message.includes("API key")) {
                alert("API key not configured. Please ensure your API_KEY environment variable is set.");
                setPastedText(originalText);
            } else {
                setPastedText("Sorry, I couldn't refine the text at the moment.");
            }
        } finally {
            setIsRefining(false);
            setIsMarkdownMode(true);
        }
    };

    const handleSuggestExtendedTopics = async () => {
        if (!pastedText.trim() || isSuggestingTopics) return;
        setIsSuggestingTopics(true);
        try {
            const topics = await suggestExtendedTopics(pastedText);
            if (topics.length > 0) {
                setSuggestedTopics(topics);
                if (!showSuggestions) {
                    setShowSuggestions(true);
                }
            }
        } catch (error: any) {
            console.error("Failed to suggest extended topics:", error);
            // FIX: Updated error handling for API key
            if (error.message.includes("API key")) {
                alert("API key not configured. Please ensure your API_KEY environment variable is set.");
            }
        } finally {
            setIsSuggestingTopics(false);
        }
    };

    const handleRefineSearchQuery = async () => {
        if (!searchQuery.trim() || isSearching || isSearchRefining || isRecording) return;
        focusOnPasting();
        setIsSearchRefining(true);
        try {
            const refinedQuery = await refineUserPrompt(searchQuery);
            setSearchQuery(refinedQuery);
        } catch (error: any) {
            console.error("Error refining search query:", error);
            // FIX: Updated error handling for API key
             if (error.message.includes("API key")) {
                alert("API key not configured. Please ensure your API_KEY environment variable is set.");
            }
        } finally {
            setIsSearchRefining(false);
        }
    };

    const stopRecording = useCallback(() => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
        setIsRecording(false);
    }, []);

    const startRecording = useCallback(async () => {
        setIsRecording(true);
        let currentInputTranscription = '';

        try {
            // FIX: Pass correct config to connectLive for transcription
            const liveConfig: LiveConfig = { inputAudioTranscription: {} };
            sessionPromiseRef.current = connectLive({
                onopen: async () => {
                    try {
                        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                        const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
                        scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createPcmBlob(inputData);
                            if (sessionPromiseRef.current) {
                               sessionPromiseRef.current.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            }
                        };
                        source.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(audioContextRef.current.destination);
                    } catch (err) {
                        console.error('Error getting user media:', err);
                        let errorMessage = "I couldn't access your microphone. Please check your browser settings and hardware.";
                        if (err instanceof DOMException) {
                            if (err.name === 'NotFoundError') {
                                errorMessage = "No microphone found. Please connect a microphone and grant permission to use it.";
                            } else if (err.name === 'NotAllowedError') {
                                errorMessage = "Microphone access denied. Please allow microphone access in your browser's settings for this site.";
                            }
                        }
                        alert(errorMessage);
                        stopRecording();
                    }
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) {
                        const text = message.serverContent.inputTranscription.text;
                        currentInputTranscription += text;
                        setSearchQuery(currentInputTranscription);
                    }
                    if (message.serverContent?.turnComplete) {
                        stopRecording();
                    }
                },
                onerror: (e) => {
                    console.error('Live session error:', e);
                    alert("There was a connection error with the voice service. Please try again.");
                    stopRecording();
                },
                onclose: () => {
                    // Handled by stopRecording
                },
            }, liveConfig);
        } catch (error: any) {
            console.error('Live session error:', error);
            // FIX: Updated error handling for API key
            if (error.message.includes("API key")) {
                alert("API key not configured. Please ensure your API_KEY environment variable is set.");
            } else {
                alert("There was a connection error with the voice service. Please try again.");
            }
            stopRecording();
        }
    }, [stopRecording]);
    
    const toggleRecording = () => {
        focusOnPasting();
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const handleSuggestionsMouseEnter = () => {
        if (hideSuggestionsTimeoutRef.current) {
            clearTimeout(hideSuggestionsTimeoutRef.current);
            hideSuggestionsTimeoutRef.current = null;
        }
        if (!searchQuery.trim()) {
             setShowSuggestions(true);
        }
    };

    const handleSuggestionsMouseLeave = () => {
        hideSuggestionsTimeoutRef.current = window.setTimeout(() => {
            setShowSuggestions(false);
        }, 1500);
    };

    const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (value) {
            setShowSuggestions(false);
        }

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
        const textarea = e.currentTarget;
        const isAtBottom = textarea.scrollHeight - textarea.scrollTop <= textarea.clientHeight + 5;
        if (isAtBottom) {
            if (isUserScrolledUp) setIsUserScrolledUp(false);
        } else {
            if (!isUserScrolledUp) setIsUserScrolledUp(true);
        }
    };

    const handleLoadExampleClick = () => {
        setPastedText(EXAMPLE_CONTENT);
        setIsMarkdownMode(true);
        focusOnPasting();
    };

    const handleDone = () => {
        onDone(uploadedFiles, pastedText);
    };

    const stats = {
        pending: uploadedFiles.filter(f => f.status === 'pending').length,
        inProgress: uploadedFiles.filter(f => f.status === 'in_progress').length,
        completed: uploadedFiles.filter(f => f.status === 'completed').length,
    }

    const isSearchActive = isInputActive || searchQuery.length > 0;

    const generateSlug = (children: React.ReactNode): string => {
        const text = React.Children.toArray(children).map(child => {
            if (typeof child === 'string') return child;
            if (typeof child === 'object' && child !== null && 'props' in child && (child.props as any).children) {
                return generateSlug((child.props as any).children);
            }
            return '';
        }).join('');
    
        if (!text) return '';
    
        const value = text.toLowerCase();
        if (value.startsWith('introduction')) return 'introduction';
        if (value.startsWith('summary') || value.startsWith('conclusion')) return 'conclusion';
        if (value.startsWith('sources')) return 'sources';
    
        const chapterMatch = value.match(/^(chapter\s*\d+)/);
        if (chapterMatch) {
            return chapterMatch[0].replace(/\s+/g, '-');
        }
    
        return value
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };

    const markdownComponents = {
        a: ({ node, ...props }: any) => {
            if (props.href && props.href.startsWith('#')) {
                const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                    e.preventDefault();
                    const id = props.href.substring(1);
                    if (markdownContainerRef.current) {
                        const headingElement = markdownContainerRef.current.querySelector(`#${id}`);
                        if (headingElement) {
                            headingElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }
                };
                return <a {...props} onClick={handleClick} style={{cursor: 'pointer'}} />;
            }
            return <a {...props} target="_blank" rel="noopener noreferrer" />;
        },
        h1: ({node, ...props}) => <h1 id={generateSlug(props.children)} {...props} />,
        h2: ({node, ...props}) => <h2 id={generateSlug(props.children)} {...props} />,
        h3: ({node, ...props}) => <h3 id={generateSlug(props.children)} {...props} />,
        h4: ({node, ...props}) => <h4 id={generateSlug(props.children)} {...props} />,
        h5: ({node, ...props}) => <h5 id={generateSlug(props.children)} {...props} />,
        h6: ({node, ...props}) => <h6 id={generateSlug(props.children)} {...props} />,
    };

    return (
        <div 
            className="layout-container flex h-full grow flex-col font-inter"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
        >
            <header className="sticky top-0 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#232f48] px-10 py-3 bg-[#111722] z-30">
                <div className="flex items-center gap-4 text-white">
                    <LogoIcon />
                    <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">ReflectLearning</h2>
                </div>
                <div className="flex flex-1 items-center justify-end gap-8">
                    <button 
                        onClick={handleLoadExampleClick}
                        className="cursor-pointer items-center justify-center overflow-hidden rounded-full px-6 py-2 bg-[#fdffcd] border-[2.5px] border-solid border-yellow-400 text-neutral-800 text-sm font-medium leading-normal hover:bg-yellow-200"
                    >
                        Load Example
                    </button>
                    <div className="flex items-center rounded-full bg-[#111722] border-[2.5px] border-solid border-[#34405a] p-1 shadow-lg opacity-50">
                        <button className="flex-1 rounded-full px-4 py-2 text-sm font-bold leading-normal text-[#6b7280] cursor-not-allowed">Learning Mode</button>
                        <button className="flex-1 rounded-full px-4 py-2 text-sm font-bold leading-normal text-[#6b7280] cursor-not-allowed">Reflection Mode</button>
                    </div>
                    <div className="flex items-center gap-9">
                        <span className="text-white text-sm font-medium leading-normal">API Key Loaded</span>
                        <a className="text-white text-sm font-medium leading-normal" href="#">Help</a>
                        <a 
                            className="text-[#135bec] text-sm font-medium leading-normal hover:text-white transition-colors duration-200" 
                            href="docs/user-guide.html"
                        >
                            Documentation
                        </a>
                    </div>
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{ backgroundImage: `url("https://picsum.photos/40/40")` }}></div>
                </div>
            </header>
            
            <div className="fixed top-[84px] right-10 z-20 flex gap-3">
                <button 
                    onClick={() => setIsUploadSectionVisible(true)}
                    disabled={isUploadSectionVisible}
                    className="cursor-pointer items-center justify-center overflow-hidden rounded-full px-6 py-2 bg-[#232f48] border-[2.5px] border-solid border-[#34405a] text-sm font-medium leading-normal disabled:cursor-not-allowed disabled:text-[#6b7280] text-white hover:bg-[#34405a]"
                >
                    Upload Files
                </button>
                <button onClick={() => { setUploadedFiles([]); setPastedText(''); }} className="cursor-pointer items-center justify-center overflow-hidden rounded-full px-6 py-2 bg-[#232f48] border-[2.5px] border-solid border-[#34405a] text-white text-sm font-medium leading-normal hover:bg-[#34405a]">Clear all</button>
                <button onClick={handleDone} className="bg-[#135bec] text-white text-sm font-medium leading-normal px-6 py-2 rounded-full hover:bg-[#0d4bb8]">
                    Done
                </button>
            </div>

            <main className="px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
                <div className="layout-content-container flex flex-col w-full md:w-[512px] lg:w-[768px] py-5 flex-1 pb-80">
                    {isUploadSectionVisible && (
                        <>
                            <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-5">Upload Files</h3>
                            <div className="flex flex-col p-4">
                                <div 
                                    className={`flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed px-6 py-14 transition-colors ${isDraggingOver ? 'bg-[#232f48] border-[#135bec]' : 'border-[#324467]'}`}
                                >
                                    <div className="flex flex-col gap-2 text-center pointer-events-none">
                                        <p className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Drag and drop files here</p>
                                        <p className="text-white text-sm font-normal leading-normal">Or select files from your computer</p>
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />
                                    <button onClick={() => fileInputRef.current?.click()} className={`flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#232f48] text-white text-sm font-bold leading-normal tracking-[0.015em] shrink-0 hover:bg-[#34405a] ${isDraggingOver ? 'pointer-events-none' : ''}`}>
                                        <span className="truncate">Select Files</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    <div className={`flex items-center px-4 pb-2 ${isUploadSectionVisible ? 'pt-8' : 'pt-16'} ${isMarkdownMode ? 'justify-end' : 'justify-between'}`}>
                         {!isMarkdownMode && <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Paste contents / URLs</h3>}
                         <div className="flex items-center gap-4">
                            <button 
                                onClick={handleRefineText}
                                disabled={isRefining || !pastedText.trim()}
                                className="cursor-pointer items-center justify-center overflow-hidden rounded-full px-4 py-1 bg-[#232f48] border-[2.5px] border-solid border-[#34405a] text-white text-sm font-medium leading-normal hover:bg-[#34405a] disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isRefining ? 'Refining...' : 'Refine'}
                            </button>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium transition-colors ${!isMarkdownMode ? 'text-white' : 'text-[#92a4c9]'}`}>Text</span>
                                <button
                                    onClick={() => {
                                        setIsMarkdownMode(!isMarkdownMode);
                                        focusOnPasting();
                                    }}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        isMarkdownMode ? 'bg-[#135bec]' : 'bg-[#324467]'
                                    }`}
                                    role="switch"
                                    aria-checked={isMarkdownMode}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                            isMarkdownMode ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                </button>
                                <span className={`text-sm font-medium transition-colors ${isMarkdownMode ? 'text-white' : 'text-[#92a4c9]'}`}>Markdown</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 px-4 py-3">
                        <div>
                             {isMarkdownMode ? (
                                <div ref={markdownContainerRef} className="prose prose-invert max-w-none rounded-lg border border-[#324467] bg-[#192233] p-[15px] min-h-[190px] overflow-auto">
                                    <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{pastedText || "Nothing to preview. Switch to Text mode to start writing."}</Markdown>
                                </div>
                            ) : (
                                <div className="relative">
                                    <textarea 
                                        ref={editorTextareaRef}
                                        value={pastedText}
                                        onFocus={() => {
                                            setIsEditorFocused(true);
                                            focusOnPasting();
                                        }}
                                        onBlur={() => setIsEditorFocused(false)}
                                        onChange={(e) => {
                                            setPastedText(e.target.value);
                                            focusOnPasting();
                                        }}
                                        onScroll={handleScroll}
                                        className="form-textarea flex w-full min-w-0 flex-1 resize-none rounded-lg text-white focus:outline-0 focus:ring-0 border border-[#324467] bg-[#192233] focus:border-[#324467] placeholder:text-transparent p-[15px] text-base font-normal leading-normal"
                                        rows={8}>
                                    </textarea>
                                    {!pastedText && (
                                        <div className="absolute inset-0 flex flex-col justify-center pointer-events-none p-[15px] text-[#92a4c9] text-base font-normal">
                                            <p className="leading-normal">You can paste learning material and related URLs together here. The AI will sort them out for you.</p>
                                            <br />
                                            <p className="leading-normal">For example:</p>
                                            <p className="leading-normal">Chapter 3: Introduction to Variables...</p>
                                            <br />
                                            <p className="leading-normal">Some related URLs:</p>
                                            <p className="leading-normal">https://en.wikipedia.org/wiki/Variable_(computer_science)</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {uploadedFiles.length > 0 && (
                        <>
                        <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Uploading status</h3>
                        <div className="flex flex-col gap-2 px-4 py-3 bg-[#111722] rounded-lg">
                            <div className="flex gap-4 text-sm text-[#92a4c9] font-normal leading-normal">
                                <span>Pending: {stats.pending}</span>
                                <span>In Progress: {stats.inProgress}</span>
                                <span>Completed: {stats.completed}</span>
                            </div>
                        </div>
                        {uploadedFiles.map(file => <UploadStatusItem key={file.id} file={file} />)}
                        </>
                    )}
                </div>
            </main>

            <div className="fixed bottom-0 left-0 right-0 flex justify-center px-4 pb-3 z-20">
                <div 
                    className={`relative w-full transition-all duration-300 ease-in-out ${isSearchActive ? 'md:w-[700px] lg:w-[900px]' : 'md:w-[512px] lg:w-[768px]'}`}
                    onMouseEnter={handleSuggestionsMouseEnter}
                    onMouseLeave={handleSuggestionsMouseLeave}
                >
                    {showSuggestions && !searchQuery.trim() && (
                        <div className="absolute bottom-full w-full mb-2">
                            <div className="relative">
                                <div className="flex flex-wrap gap-2 pb-1">
                                    <button
                                        onClick={handleSuggestExtendedTopics}
                                        disabled={isSuggestingTopics || !pastedText.trim()}
                                        className="bg-[#fdffcd] border border-yellow-400 text-neutral-800 text-base px-4 py-2 rounded-2xl hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSuggestingTopics ? 'Suggesting...' : 'Suggest Topics'}
                                    </button>
                                    {suggestedTopics.map((topic, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSearchQuery(topic)}
                                            className="bg-[#232f48] border border-[#34405a] text-white text-base px-4 py-2 rounded-2xl hover:bg-[#34405a]"
                                        >
                                            {topic}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="w-full">
                        <div className={`flex w-full flex-1 border-[0.5px] border-solid border-[#34405a] bg-[#232f48] transition-all duration-300 ${isSearchActive ? 'rounded-3xl items-end' : 'rounded-full items-center'}`}>
                            <textarea
                                ref={textareaRef}
                                value={searchQuery}
                                onFocus={() => {
                                    setIsInputActive(true);
                                    focusOnPasting();
                                }}
                                onBlur={() => setIsInputActive(false)}
                                onChange={handleQueryChange}
                                className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-y-auto hide-scrollbar text-white focus:outline-0 focus:ring-0 border-none bg-transparent min-h-[48px] placeholder:text-[#92a4c9] px-4 text-base font-normal ${isSearchActive ? 'py-3 leading-normal' : 'leading-[48px]'}`}
                                placeholder="Help me to search material of..."
                                rows={1}
                                style={{ maxHeight: '200px' }}
                            />
                            <div className={`flex items-center pr-2 ${isSearchActive ? 'pb-2' : ''}`}>
                                <button onClick={toggleRecording} className={`flex items-center justify-center size-10 rounded-full border-[2.5px] border-solid border-[#34405a] text-white hover:bg-[#34405a] mr-2 ${isRecording ? 'bg-red-500' : 'bg-[#232f48]'}`}>
                                    <span className="material-symbols-outlined text-2xl">{isRecording ? 'stop' : 'mic'}</span>
                                </button>
                                <button
                                    onClick={() => setIsSearchGroundingEnabled(!isSearchGroundingEnabled)}
                                    className={`flex items-center justify-center size-10 rounded-full border-[2.5px] border-solid border-[#34405a] text-white mr-2 transition-colors ${isSearchGroundingEnabled ? 'bg-[#135bec]' : 'bg-[#232f48]'}`}
                                    title={isSearchGroundingEnabled ? 'Web search is ON' : 'Web search is OFF'}
                                    aria-label={isSearchGroundingEnabled ? 'Disable web search' : 'Enable web search'}
                                >
                                    <span className="material-symbols-outlined text-2xl">travel_explore</span>
                                </button>
                                <button 
                                    onClick={handleRefineSearchQuery} 
                                    disabled={!searchQuery.trim() || isSearching || isSearchRefining || isRecording}
                                    className="flex items-center justify-center size-10 rounded-full border-[2.5px] border-solid border-[#34405a] text-white hover:bg-[#34405a] mr-2 bg-[#232f48] disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Refine search query"
                                >
                                    <span className="material-symbols-outlined text-2xl">{isSearchRefining ? 'pending' : 'auto_fix_high'}</span>
                                </button>
                                <button onClick={handleSearch} disabled={isSearching || isRecording || isSearchRefining} className="min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#232f48] border-[2.5px] border-solid border-[#34405a] text-white text-sm font-medium leading-normal hover:bg-[#34405a] disabled:opacity-50 disabled:cursor-not-allowed">
                                    <span className="truncate">{isSearching ? 'Asking...' : 'Ask'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadPage;
