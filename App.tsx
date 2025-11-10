import React, { useState, useCallback } from 'react';
import UploadPage from './components/UploadPage';
import MainPage from './components/MainPage';
import { Page, ChatMessage, UploadFile } from './types';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('upload');
    const [initialText, setInitialText] = useState<string>('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

    const handleStartLearningSession = useCallback((files: UploadFile[], rawText: string) => {
        setInitialText(rawText);
        
        // Reset chat history for the new learning session
        setChatHistory([{
            id: crypto.randomUUID(),
            sender: 'ai',
            text: 'Great! I\'m now generating your personalized learning report based on the materials you provided. You can start exploring the content as it appears!'
        }]);
        
        setCurrentPage('main');
    }, []);

    const navigateToUpload = useCallback((currentContent?: string) => {
        setCurrentPage('upload');
        setInitialText(currentContent || '');
        setChatHistory([]);
    }, []);

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#111722] dark group/design-root overflow-x-hidden font-lexend">
            {currentPage === 'upload' ? (
                <UploadPage onDone={handleStartLearningSession} initialText={initialText} />
            ) : (
                <MainPage 
                    initialChatHistory={chatHistory} 
                    onNavigateToUpload={navigateToUpload}
                    initialText={initialText}
                />
            )}
        </div>
    );
};

export default App;