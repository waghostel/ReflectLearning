import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage, OutlineItem, ReflectionMemory } from '../types';
// FIX: Update import to include LiveConfig type and Modality enum
import { generateImage, connectLive, refineTutorPrompt, getTutorResponse, generateParagraphTitle, rewriteChapterStream, rewriteQnAStream, generateChapterTitle, startReflection, getReflectionResponse, LiveConfig } from '../services/geminiService';
import { LogoIcon } from './Icons';
// FIX: Import Modality enum
import { LiveServerMessage, Blob, Modality } from '@google/genai';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- Audio Helper Functions ---
function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

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


// --- Component: Sidebar ---
interface SidebarProps {
    outline: OutlineItem[];
    currentIndex: number;
    onSelectChapter: (index: number) => void;
    onAddNewChapter: () => void;
    isCollapsed: boolean;
    setIsCollapsed: (isCollapsed: boolean) => void;
    isEditing: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ outline, currentIndex, onSelectChapter, onAddNewChapter, isCollapsed, setIsCollapsed, isEditing }) => {
    return (
        <aside className={`relative w-full sticky top-[65px] self-start h-[calc(100vh-65px)] flex flex-col gap-5 transition-all duration-300 ${isCollapsed ? 'p-0 border-r-0' : 'p-5 border-r border-solid border-r-[#232f48]'}`}>
            {!isCollapsed && (
                <>
                    <div className="group flex items-center justify-between">
                        <div className="w-8"></div> {/* Spacer */}
                        <h3 className="text-white font-inter text-base font-bold leading-normal text-center">Chapters</h3>
                        <button
                            onClick={onAddNewChapter}
                            disabled={isEditing}
                            className={`flex items-center justify-center size-8 rounded-full text-[#92a4c9] hover:text-white hover:bg-[#34405a] transition-colors disabled:text-gray-600 disabled:cursor-not-allowed disabled:hover:bg-transparent ${!isEditing ? 'group-hover:bg-[#34405a]' : ''}`}
                            title="Add new chapter"
                        >
                            <span className="material-symbols-outlined text-xl">add</span>
                        </button>
                    </div>
                    <div className="flex flex-col gap-2 flex-1 overflow-y-auto hide-scrollbar">
                        {outline.map((item, index) => (
                             <a
                                key={item.slug}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onSelectChapter(index);
                                }}
                                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-inter font-normal leading-normal cursor-pointer ${
                                    index === currentIndex
                                        ? 'bg-[#232f48] font-bold text-white'
                                        : 'text-[#92a4c9] hover:bg-[#232f48] hover:text-white'
                                }`}
                                href={`#${item.slug}`}
                            >
                                <span className="material-symbols-outlined text-base">
                                    {index < currentIndex ? 'check_circle' : (index === currentIndex ? 'radio_button_checked' : 'radio_button_unchecked')}
                                </span>
                                {item.title}
                            </a>
                        ))}
                    </div>
                </>
            )}
             <button onClick={() => setIsCollapsed(!isCollapsed)} className={`absolute top-1/2 -translate-y-1/2 flex h-32 w-6 items-center justify-center rounded-r-lg bg-[#34405a] text-white shadow-lg z-30 ${isCollapsed ? 'left-0' : '-right-[12px]'}`}>
                <span className="material-symbols-outlined text-base">{isCollapsed ? 'chevron_right' : 'chevron_left'}</span>
            </button>
        </aside>
    );
};

