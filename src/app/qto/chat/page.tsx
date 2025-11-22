'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

interface Message {
    id: string;
    role: 'ai' | 'user';
    text: string;
    timestamp: Date;
}

export default function AIChatPage() {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize welcome message
    useEffect(() => {
        setMessages([{
            id: 'welcome',
            role: 'ai',
            text: t('chat.welcome'),
            timestamp: new Date()
        }]);
    }, [t]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Mock AI Response
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                text: "This is a placeholder for the real AI backend response. In the next step, we will connect this to Google Vertex AI to give you real budget advice based on BBR regulations.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24 relative">
            <LanguageToggle />
            
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 shadow-sm">
                <div className="max-w-3xl mx-auto flex items-center space-x-3">
                    <div className="bg-purple-100 p-2 rounded-xl">
                        <Sparkles className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">{t('chat.title')}</h1>
                        <p className="text-sm text-slate-500">{t('chat.subtitle')}</p>
                    </div>
                </div>
            </div>

            {/* Chat Stream */}
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                            msg.role === 'user' ? "justify-end" : "justify-start"
                        )}
                    >
                        <div className={cn(
                            "flex max-w-[85%] md:max-w-[75%] rounded-2xl p-5 text-base leading-relaxed shadow-sm",
                            msg.role === 'user' 
                                ? "bg-blue-600 text-white rounded-br-sm" 
                                : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
                        )}>
                            {msg.role === 'ai' && (
                                <div className="mr-4 mt-1 shrink-0">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <Bot className="h-5 w-5 text-purple-600" />
                                    </div>
                                </div>
                            )}
                            <div>
                                {msg.text}
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                         <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm p-5 shadow-sm flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            <span className="ml-2 text-xs text-slate-400">{t('chat.typing')}</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="fixed bottom-[80px] left-0 right-0 px-4 z-20">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-2 flex items-center space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={t('chat.placeholder')}
                            className="flex-1 pl-4 py-3 bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
