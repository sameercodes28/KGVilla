import { useState, useEffect } from 'react';
import { CostItem } from '@/types';
import { apiClient } from '@/lib/apiClient';
import { useTranslation } from '@/contexts/LanguageContext';

export interface Scenario {
    title: string;
    description: string;
    costDelta: number;
    items: CostItem[];
}

export interface Message {
    id: string;
    role: 'ai' | 'user';
    text?: string;
    items?: CostItem[];
    scenario?: Scenario;
    file?: File;
    timestamp: Date;
}

interface ChatResponse {
    text: string;
    scenario?: Scenario;
}

export function useChat(projectId?: string, currentItems: CostItem[] = []) {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const storageKey = projectId ? `kgvilla-chat-${projectId}` : null;

    // Load Chat History
    useEffect(() => {
        if (typeof window !== 'undefined' && storageKey) {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                try {
                     
                    const parsed = JSON.parse(saved);
                    // Restore Date objects
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const restored = parsed.map((m: any) => ({
                        ...m,
                        timestamp: new Date(m.timestamp)
                    }));
                    setMessages(restored);
                } catch (e) {
                    console.error("Failed to load chat history", e);
                }
            }
        } else {
            // Default welcome if no history
            setMessages([{
                id: 'welcome',
                role: 'ai',
                text: t('chat.welcome'),
                timestamp: new Date()
            }]);
        }
    }, [storageKey, t]);

    // Save Chat History
    useEffect(() => {
        if (typeof window !== 'undefined' && storageKey && messages.length > 0) {
            localStorage.setItem(storageKey, JSON.stringify(messages));
        }
    }, [messages, storageKey]);

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
        const currentInput = input;
        
        // Reset Inputs
        setInput('');
        setSelectedFile(null);
        setIsTyping(true);

        try {
            // 2. Determine Endpoint
            if (currentFile) {
                // FILE MODE: /analyze
                const formData = new FormData();
                formData.append('file', currentFile);

                const data = await apiClient.upload<CostItem[]>('/analyze', formData);

                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'ai',
                    text: `I've analyzed **${currentFile.name}**. Here is the preliminary Cost Breakdown based on BBR 2025 standards:`, 
                    items: data,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMsg]);

            } else {
                // TEXT MODE: /chat
                const data = await apiClient.post<ChatResponse>('/chat', {
                    message: currentInput,
                    currentItems: currentItems
                });

                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'ai',
                    text: data.text,
                    scenario: data.scenario, // Optional scenario
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMsg]);
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'ai',
                text: "Sorry, I encountered an error connecting to the AI Architect. Please try again.",
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
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
