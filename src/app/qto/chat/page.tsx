'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, Paperclip, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { BoQItem } from '@/types';

interface Message {
    id: string;
    role: 'ai' | 'user';
    text?: string;
    items?: BoQItem[]; // If the message contains data
    file?: File; // If user uploaded a file
    timestamp: Date;
}

export default function AIChatPage() {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSend = async () => {
        if (!input.trim() && !selectedFile) return;

        // 1. Add User Message to Chat
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
        
        // Clear input immediately
        setInput('');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        setIsTyping(true);

        // 2. Determine Action (File Analysis vs Text Chat)
        if (currentFile) {
            try {
                const formData = new FormData();
                formData.append('file', currentFile);

                const response = await fetch('https://kgvilla-api-30314481610.europe-north1.run.app/analyze', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) throw new Error('Analysis failed');

                const data: BoQItem[] = await response.json();

                // 3. Add AI Response with Data
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
            // Mock Text Response (Placeholder for pure text endpoint)
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

    return (
        <div className="min-h-screen bg-slate-50 pb-32 relative">
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
                            "flex flex-col max-w-[85%] md:max-w-[75%] rounded-2xl p-5 text-base leading-relaxed shadow-sm",
                            msg.role === 'user' 
                                ? "bg-blue-600 text-white rounded-br-sm" 
                                : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
                        )}>
                            {msg.role === 'ai' && !msg.items && (
                                <div className="flex items-center mb-2 text-purple-600 font-bold text-xs uppercase tracking-wide">
                                    <Bot className="h-4 w-4 mr-2" />
                                    AI Assistant
                                </div>
                            )}

                            {/* Message Text */}
                            <div className="whitespace-pre-wrap">
                                {msg.text}
                            </div>

                            {/* File Attachment Preview (User) */}
                            {msg.file && (
                                <div className="mt-3 flex items-center bg-white/20 p-3 rounded-lg border border-white/30">
                                    <FileText className="h-5 w-5 mr-2" />
                                    <span className="text-sm font-medium truncate max-w-[200px]">{msg.file.name}</span>
                                </div>
                            )}

                            {/* AI Data Items (The BoQ Result) */}
                            {msg.items && msg.items.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {msg.items.map((item, idx) => (
                                        <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                                            <div className="flex justify-between font-semibold text-slate-900">
                                                <span>{item.elementName}</span>
                                                <span>{item.totalCost?.toLocaleString('sv-SE')} kr</span>
                                            </div>
                                            <div className="flex justify-between text-slate-500 text-xs mt-1">
                                                <span>{item.quantity} {item.unit}</span>
                                                <span>{item.phase}</span>
                                            </div>
                                            {item.calculationLogic && (
                                                <p className="mt-2 text-xs text-slate-600 italic border-t border-slate-200 pt-2">
                                                    "{item.calculationLogic}"
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                    <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                                        <span>TOTAL ESTIMATE</span>
                                        <span>{msg.items.reduce((sum, i) => sum + (i.totalCost || 0), 0).toLocaleString('sv-SE')} kr</span>
                                    </div>
                                </div>
                            )}
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
                    {/* File Preview */}
                    {selectedFile && (
                        <div className="mb-2 mx-2 inline-flex items-center bg-white px-3 py-1.5 rounded-lg shadow-sm border border-blue-100 animate-in slide-in-from-bottom-2">
                            <span className="text-xs font-medium text-blue-600 mr-2">{selectedFile.name}</span>
                            <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-red-500">
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-2 flex items-center space-x-2">
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden" 
                            accept="image/*,application/pdf"
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
                            title="Attach Floor Plan"
                        >
                            <Paperclip className="h-5 w-5" />
                        </button>
                        
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={selectedFile ? "Add a note about this file..." : t('chat.placeholder')}
                            className="flex-1 pl-2 py-3 bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400"
                        />
                        <button
                            onClick={handleSend}
                            disabled={(!input.trim() && !selectedFile) || isTyping}
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
