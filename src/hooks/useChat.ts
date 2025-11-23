import { useState, useEffect } from 'react';
import { CostItem } from '@/types';
import { API_URL } from '@/lib/api';
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

            } else {
                // TEXT MODE: /chat
                const response = await fetch(`${API_URL}/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: currentInput,
                        currentItems: currentItems
                    })
                });

                if (!response.ok) throw new Error('Chat failed');

                const data = await response.json();

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
