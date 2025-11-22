'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Send, Bot, Sparkles, Paperclip, X, FileText, ChevronDown, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useChat } from '@/hooks/useChat';
import { useProjects } from '@/hooks/useProjects';
import { useProjectData } from '@/hooks/useProjectData';

/**
 * AIChatPage Component
 * 
 * This is the main interface for the "AI Analysis" tab.
 * It provides a chat-like experience similar to ChatGPT but specialized for construction.
 * 
 * Architecture:
 * - Uses `useChat` hook for state and API logic.
 * - Uses `useProjects` to allow switching context.
 */
export default function AIChatPage() {
    const { t } = useTranslation();
    const { projects } = useProjects();
    
    // Project Selection State
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');

    // Select first project by default if available
    useEffect(() => {
        if (projects.length > 0 && !selectedProjectId) {
            // eslint-disable-next-line
            setSelectedProjectId(projects[0].id);
        }
    }, [projects, selectedProjectId]);

    const selectedProject = projects.find(p => p.id === selectedProjectId);
    
    // Fetch data for context card
    const { totalCost, floorPlanUrl } = useProjectData(selectedProjectId);

    const { 
        messages, 
        input, 
        setInput, 
        selectedFile, 
        setSelectedFile, 
        isTyping, 
        sendMessage 
    } = useChat(selectedProjectId);
    
    // Refs for auto-scrolling and hidden file input
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom whenever messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Handle file selection from the hidden input
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSend = () => {
        sendMessage();
        // Reset file input ref visually
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-32 relative flex flex-col">
            <LanguageToggle />
            
            {/* Sticky Header with Project Selector */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 shadow-sm">
                <div className="max-w-3xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="bg-purple-100 p-2 rounded-xl">
                            <Sparkles className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">{t('chat.title')}</h1>
                            <p className="text-sm text-slate-500">{t('chat.subtitle')}</p>
                        </div>
                    </div>

                    {/* Project Selector */}
                    <div className="relative group">
                        <button className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium transition-colors">
                            <Building className="h-4 w-4 text-slate-500" />
                            <span>{selectedProject?.name || 'Select Project'}</span>
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                        </button>
                        {/* Dropdown Menu */}
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden hidden group-hover:block z-50">
                            {projects.map(p => (
                                <button 
                                    key={p.id}
                                    onClick={() => setSelectedProjectId(p.id)}
                                    className={cn(
                                        "w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0",
                                        selectedProjectId === p.id ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700"
                                    )}
                                >
                                    {p.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Project Context Card */}
            {selectedProject && (
                <div className="max-w-3xl mx-auto w-full px-4 mt-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center space-x-4 shadow-sm">
                        {/* Thumbnail */}
                        <div className="h-20 w-20 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex-shrink-0">
                            {floorPlanUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={floorPlanUrl} alt="Plan" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-300">
                                    <FileText className="h-8 w-8" />
                                </div>
                            )}
                        </div>
                        {/* Details */}
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900">{selectedProject.name}</h3>
                            <p className="text-xs text-slate-500 mb-2">{selectedProject.location}</p>
                            <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-bold">
                                Est. Cost: {totalCost.toLocaleString('sv-SE')} kr
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Messages Area */}
            <div className="max-w-3xl mx-auto w-full px-4 py-8 space-y-6 flex-1">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                            msg.role === 'user' ? "justify-end" : "justify-start"
                        )}
                    >
                        {/* Message Bubble */}
                        <div className={cn(
                            "flex flex-col max-w-[85%] md:max-w-[75%] rounded-2xl p-5 text-base leading-relaxed shadow-sm",
                            msg.role === 'user' 
                                ? "bg-blue-600 text-white rounded-br-sm" 
                                : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
                        )}>
                            {/* AI Label */}
                            {msg.role === 'ai' && !msg.items && (
                                <div className="flex items-center mb-2 text-purple-600 font-bold text-xs uppercase tracking-wide">
                                    <Bot className="h-4 w-4 mr-2" />
                                    AI Assistant
                                </div>
                            )}

                            {/* Text Content */}
                            <div className="whitespace-pre-wrap">
                                {msg.text}
                            </div>

                            {/* File Attachment Preview (in User message) */}
                            {msg.file && (
                                <div className="mt-3 flex items-center bg-white/20 p-3 rounded-lg border border-white/30">
                                    <FileText className="h-5 w-5 mr-2" />
                                    <span className="text-sm font-medium truncate max-w-[200px]">{msg.file.name}</span>
                                </div>
                            )}

                            {/* Structured Data Display (in AI message) */}
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
                                            {/* AI Reasoning "Thought Bubble" */}
                                            {item.calculationLogic && (
                                                <p className="mt-2 text-xs text-slate-600 italic border-t border-slate-200 pt-2">
                                                    &quot;{item.calculationLogic}&quot;
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

                {/* Typing Indicator */}
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

            {/* Input Bar */}
            <div className="fixed bottom-[80px] left-0 right-0 px-4 z-20">
                <div className="max-w-3xl mx-auto">
                    {/* Selected File Preview */}
                    {selectedFile && (
                        <div className="mb-2 mx-2 inline-flex items-center bg-white px-3 py-1.5 rounded-lg shadow-sm border border-blue-100 animate-in slide-in-from-bottom-2">
                            <span className="text-xs font-medium text-blue-600 mr-2">{selectedFile.name}</span>
                            <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-red-500">
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-2 flex items-center space-x-2">
                        {/* Hidden File Input */}
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden" 
                            accept="image/*,application/pdf"
                        />
                        {/* Attachment Button */}
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
                            title="Attach Floor Plan"
                        >
                            <Paperclip className="h-5 w-5" />
                        </button>
                        
                        {/* Text Input */}
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={selectedFile ? "Add a note about this file..." : t('chat.placeholder')}
                            className="flex-1 pl-2 py-3 bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400"
                        />
                        
                        {/* Send Button */}
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