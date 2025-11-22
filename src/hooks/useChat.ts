import { useState, useEffect } from 'react';
import { CostItem } from '@/types';
import { API_URL } from '@/lib/api';
import { useTranslation } from '@/contexts/LanguageContext';

export interface Message {
    id: string;
    role: 'ai' | 'user';
    text?: string;
    items?: CostItem[];
    file?: File;
    timestamp: Date;
}

export function useChat() {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Initialize welcome message
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                id: 'welcome',
                role: 'ai',
                text: t('chat.welcome'),
                timestamp: new Date()
            }]);
        }
    }, [t, messages.length]);

    const sendMessage = async () => {
        if (!input.trim() && !selectedFile) return;

        // 1. Optimistic UI
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            file: selectedFile || undefined,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        
        const currentFile = selectedFile;
        
        // Reset Inputs
        setInput('');
        setSelectedFile(null);
        setIsTyping(true);

        // 2. API Call
        if (currentFile) {
            try {
                const formData = new FormData();
                formData.append('file', currentFile);

                const response = await fetch(`${API_URL}/analyze`, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) throw new Error('Analysis failed');

                const data: CostItem[] = await response.json();

                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'ai',
                    text: `I've analyzed **${currentFile.name}**. Here is the preliminary Bill of Quantities based on BBR 2025 standards:`,
                    items: data,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMsg]);

            } catch (error) {
                console.error(error);
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'ai',
                    text: "Sorry, I encountered an error analyzing that file. Please try again.",
                    timestamp: new Date()
                }]);
            }
        } else {
            // Mock Text Response
            setTimeout(() => {
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'ai',
                    text: "I am currently optimized for analyzing floor plans. Please upload a PDF or Image for me to calculate costs!",
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMsg]);
                setIsTyping(false);
            }, 1000);
        }
        
        setIsTyping(false);
    };

    return {
        messages,
        input,
        setInput,
        selectedFile,
        setSelectedFile,
        isTyping,
        sendMessage
    };
}