// --- Component: ChatMessageBubble ---
const ChatMessageBubble: React.FC<{
    message: ChatMessage;
    onContextMenu: (event: React.MouseEvent) => void;
    onSuggestionClick: (suggestion: string) => void;
    components: any;
}> = ({ message, onContextMenu, onSuggestionClick, components }) => {
    const isUser = message.sender === 'user';
    
    return (
        <div className="flex w-full flex-col gap-1">
            <p className="text-[#92a4c9] text-[13px] font-normal leading-normal">{isUser ? 'You' : 'AI Tutor'}</p>
            <div
                onContextMenu={onContextMenu}
                className={`relative group text-base font-normal leading-normal w-full rounded-lg px-4 py-3 text-white ${isUser ? 'bg-[#135bec]' : 'bg-[#232f48]'}`}
            >
                <div className="prose prose-invert prose-sm max-w-none">
                    <Markdown remarkPlugins={[remarkGfm]} components={components}>{message.text}</Markdown>
                    {message.image && <img src={message.image} alt="Generated content" className="mt-2 rounded-lg" />}
                </div>
                 {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => onSuggestionClick(suggestion)}
                                className="bg-[#34405a] border border-[#4a5a7f] text-white text-sm px-3 py-1 rounded-full hover:bg-[#4a5a7f]"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};


const ReflectionBoard: React.FC<{
    content: React.ReactNode;
    animationState: 'visible' | 'fading-out' | 'fading-in';
}> = ({ content, animationState }) => {
    const animationClass = animationState === 'fading-out' ? 'fading-out' : 'fading-in';
    return (
        <div className={`relative flex w-full flex-col bg-[#111722] p-4 rounded-lg overflow-hidden flex-1 reflection-slide ${animationClass}`}>
            <div className="bg-[#232f48] rounded-lg p-6 h-full flex flex-col items-start justify-start w-full overflow-y-auto">
                {typeof content === 'string' ? (
                     <div className="prose prose-invert max-w-none w-full text-left">
                        <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
                    </div>
                ) : (
                    content
                )}
            </div>
        </div>
    );
};

// --- Component: MainPage ---
interface MainPageProps {
    initialChatHistory: ChatMessage[];
    onNavigateToUpload: (content: string) => void;
    initialText: string;
}

const generateSlugFromNode = (children: React.ReactNode): string => {
    const text = React.Children.toArray(children).map(child => {
        if (typeof child === 'string') return child;
        if (typeof child === 'object' && child !== null && 'props' in child && (child.props as any).children) {
            return generateSlugFromNode((child.props as any).children);
        }
        return '';
    }).join('');

    const value = text
        .toLowerCase()
        .replace(/^#*\s*(q:)?\s*/, '')
        .trim();

    if (value.startsWith('introduction')) return 'introduction';
    if (value.startsWith('summary') || value.startsWith('conclusion')) return 'conclusion';
    if (value.startsWith('sources')) return 'sources';

    const chapterMatch = value.match(/^(chapter\s*\d+)/);
    if (chapterMatch) {
        return chapterMatch[0].replace(/\s+/g, '-');
    }

    return value
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
};

interface Section {
    id: string;
    type: 'preamble' | 'chapter' | 'conclusion' | 'sources' | 'other';
    title: string;
    content: string;
}

const MainPage: React.FC<MainPageProps> = ({ initialChatHistory, onNavigateToUpload, initialText }) => {
    const [messages, setMessages] = useState<ChatMessage[]>(initialChatHistory);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [isSearchEnabled, setIsSearchEnabled] = useState(false);
    const [isInputActive, setIsInputActive] = useState(false);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isTutorSidebarCollapsed, setIsTutorSidebarCollapsed] = useState(false);
    const [leftPanelWidth, setLeftPanelWidth] = useState(256);
    const [rightPanelWidth, setRightPanelWidth] = useState(360);
    const [viewMode, setViewMode] = useState<'learning' | 'reflection'>('learning');
    
    // State for live content generation
    const [sourceText, setSourceText] = useState<string>(initialText);
    const [sections, setSections] = useState<Section[]>([]);
    const [reportTitle, setReportTitle] = useState<string>('Generating Report...');
    const [isGenerating, setIsGenerating] = useState(true);
    
    // State for editing chapters
    const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);
    const [editingContent, setEditingContent] = useState<string>('');
    const [rewritingChapterIndex, setRewritingChapterIndex] = useState<number | null>(null);
    const [rewritingQnAChapterIndex, setRewritingQnAChapterIndex] = useState<number | null>(null);
    const [mainContentSnapshot, setMainContentSnapshot] = useState<string>('');
    const [rewritingContent, setRewritingContent] = useState<string>('');
    const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; sectionIndex: number | null }>({
        visible: false, x: 0, y: 0, sectionIndex: null
    });
    const [chatContextMenu, setChatContextMenu] = useState<{ visible: boolean; x: number; y: number; messageIndex: number | null }>({
        visible: false, x: 0, y: 0, messageIndex: null
    });

    // State for Reflection Mode
    const [reflectionMemory, setReflectionMemory] = useState<ReflectionMemory>({});
    const [reflectionState, setReflectionState] = useState<'idle' | 'warming_up' | 'active'>('idle');
    const [currentReflectionContent, setCurrentReflectionContent] = useState<React.ReactNode | null>(null);
    const [isReflecting, setIsReflecting] = useState(false);
    const [reflectionAnimationState, setReflectionAnimationState] = useState<'visible' | 'fading-out' | 'fading-in'>('visible');


    const chatContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const editorTextareaRef = useRef<HTMLTextAreaElement>(null);
    const contentContainerRef = useRef<HTMLDivElement>(null);
    const leftPanelRef = useRef<HTMLDivElement>(null);
    const rightPanelRef = useRef<HTMLDivElement>(null);

    const sessionPromiseRef = useRef<ReturnType<typeof connectLive> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    const handleMouseDown = useCallback((panel: 'left' | 'right') => (e: React.MouseEvent) => {
        e.preventDefault();
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    
        const leftPanel = leftPanelRef.current;
        const rightPanel = rightPanelRef.current;
    
        // Remove transition during drag for smoother feedback
        if (panel === 'left' && leftPanel) leftPanel.style.transition = 'none';
        if (panel === 'right' && rightPanel) rightPanel.style.transition = 'none';
    
        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (panel === 'left' && leftPanel) {
                let newWidth = moveEvent.clientX;
                newWidth = Math.max(200, Math.min(newWidth, 500));
                leftPanel.style.width = `${newWidth}px`;
            } else if (panel === 'right' && rightPanel) {
                let newWidth = window.innerWidth - moveEvent.clientX;
                newWidth = Math.max(300, Math.min(newWidth, 800));
                rightPanel.style.width = `${newWidth}px`;
            }
        };
    
        const handleMouseUp = () => {
            document.body.style.cursor = 'auto';
            document.body.style.userSelect = 'auto';
    
            // Re-enable transition
            if (leftPanel) leftPanel.style.transition = 'all 300ms ease 0s';
            if (rightPanel) rightPanel.style.transition = 'all 300ms ease 0s';
    
            if (panel === 'left' && leftPanel) {
                setLeftPanelWidth(leftPanel.offsetWidth);
            } else if (panel === 'right' && rightPanel) {
                setRightPanelWidth(rightPanel.offsetWidth);
            }
    
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, []);

    const handleCopy = useCallback((index: number) => {
        const textToCopy = messages[index]?.text || '';
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy);
        }
    }, [messages]);

    // Effect to synchronize the internal sourceText state with the initialText prop.
    useEffect(() => {
        setSourceText(initialText);
    }, [initialText]);

    // Effect to parse content from sourceText, creating the single source of truth: `sections`
    useEffect(() => {
        const contentToParse = sourceText;
        if (!contentToParse || !contentToParse.trim()) {
            setIsGenerating(false);
            return;
        }

        setIsGenerating(true);
        const h1Regex = /^# (.*)/m;
        const titleMatch = contentToParse.match(h1Regex);
        setReportTitle(titleMatch && titleMatch[1] ? titleMatch[1] : "Learning Report");

        const parts = contentToParse.split(/^## /m);
        const newSections: Section[] = [];

        if (parts.length > 1) {
            // The first part is everything before the first `##`, the preamble.
            if (parts[0].trim()) {
                 newSections.push({
                    id: crypto.randomUUID(),
                    type: 'preamble',
                    title: 'Preamble',
                    content: parts[0].trim(),
                });
            }

            // Process the rest of the parts, which start with a title.
            for (let i = 1; i < parts.length; i++) {
                const part = parts[i];
                const lines = part.split('\n');
                const title = lines[0].trim();
                const content = '## ' + part.trim();
                
                let type: Section['type'] = 'other';
                if (/^chapter\s*\d+/i.test(title)) {
                    type = 'chapter';
                } else if (/conclusion|summary/i.test(title)) {
                    type = 'conclusion';
                } else if (/sources|references/i.test(title)) {
                    type = 'sources';
                }

                newSections.push({ id: crypto.randomUUID(), type, title, content });
            }
        } else {
             // No '##' headings found, treat the whole thing as one section.
            newSections.push({
                id: crypto.randomUUID(),
                type: 'other',
                title: 'Content',
                content: contentToParse,
            });
        }
        
        setSections(newSections);
        // Set initial chapter index to the first actual chapter, or 0 if none exist
        const firstChapterIndex = newSections.findIndex(s => s.type === 'chapter');
        setCurrentSectionIndex(firstChapterIndex !== -1 ? firstChapterIndex : 0);

        setIsGenerating(false);
    }, [sourceText]);

    const lectureOutline: OutlineItem[] = sections
        .filter(section => section.type !== 'preamble')
        .map(section => ({
            title: section.title,
            slug: generateSlugFromNode(section.title),
        }));

    const outlineToSectionIndex = (outlineIndex: number) => {
        const outlineItem = lectureOutline[outlineIndex];
        return sections.findIndex(s => s.title === outlineItem.title);
    };

    const sectionToOutlineIndex = (sectionIndex: number) => {
        if (sectionIndex < 0 || sectionIndex >= sections.length) return -1;
        const sectionItem = sections[sectionIndex];
        return lectureOutline.findIndex(o => o.title === sectionItem.title);
    };
    
    const currentOutlineIndex = sectionToOutlineIndex(currentSectionIndex);


    const handleSendMessage = useCallback(async (text: string) => {
        if (!text.trim() || isLoading || isRefining) return;

        const newUserMessage: ChatMessage = { id: crypto.randomUUID(), sender: 'user', text };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        setIsLoading(true);

        try {
            if (text.trim().toLowerCase().startsWith("/generate")) {
                const prompt = text.replace("/generate", "").trim();
                const imageUrl = await generateImage(prompt);
                setMessages(prev => [...prev, {
                    id: crypto.randomUUID(), sender: 'ai', text: `Here is the image you requested for: "${prompt}"`, image: imageUrl || undefined,
                }]);
            } else {
                const currentChapterContent = sections[currentSectionIndex]?.content || "";
                const responseText = await getTutorResponse(text, currentChapterContent, [...messages, newUserMessage], isSearchEnabled);
                setMessages(prev => [...prev, { id: crypto.randomUUID(), sender: 'ai', text: responseText }]);
            }
        } catch (error: any) {
            console.error(error);
            // FIX: Updated error handling for API key
            if (error.message.includes("API key")) {
                setMessages(prev => [...prev, { id: crypto.randomUUID(), sender: 'ai', text: 'API key not configured. Please ensure your API_KEY environment variable is set.' }]);
            } else {
                setMessages(prev => [...prev, { id: crypto.randomUUID(), sender: 'ai', text: 'Sorry, something went wrong.' }]);
            }
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, messages, isRefining, sections, currentSectionIndex, isSearchEnabled]);

     const handleReflectionMessage = useCallback(async (text: string) => {
        if (!text.trim() || isReflecting) return;
    
        const newUserMessage: ChatMessage = { id: crypto.randomUUID(), sender: 'user', text };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        setIsReflecting(true);
        setReflectionAnimationState('fading-out');

        setTimeout(async () => {
            setCurrentReflectionContent(
                 <div className="flex items-center gap-2 text-[#92a4c9]">
                    <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-white"></div>
                    <span>Reflecting on your answer...</span>
                </div>
            );
            setReflectionAnimationState('fading-in');

            const currentSection = sections[currentSectionIndex];
            if (!currentSection) {
                setIsReflecting(false);
                return;
            }
    
            const memoryForChapter = reflectionMemory[currentSection.id] || '';
    
            try {
                const { updatedMemory, responseToUser, nextQuestion, imagePrompt, choices } = await getReflectionResponse(
                    currentSection.content,
                    memoryForChapter,
                    [...messages, newUserMessage],
                    text
                );
    
                setReflectionMemory(prev => ({ ...prev, [currentSection.id]: updatedMemory }));
                setMessages(prev => [...prev, { 
                    id: crypto.randomUUID(), 
                    sender: 'ai', 
                    text: responseToUser,
                    suggestions: choices || undefined,
                }]);
                
                const processedQuestion = nextQuestion;

                if (imagePrompt) {
                    setCurrentReflectionContent(
                        <div className="text-left w-full">
                            <div className="prose prose-invert max-w-none">
                                <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{processedQuestion}</Markdown>
                            </div>
                            <div className="flex items-center justify-center gap-2 mt-4 text-[#92a4c9]">
                                <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-white"></div>
                                <span>Generating visual aid...</span>
                            </div>
                        </div>
                    );
                    const imageUrl = await generateImage(imagePrompt);
                    setCurrentReflectionContent(
                         <div className="text-left w-full">
                            <div className="prose prose-invert max-w-none">
                                 <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{processedQuestion}</Markdown>
                            </div>
                            {imageUrl && <img src={imageUrl} alt={imagePrompt} className="mt-4 rounded-lg mx-auto max-h-96" />}
                        </div>
                    );
                } else {
                     setCurrentReflectionContent(
                        <div className="prose prose-invert max-w-none w-full text-left">
                           <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{processedQuestion}</Markdown>
                        </div>
                     );
                }
    
                if (reflectionState === 'warming_up') {
                    setReflectionState('active');
                }
    
            } catch (error: any) {
                console.error("Error during reflection:", error);
                 // FIX: Updated error handling for API key
                 if (error.message.includes("API key")) {
                    setMessages(prev => [...prev, { id: crypto.randomUUID(), sender: 'ai', text: "API key not configured. Please ensure your API_KEY environment variable is set." }]);
                } else {
                    setMessages(prev => [...prev, { id: crypto.randomUUID(), sender: 'ai', text: "Sorry, I had a moment of confusion. Let's try that again." }]);
                }
            } finally {
                setIsReflecting(false);
            }
        }, 300);
    }, [isReflecting, messages, sections, currentSectionIndex, reflectionMemory, reflectionState]);
    
    const combinedSendMessage = useCallback((text: string) => {
        if (viewMode === 'reflection') {
            handleReflectionMessage(text);
        } else {
            handleSendMessage(text);
        }
    }, [viewMode, handleSendMessage, handleReflectionMessage]);

    const markdownComponents = {
        a: ({ node, ...props }: any) => {
            if (props.href && props.href.startsWith('#')) {
                const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                    e.preventDefault();
                    const slug = props.href.substring(1);
                    
                    const outlineIndex = lectureOutline.findIndex(item => item.slug === slug);
                    if (outlineIndex !== -1) {
                        setCurrentSectionIndex(outlineToSectionIndex(outlineIndex));
                        return;
                    }
    
                    if (contentContainerRef.current) {
                        const headingElement = contentContainerRef.current.querySelector(`#${slug}`);
                        if (headingElement) {
                            headingElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }
                };
                return <a {...props} onClick={handleClick} style={{ cursor: 'pointer' }} />;
            }
            return <a {...props} target="_blank" rel="noopener noreferrer" />;
        },
        h1: ({ node, ...props }: any) => <h1 id={generateSlugFromNode(props.children)} {...props} />,
        h2: ({ node, ...props }: any) => <h2 id={generateSlugFromNode(props.children)} {...props} />,
        h3: ({ node, ...props }: any) => <h3 id={generateSlugFromNode(props.children)} {...props} />,
        h4: ({ node, ...props }: any) => <h4 id={generateSlugFromNode(props.children)} {...props} />,
        h5: ({ node, ...props }: any) => <h5 id={generateSlugFromNode(props.children)} {...props} />,
        h6: ({ node, ...props }: any) => <h6 id={generateSlugFromNode(props.children)} {...props} />,
        strong: ({node, ...props}: any) => <span className="highlighted-text-yellow" {...props} />,
        em: ({node, ...props}: any) => <span className="highlighted-text-red" {...props} />,
        li: ({ node, ...props }: any) => {
            const getNodeText = (n: any): string => {
                return n.children.map((child: any) => {
                    if (child.type === 'text') return child.value;
                    if (child.children) return getNodeText(child);
                    return '';
                }).join('');
            };
            const textContent = getNodeText(node).trim();
            const mcqMatch = textContent.match(/^(\d+)\)\s*(.*)/);
            
            const lastAiMessage = [...messages].reverse().find(m => m.sender === 'ai');

            if (mcqMatch && lastAiMessage?.suggestions?.some(s => s.trim().startsWith(mcqMatch[0].trim()))) {
                const letter = mcqMatch[1];
                const optionText = mcqMatch[2];
                return (
                    <li className="list-none my-2">
                        <button
                            onClick={() => combinedSendMessage(textContent)}
                            className="mcq-option"
                            disabled={isLoading || isReflecting}
                        >
                            <span className="mcq-letter">{letter}</span>
                            <span>{optionText}</span>
                        </button>
                    </li>
                );
            }
            return <li {...props} />;
        },
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);
    
    useEffect(() => {
        if (editorTextareaRef.current) {
            editorTextareaRef.current.style.height = 'auto';
            editorTextareaRef.current.style.height = `${editorTextareaRef.current.scrollHeight}px`;
        }
    }, [editingContent]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [userInput]);

    // Effect to handle clicks outside the context menus
    useEffect(() => {
        const handleClickOutside = () => {
            if (contextMenu.visible) setContextMenu(prev => ({ ...prev, visible: false }));
            if (chatContextMenu.visible) setChatContextMenu(prev => ({ ...prev, visible: false }));
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [contextMenu.visible, chatContextMenu.visible]);
    
    const handleRefinePrompt = useCallback(async () => {
        if (!userInput.trim() || isLoading || isRefining) return;
        setIsRefining(true);
        try {
            const currentChapterContent = sections[currentSectionIndex]?.content || "";
            const refinedPrompt = await refineTutorPrompt(userInput, currentChapterContent);
            setUserInput(refinedPrompt);
        } catch (error: any) {
            console.error("Error refining prompt:", error);
            // FIX: Updated error handling for API key
            if (error.message.includes("API key")) {
                alert("API key not configured. Please ensure your API_KEY environment variable is set.");
            }
        } finally {
            setIsRefining(false);
        }
    }, [userInput, isLoading, isRefining, sections, currentSectionIndex]);

    const handleSelectChapter = useCallback((outlineIndex: number) => {
        setCurrentSectionIndex(outlineToSectionIndex(outlineIndex));
    }, [sections, lectureOutline]);

    const handleNextChapter = () => {
        if (currentOutlineIndex < lectureOutline.length - 1) {
            setCurrentSectionIndex(outlineToSectionIndex(currentOutlineIndex + 1));
        }
    };
    
    const handlePreviousChapter = () => {
        if (currentOutlineIndex > 0) {
            setCurrentSectionIndex(outlineToSectionIndex(currentOutlineIndex - 1));
        }
    };
    
    const handleChapterContextMenu = (event: React.MouseEvent, sectionIndex: number) => {
        event.preventDefault();
        setContextMenu({ visible: true, x: event.pageX, y: event.pageY, sectionIndex });
    };
    
    const handleStartEdit = () => {
        if (contextMenu.sectionIndex !== null) {
            setEditingSectionIndex(contextMenu.sectionIndex);
            setEditingContent(sections[contextMenu.sectionIndex].content);
        }
        setContextMenu({ visible: false, x: 0, y: 0, sectionIndex: null });
    };
    
    const handleCancelEdit = () => {
        setEditingSectionIndex(null);
        setEditingContent('');
    };
    
    const handleSaveEdit = useCallback(() => {
        if (editingSectionIndex === null) return;
        
        setSections(prevSections => prevSections.map((section, index) => {
            if (index === editingSectionIndex) {
                const titleRegex = /^## (.*)/m;
                const newTitleMatch = editingContent.match(titleRegex);
                const newTitle = (newTitleMatch && newTitleMatch[1]) ? newTitleMatch[1].trim() : section.title;
                return { ...section, content: editingContent, title: newTitle };
            }
            return section;
        }));

        setEditingSectionIndex(null);
        setEditingContent('');
    }, [editingSectionIndex, editingContent]);

    const handleRewriteChapter = useCallback(async () => {
        const index = contextMenu.sectionIndex;
        if (index === null) return;

        setContextMenu({ visible: false, x: 0, y: 0, sectionIndex: null });
        setRewritingChapterIndex(index);
        
        const originalChapterContent = sections[index].content;
        let finalContent = '';
        
        setSections(prev => prev.map((s, i) => i === index ? { ...s, content: `## ${s.title}\n\nRewriting chapter...` } : s));
        
        try {
            const stream = rewriteChapterStream(originalChapterContent);
            for await (const chunk of stream) {
                finalContent += chunk;
                setSections(prev => prev.map((s, i) => i === index ? { ...s, content: finalContent } : s));
            }
        } catch (error: any) {
            console.error("Failed to rewrite chapter:", error);
            // FIX: Updated error handling for API key
            if (error.message.includes("API key")) {
                alert("API key not configured. Please ensure your API_KEY environment variable is set.");
            }
            setSections(prev => prev.map((s, i) => i === index ? { ...s, content: originalChapterContent } : s));
        } finally {
            setRewritingChapterIndex(null);
        }
    }, [contextMenu.sectionIndex, sections]);

    const handleRewriteQnA = useCallback(async () => {
        const index = contextMenu.sectionIndex;
        if (index === null) return;
    
        setContextMenu({ visible: false, x: 0, y: 0, sectionIndex: null });
        setRewritingQnAChapterIndex(index);
    
        const originalChapterContent = sections[index].content;
    
        const qaMarker = '### Q&A';
        const qaStartIndex = originalChapterContent.indexOf(qaMarker);
        const mainContentPart = qaStartIndex !== -1 
            ? originalChapterContent.substring(0, qaStartIndex).trim()
            : originalChapterContent.trim();
        
        setMainContentSnapshot(mainContentPart);
        setRewritingContent('### Q&A\n\nGenerating new Q&A section...');

        let finalQnAContent = '';
        try {
            const stream = rewriteQnAStream(originalChapterContent);
            for await (const chunk of stream) {
                finalQnAContent += chunk;
                setRewritingContent(finalQnAContent);
            }

            const finalFullContent = mainContentPart + '\n\n---\n\n' + finalQnAContent;
            setSections(prev => prev.map((s, i) => i === index ? { ...s, content: finalFullContent } : s));

        } catch (error: any) {
            console.error("Failed to rewrite Q&A:", error);
            // FIX: Updated error handling for API key
            if (error.message.includes("API key")) {
                alert("API key not configured. Please ensure your API_KEY environment variable is set.");
            }
            setSections(prev => prev.map((s, i) => i === index ? { ...s, content: originalChapterContent } : s));
        } finally {
            setRewritingQnAChapterIndex(null);
            setMainContentSnapshot('');
            setRewritingContent('');
        }
    }, [contextMenu.sectionIndex, sections]);
    
    const handleChatContextMenu = (event: React.MouseEvent, index: number) => {
        event.preventDefault();
        setChatContextMenu({ visible: true, x: event.pageX, y: event.pageY, messageIndex: index });
    };

    const handleAppendParagraph = useCallback(async () => {
        if (chatContextMenu.messageIndex === null) return;
        const index = chatContextMenu.messageIndex;
        const messageToAppend = messages[index];
        setChatContextMenu({ visible: false, x: 0, y: 0, messageIndex: null });
        if (!messageToAppend) return;
    
        const paragraphText = messageToAppend.text;
        const originalChapterContent = sections[currentSectionIndex].content;
        
        try {
            const paragraphTitle = await generateParagraphTitle(paragraphText);
            const newParagraphMarkdown = `### ${paragraphTitle}\n\n${paragraphText}`;
        
            let updatedChapterContent;
            const qaMarker = '### Q&A';
            const qaSectionStartIndex = originalChapterContent.indexOf(qaMarker);
        
            if (qaSectionStartIndex !== -1) {
                const contentBeforeQA = originalChapterContent.substring(0, qaSectionStartIndex).trim();
                const qaSectionContent = originalChapterContent.substring(qaSectionStartIndex);
                updatedChapterContent = `${contentBeforeQA}\n\n---\n\n${newParagraphMarkdown}\n\n${qaSectionContent}`;
            } else {
                updatedChapterContent = `${originalChapterContent}\n\n---\n\n${newParagraphMarkdown}`;
            }
        
            setSections(prev => prev.map((s, i) => i === currentSectionIndex ? { ...s, content: updatedChapterContent } : s));
        } catch (error: any) {
             console.error("Failed to generate title:", error);
            // FIX: Updated error handling for API key
            if (error.message.includes("API key")) {
                alert("API key not configured. Please ensure your API_KEY environment variable is set.");
            }
        }
    }, [chatContextMenu.messageIndex, messages, sections, currentSectionIndex]);

    const handleCreateChapter = useCallback(async () => {
        if (chatContextMenu.messageIndex === null) return;
        const index = chatContextMenu.messageIndex;
        const messageToUse = messages[index];
        setChatContextMenu({ visible: false, x: 0, y: 0, messageIndex: null });
        if (!messageToUse || !messageToUse.text.trim()) return;
    
        const chapterText = messageToUse.text;
        let baseTitle;

        try {
            baseTitle = await generateChapterTitle(chapterText);
        } catch(error: any) {
            console.error("Failed to generate title:", error);
            // FIX: Updated error handling for API key
            if (error.message.includes("API key")) {
               alert("API key not configured. Please ensure your API_KEY environment variable is set.");
            }
            return;
        }
        
        let insertIndex = sections.findIndex(s => s.type === 'conclusion' || s.type === 'sources');
        if (insertIndex === -1) insertIndex = sections.length;
    
        let lastChapterNumber = 0;
        for (let i = insertIndex - 1; i >= 0; i--) {
            const title = sections[i].title;
            const match = title.match(/^Chapter\s*(\d+)/i);
            if (match && match[1]) {
                lastChapterNumber = parseInt(match[1], 10);
                break;
            }
        }
        const newChapterNumber = lastChapterNumber + 1;
        
        const newTitle = `Chapter ${newChapterNumber}: ${baseTitle}`;
        const newChapterContent = `## ${newTitle}\n\n${chapterText}`;
    
        const newSection: Section = {
            id: crypto.randomUUID(),
            type: 'chapter',
            title: newTitle,
            content: newChapterContent
        };
        
        const updatedSections = [...sections];
        updatedSections.splice(insertIndex, 0, newSection);
        
        setSections(updatedSections);
        setCurrentSectionIndex(insertIndex);

    }, [chatContextMenu.messageIndex, messages, sections]);

    const handleAppendQA = useCallback(() => {
        if (chatContextMenu.messageIndex === null) return;
        const index = chatContextMenu.messageIndex;
        const currentMessage = messages[index];
        setChatContextMenu({ visible: false, x: 0, y: 0, messageIndex: null });

        let userQuestion = '', aiAnswer = '';
        if (currentMessage.sender === 'user') {
            userQuestion = currentMessage.text;
            if (messages[index + 1]?.sender === 'ai') aiAnswer = messages[index + 1].text;
        } else { 
            aiAnswer = currentMessage.text;
            if (messages[index - 1]?.sender === 'user') userQuestion = messages[index - 1].text;
        }
        if (!userQuestion || !aiAnswer) return;
    
        const originalChapterContent = sections[currentSectionIndex].content;
        const slug = generateSlugFromNode(userQuestion);
        const newPairMarkdown = `#### Q: ${userQuestion}\n**A:** ${aiAnswer}`;
    
        let updatedChapterContent;
        const qaHeader = '### Q&A';
        const qaStartIndex = originalChapterContent.indexOf(qaHeader);
    
        if (qaStartIndex === -1) {
            const newQaSection = `${qaHeader}\n- [${userQuestion}](#${slug})\n\n---\n\n${newPairMarkdown}`;
            updatedChapterContent = `${originalChapterContent}\n\n---\n\n${newQaSection}`;
        } else {
             updatedChapterContent = `${originalChapterContent}\n\n---\n\n${newPairMarkdown}`;
        }
        
        setSections(prev => prev.map((s, i) => i === currentSectionIndex ? { ...s, content: updatedChapterContent } : s));
    }, [chatContextMenu.messageIndex, messages, sections, currentSectionIndex]);
    
    const handleClearChatHistory = useCallback(() => {
        if (viewMode === 'reflection') {
            // Re-trigger the warm-up for the current chapter
            initiateReflection(currentSectionIndex);
        } else {
            setMessages(initialChatHistory);
        }
    }, [initialChatHistory, viewMode, currentSectionIndex]);
    
    const handleAddNewChapter = useCallback(() => {
        let insertIndex = sections.findIndex(s => s.type === 'conclusion' || s.type === 'sources');
        if (insertIndex === -1) insertIndex = sections.length; 
    
        let lastChapterNumber = 0;
        for (let i = insertIndex - 1; i >= 0; i--) {
            const title = sections[i].title;
            const match = title.match(/^Chapter\s*(\d+)/i);
            if (match && match[1]) {
                lastChapterNumber = parseInt(match[1], 10);
                break;
            }
        }
        const newChapterNumber = lastChapterNumber + 1;
        
        const newTitle = `Chapter ${newChapterNumber}: New Chapter Title`;
        const newChapterContent = `## ${newTitle}\n\nStart writing your content here.`;
        const newSection: Section = {
            id: crypto.randomUUID(),
            type: 'chapter',
            title: newTitle,
            content: newChapterContent,
        };
    
        const updatedSections = [...sections];
        updatedSections.splice(insertIndex, 0, newSection);
    
        setSections(updatedSections);
        setCurrentSectionIndex(insertIndex);
        setEditingSectionIndex(insertIndex);
        setEditingContent(newChapterContent);
    
    }, [sections]);

    const handleNavigateBackToUpload = () => {
        const fullContent = sections.map(s => s.content).join('\n\n');
        onNavigateToUpload(fullContent);
    };

    // --- Live API Handlers ---
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
        const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        let nextStartTime = 0;
        const sources = new Set<AudioBufferSourceNode>();
        let currentInputTranscription = '';
        let currentOutputTranscription = '';

        try {
            // FIX: Pass correct config to connectLive for conversation
            const liveConfig: LiveConfig = {
                responseModalities: [Modality.AUDIO],
                inputAudioTranscription: {},
                outputAudioTranscription: {},
            };
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
                        setMessages(prev => [...prev, { id: crypto.randomUUID(), sender: 'ai', text: errorMessage }]);
                        stopRecording();
                    }
                },
                onmessage: async (message: LiveServerMessage) => {
                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio) {
                        nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                        const source = outputAudioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputAudioContext.destination);
                        source.addEventListener('ended', () => sources.delete(source));
                        source.start(nextStartTime);
                        nextStartTime += audioBuffer.duration;
                        sources.add(source);
                    }
                    
                    if (message.serverContent?.interrupted) {
                        for (const source of sources.values()) source.stop();
                        sources.clear();
                        nextStartTime = 0;
                    }
    
                    if (message.serverContent?.inputTranscription) {
                        currentInputTranscription += message.serverContent.inputTranscription.text;
                    }
                    if (message.serverContent?.outputTranscription) {
                        currentOutputTranscription += message.serverContent.outputTranscription.text;
                    }
                    if (message.serverContent?.turnComplete) {
                        if(currentInputTranscription.trim()) {
                            setMessages(prev => [...prev, { id: crypto.randomUUID(), sender: 'user', text: currentInputTranscription }]);
                        }
                        if(currentOutputTranscription.trim()) {
                            setMessages(prev => [...prev, { id: crypto.randomUUID(), sender: 'ai', text: currentOutputTranscription }]);
                        }
                        currentInputTranscription = '';
                        currentOutputTranscription = '';
                    }
                },
                onerror: (e) => {
                    console.error('Live session error:', e);
                    setMessages(prev => [...prev, {id: crypto.randomUUID(), sender: 'ai', text: "There was a connection error. Please try again."}]);
                    stopRecording();
                },
                onclose: () => {
                    // Handled by stopRecording
                },
            }, liveConfig);
        } catch(error: any) {
            console.error('Live session error:', error);
            // FIX: Updated error handling for API key
            if (error.message.includes("API key")) {
                setMessages(prev => [...prev, { id: crypto.randomUUID(), sender: 'ai', text: 'API key not configured. Please ensure your API_KEY environment variable is set.' }]);
            } else {
                 setMessages(prev => [...prev, {id: crypto.randomUUID(), sender: 'ai', text: "There was a connection error. Please try again."}]);
            }
            stopRecording();
        }
    }, [stopRecording]);

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };
    
    const handleUserInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setUserInput(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            combinedSendMessage(userInput);
        }
    };

    // --- Reflection Mode Logic ---
    const initiateReflection = useCallback(async (sectionIndex: number) => {
        const section = sections[sectionIndex];
        if (!section) return;

        setReflectionState('warming_up');
        setMessages([]);
        setIsReflecting(true);
        setReflectionAnimationState('fading-out');

        setTimeout(async () => {
            setCurrentReflectionContent(
                <div className="flex items-center gap-2 text-[#92a4c9]">
                    <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-white"></div>
                    <span>Preparing reflection...</span>
                </div>
            );
            setReflectionAnimationState('fading-in');
            try {
                const { greeting, suggestions } = await startReflection(section.title, section.content);
                setMessages([{
                    id: crypto.randomUUID(),
                    sender: 'ai',
                    text: greeting,
                    suggestions: suggestions
                }]);
                setCurrentReflectionContent(
                    <div className="text-left w-full">
                        <h2 className="text-xl font-bold mb-4 text-white">Ready to Reflect?</h2>
                        <p className="mb-6 text-slate-300">Choose a topic below or in the chat to get started!</p>
                        <div className="flex flex-col gap-3">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleReflectionMessage(suggestion)}
                                    className="mcq-option"
                                    disabled={isReflecting}
                                >
                                    <span className="mcq-letter">{index + 1}</span>
                                    <span className="text-white">{suggestion}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            } catch (error: any) {
                console.error("Failed to start reflection session:", error);
                // FIX: Updated error handling for API key
                if (error.message.includes("API key")) {
                    setMessages([{ id: crypto.randomUUID(), sender: 'ai', text: "API key not configured. Please ensure your API_KEY environment variable is set." }]);
                } else {
                    setMessages([{ id: crypto.randomUUID(), sender: 'ai', text: "I'm having a bit of trouble starting our reflection. Please try again in a moment." }]);
                }
            } finally {
                setIsReflecting(false);
            }
        }, 300);
    }, [sections, isReflecting]);

    useEffect(() => {
        if (viewMode === 'reflection' && sections.length > 0) {
            initiateReflection(currentSectionIndex);
        } else {
            // Cleanup when switching away from reflection mode
            setReflectionState('idle');
            setCurrentReflectionContent(null);
            if (messages.length === 0 || reflectionState !== 'idle') {
                 setMessages(initialChatHistory);
            }
        }
    }, [viewMode, currentSectionIndex, sections, initialChatHistory]);


    const isChatInputActive = isInputActive || userInput.length > 0;
    const currentSectionContent = sections[currentSectionIndex]?.content;

    const currentDisplayContent = (rewritingQnAChapterIndex === currentSectionIndex)
        ? mainContentSnapshot + '\n\n---\n\n' + rewritingContent
        : currentSectionContent;

    return (
        <div className="layout-container flex min-h-screen grow flex-col">
            <header className="sticky top-0 z-30 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#232f48] px-10 py-3 bg-[#111722]">
                <div className="flex items-center gap-4 text-white">
                    <LogoIcon />
                    <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">ReflectLearning</h2>
                </div>
                <div className="flex flex-1 items-center justify-end gap-8">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center rounded-full bg-[#111722] border-[2.5px] border-solid border-[#34405a] p-1 shadow-lg">
                            <button onClick={() => setViewMode('learning')} className={`flex-1 rounded-full px-4 py-2 text-sm font-bold leading-normal text-white transition-colors ${viewMode === 'learning' ? 'bg-[#34405a]' : 'hover:bg-[#232f48]'}`}>Learning Mode</button>
                            <button onClick={() => setViewMode('reflection')} className={`flex-1 rounded-full px-4 py-2 text-sm font-bold leading-normal text-white transition-colors ${viewMode === 'reflection' ? 'bg-[#34405a]' : 'hover:bg-[#232f48]'}`}>Reflection Mode</button>
                        </div>
                        <button onClick={handleNavigateBackToUpload} className="rounded-full bg-[#232f48] px-4 py-2 text-sm font-bold leading-normal text-white hover:bg-[#34405a]">Upload New Material</button>
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
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" style={{ backgroundImage: `url('https://picsum.photos/seed/user/40/40')` }}></div>
                </div>
            </header>

            <div className="flex flex-1">
                {viewMode === 'learning' && (
                    <div 
                        ref={leftPanelRef}
                        className="relative transition-all duration-300 flex-shrink-0"
                        style={{ width: isSidebarCollapsed ? 0 : leftPanelWidth }}
                    >
                        <Sidebar 
                            outline={lectureOutline}
                            currentIndex={currentOutlineIndex}
                            onSelectChapter={handleSelectChapter}
                            onAddNewChapter={handleAddNewChapter}
                            isCollapsed={isSidebarCollapsed}
                            setIsCollapsed={setIsSidebarCollapsed}
                            isEditing={editingSectionIndex !== null}
                        />
                        {!isSidebarCollapsed && (
                             <>
                                <div
                                    onMouseDown={handleMouseDown('left')}
                                    className="absolute top-0 -right-1 h-[calc(50%-4rem)] w-2 cursor-col-resize z-20 group"
                                >
                                    <div className="w-[1px] h-full bg-transparent group-hover:bg-[#135bec] transition-colors" />
                                </div>
                                <div
                                    onMouseDown={handleMouseDown('left')}
                                    className="absolute bottom-0 -right-1 h-[calc(50%-4rem)] w-2 cursor-col-resize z-20 group"
                                >
                                    <div className="w-[1px] h-full bg-transparent group-hover:bg-[#135bec] transition-colors" />
                                </div>
                            </>
                        )}
                    </div>
                )}
                 <main 
                    className={`flex flex-1 transition-all duration-300 ${viewMode === 'reflection' ? 'flex-row' : ''}`}
                >
                    {viewMode === 'reflection' && (
                        <div className="flex w-2/5 flex-col py-5 px-6">
                            <Sidebar 
                                outline={lectureOutline}
                                currentIndex={currentOutlineIndex}
                                onSelectChapter={handleSelectChapter}
                                onAddNewChapter={handleAddNewChapter}
                                isCollapsed={false}
                                setIsCollapsed={() => {}}
                                isEditing={false}
                            />
                        </div>
                    )}
                    <div className={`flex flex-col flex-1 py-5 px-6 ${viewMode === 'reflection' ? 'w-3/5' : ''}`}>
                         {viewMode === 'learning' && (
                            <>
                                <div className="flex items-center justify-between px-4 pb-3 pt-5 gap-4">
                                    <h1 className="text-white text-2xl font-bold leading-tight tracking-[-0.015em]">{reportTitle}</h1>
                                    {lectureOutline.length > 0 && (
                                        <div className="flex items-center gap-3 text-white shrink-0">
                                            <button onClick={handlePreviousChapter} disabled={currentOutlineIndex === 0} className="flex size-10 items-center justify-center rounded-lg bg-[#232f48] hover:bg-[#34405a] disabled:opacity-50 disabled:cursor-not-allowed">
                                                <span className="material-symbols-outlined">chevron_left</span>
                                            </button>
                                            <div className="flex h-10 items-center justify-center rounded-lg bg-[#232f48] text-sm font-medium px-4">
                                                <span className="text-center whitespace-nowrap">{currentOutlineIndex + 1} / {lectureOutline.length}</span>
                                            </div>
                                            <button onClick={handleNextChapter} disabled={currentOutlineIndex === lectureOutline.length - 1} className="flex size-10 items-center justify-center rounded-lg bg-[#232f48] hover:bg-[#34405a] disabled:opacity-50 disabled:cursor-not-allowed">
                                                <span className="material-symbols-outlined">chevron_right</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="relative flex w-full flex-col bg-[#111722] p-4 rounded-lg overflow-hidden">
                                    <div 
                                        ref={contentContainerRef}
                                        className="bg-[#232f48] rounded-lg p-4"
                                        onContextMenu={(e) => handleChapterContextMenu(e, currentSectionIndex)}
                                    >
                                        {editingSectionIndex === currentSectionIndex ? (
                                             <div className="flex flex-col gap-4">
                                                <textarea
                                                    ref={editorTextareaRef}
                                                    value={editingContent}
                                                    onChange={(e) => setEditingContent(e.target.value)}
                                                    className="form-textarea w-full min-w-0 flex-1 resize-y rounded-lg text-white focus:outline-0 focus:ring-0 border border-[#324467] bg-[#192233] focus:border-[#135bec] p-3 text-base font-normal leading-normal font-mono"
                                                    rows={15}
                                                />
                                                <div className="flex justify-end gap-3">
                                                    <button onClick={handleCancelEdit} className="rounded-full bg-transparent border border-solid border-[#34405a] px-4 py-2 text-sm font-bold leading-normal text-white hover:bg-[#232f48]">Cancel</button>
                                                    <button onClick={handleSaveEdit} className="rounded-full bg-[#135bec] px-4 py-2 text-sm font-bold leading-normal text-white hover:bg-[#0d4bb8]">Save Changes</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="prose prose-invert max-w-none">
                                                <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                                    {currentDisplayContent || (isGenerating ? "Generating..." : "Select a chapter.")}
                                                </Markdown>
                                                {isGenerating && !currentDisplayContent && (
                                                    <div className="flex items-center gap-2 mt-4 text-[#92a4c9]">
                                                        <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-white"></div>
                                                        <span>Generating...</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                         )}
                         {viewMode === 'reflection' && (
                            <ReflectionBoard content={currentReflectionContent} animationState={reflectionAnimationState} />
                         )}
                    </div>
                </main>
                
                <div
                    ref={rightPanelRef}
                    className="relative transition-all duration-300 flex-shrink-0"
                    style={{
                        width: isTutorSidebarCollapsed ? 0 : rightPanelWidth,
                    }}
                >
                    <aside className={`relative sticky top-[65px] flex flex-col h-[calc(100vh-65px)] w-full ${!isTutorSidebarCollapsed && 'border-l border-solid border-l-[#232f48]'}`}>
                        <button 
                            onClick={() => setIsTutorSidebarCollapsed(!isTutorSidebarCollapsed)} 
                            className={`absolute top-1/2 -translate-y-1/2 flex h-32 w-6 items-center justify-center rounded-l-lg bg-[#34405a] text-white shadow-lg z-30 ${isTutorSidebarCollapsed ? 'right-0' : '-left-[12px]'}`}
                        >
                            <span className="material-symbols-outlined text-base">{isTutorSidebarCollapsed ? 'chevron_left' : 'chevron_right'}</span>
                        </button>
                        
                        {!isTutorSidebarCollapsed && (
                            <>
                                <div className="group flex items-center justify-between px-4 pb-3 pt-5">
                                    <div className="w-8"></div> {/* Spacer to balance the button */}
                                    <h1 className="text-white text-base font-bold leading-tight tracking-[-0.015em] text-center">AI Tutor</h1>
                                    <div className="w-8 h-8 flex items-center justify-center">
                                        <button 
                                            onClick={handleClearChatHistory}
                                            className="flex items-center justify-center size-8 rounded-full text-[#92a4c9] hover:text-white hover:bg-[#34405a] transition-opacity opacity-0 group-hover:opacity-100"
                                            title="Clear chat history"
                                        >
                                            <span className="material-symbols-outlined text-xl">cleaning_services</span>
                                        </button>
                                    </div>
                                </div>
                                <div ref={chatContainerRef} className="flex flex-col gap-4 px-4 overflow-y-auto flex-1 hide-scrollbar pb-20">
                                    {messages.map((msg, index) => (
                                        <ChatMessageBubble 
                                            key={msg.id} 
                                            message={msg} 
                                            onContextMenu={(e) => handleChatContextMenu(e, index)}
                                            onSuggestionClick={combinedSendMessage}
                                            components={markdownComponents}
                                        />
                                    ))}
                                    {(isLoading || isReflecting) && (
                                        <div className="flex w-full flex-col gap-1">
                                            <p className="text-[#92a4c9] text-[13px] font-normal leading-normal">AI Tutor</p>
                                            <div className="text-base font-normal leading-normal w-full rounded-lg px-4 py-3 text-white bg-[#232f48]">
                                                <span className="animate-pulse">Thinking...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                    </aside>
                     {!isTutorSidebarCollapsed && (
                        <>
                            <div
                                onMouseDown={handleMouseDown('right')}
                                className="absolute top-0 -left-1 h-[calc(50%-4rem)] w-2 cursor-col-resize z-20 group"
                            >
                                <div className="w-[1px] h-full bg-transparent group-hover:bg-[#135bec] transition-colors" />
                            </div>
                             <div
                                onMouseDown={handleMouseDown('right')}
                                className="absolute bottom-0 -left-1 h-[calc(50%-4rem)] w-2 cursor-col-resize z-20 group"
                            >
                                <div className="w-[1px] h-full bg-transparent group-hover:bg-[#135bec] transition-colors" />
                            </div>
                        </>
                    )}
                </div>
            </div>
            
             {contextMenu.visible && (
                <div
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    className="absolute z-50 bg-[#111722] border border-[#34405a] rounded-md shadow-lg py-1"
                >
                    <button
                        onClick={handleStartEdit}
                        disabled={rewritingChapterIndex !== null || rewritingQnAChapterIndex !== null}
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#232f48] disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                        Edit Chapter
                    </button>
                    <button
                        onClick={handleRewriteChapter}
                        disabled={rewritingChapterIndex !== null || rewritingQnAChapterIndex !== null}
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#232f48] disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                        Rewrite Chapter
                    </button>
                     <button
                        onClick={handleRewriteQnA}
                        disabled={rewritingChapterIndex !== null || rewritingQnAChapterIndex !== null}
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#232f48] disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                        Rewrite Q&A
                    </button>
                </div>
            )}
            
            {chatContextMenu.visible && (
                <div
                    style={{ top: chatContextMenu.y, left: chatContextMenu.x }}
                    className="absolute z-50 bg-[#111722] border border-[#34405a] rounded-md shadow-lg py-1"
                >
                    <button
                        onClick={() => {
                            if (chatContextMenu.messageIndex !== null) {
                                handleCopy(chatContextMenu.messageIndex);
                            }
                            setChatContextMenu(prev => ({ ...prev, visible: false }));
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#232f48]"
                    >
                        Copy
                    </button>
                    {viewMode === 'learning' && (
                        <>
                            <button
                                onClick={handleAppendParagraph}
                                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#232f48]"
                            >
                                Append Paragraph
                            </button>
                            <button
                                onClick={handleAppendQA}
                                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#232f48]"
                            >
                                Append Q&A
                            </button>
                            <button
                                onClick={handleCreateChapter}
                                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#232f48]"
                            >
                                Create Chapter
                            </button>
                        </>
                    )}
                </div>
            )}

            <div className="fixed bottom-0 left-0 right-0 flex justify-center px-4 py-3 z-20">
                <div className={`relative w-full transition-all duration-300 ease-in-out ${isChatInputActive ? 'md:w-[700px] lg:w-[900px]' : 'md:w-[512px] lg:w-[768px]'}`}>
                    <div className={`flex w-full flex-1 border-[0.5px] border-solid border-[#34405a] bg-[#232f48] transition-all duration-300 ${isChatInputActive ? 'rounded-3xl items-end' : 'rounded-full items-center'}`}>
                        <textarea
                            ref={textareaRef}
                            value={userInput}
                            onChange={handleUserInputChange}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsInputActive(true)}
                            onBlur={() => setIsInputActive(false)}
                            className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-y-auto hide-scrollbar text-white focus:outline-0 focus:ring-0 border-none bg-transparent min-h-[48px] placeholder:text-[#92a4c9] px-4 text-base font-normal ${isChatInputActive ? 'py-3 leading-normal' : 'leading-[48px]'}`}
                            placeholder="Type your answer here or ask the AI Tutor..."
                            rows={1}
                            style={{ maxHeight: '200px' }}
                        />
                        <div className={`flex items-center pr-2 ${isChatInputActive ? 'pb-2' : ''}`}>
                            <button onClick={toggleRecording} className={`flex items-center justify-center size-10 rounded-full border-[2.5px] border-solid border-[#34405a] text-white hover:bg-[#34405a] mr-2 ${isRecording ? 'bg-red-500' : 'bg-[#232f48]'}`}>
                                <span className="material-symbols-outlined text-2xl">{isRecording ? 'stop' : 'mic'}</span>
                            </button>
                            <button 
                                onClick={() => setIsSearchEnabled(!isSearchEnabled)} 
                                className={`flex items-center justify-center size-10 rounded-full border-[2.5px] border-solid border-[#34405a] text-white hover:bg-[#34405a] mr-2 transition-colors ${isSearchEnabled ? 'bg-[#135bec]' : 'bg-[#232f48]'}`}
                                title={isSearchEnabled ? 'Web search is ON' : 'Web search is OFF'}
                                aria-label={isSearchEnabled ? 'Disable web search' : 'Enable web search'}
                            >
                                <span className="material-symbols-outlined text-2xl">travel_explore</span>
                            </button>
                            <button 
                                onClick={handleRefinePrompt} 
                                disabled={!userInput.trim() || isLoading || isRefining || viewMode === 'reflection'}
                                className="flex items-center justify-center size-10 rounded-full border-[2.5px] border-solid border-[#34405a] text-white hover:bg-[#34405a] mr-2 bg-[#232f48] disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Refine prompt"
                            >
                                <span className="material-symbols-outlined text-2xl">{isRefining ? 'pending' : 'auto_fix_high'}</span>
                            </button>
                            <button onClick={() => combinedSendMessage(userInput)} disabled={isLoading || isRefining || !userInput.trim() || isReflecting} className="min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#232f48] border-[2.5px] border-solid border-[#34405a] text-white text-sm font-medium leading-normal hover:bg-[#34405a] disabled:opacity-50 disabled:cursor-not-allowed">
                                <span className="truncate">Submit</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainPage;
