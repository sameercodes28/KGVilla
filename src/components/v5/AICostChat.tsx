'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    role: 'ai' | 'user';
    text: string;
    timestamp: Date;
}

export function AICostChat() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'ai',
            text: 'Hi! I can help you optimize your budget. Try asking: "How can I reduce the total cost by 500,000 SEK?"',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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

        // Mock AI response for now
        // TODO: Connect to backend /analyze endpoint context
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                text: "I've analyzed your request against BBR 2025 regulations. To reduce costs by 500k SEK, you could consider: 1. Switching from parquet to laminate flooring in the bedrooms (-45k SEK). 2. Removing the custom kitchen island (-85k SEK). Note that removing the secondary bathroom would require checking accessibility standards.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
            {/* Header */}
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center space-x-2">
                <div className="bg-blue-100 p-1.5 rounded-lg">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-900">AI Cost Consultant</h3>
                    <p className="text-xs text-slate-500">Expert in Swedish Construction Costs</p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex w-full",
                            msg.role === 'user' ? "justify-end" : "justify-start"
                        )}
                    >
                        <div className={cn(
                            "flex max-w-[80%] rounded-2xl p-4 text-sm",
                            msg.role === 'user' 
                                ? "bg-blue-600 text-white rounded-br-sm" 
                                : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm"
                        )}>
                            {msg.role === 'ai' && <Bot className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-blue-600" />}
                            <p className="leading-relaxed">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm p-4 shadow-sm flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about budget, regulations, or savings..."
                        className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
