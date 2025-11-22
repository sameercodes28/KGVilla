'use client';

import { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    sender: 'ai' | 'user';
    text: string;
    timestamp: Date;
}

export function ClarificationInterface() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'm1',
            sender: 'ai',
            text: 'Hej! Jag har analyserat ritningen för Hus 1405. Jag ser att det finns ett garage (33.7 m²). Ska detta utrymme ha golvvärme?',
            timestamp: new Date(),
        }
    ]);
    const [inputValue, setInputValue] = useState('');

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: inputValue,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue('');

        // Simulate AI response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: 'Uppfattat. Jag lägger till golvvärme även i garaget och uppdaterar kalkylen.',
                timestamp: new Date(),
            }]);
        }, 1000);
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "fixed bottom-8 right-8 h-14 w-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all z-50",
                    isOpen && "hidden"
                )}
            >
                <MessageSquare className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Chat Window */}
            <div className={cn(
                "fixed bottom-8 right-8 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col transition-all duration-300 z-50",
                isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
            )} style={{ height: '500px' }}>

                {/* Header */}
                <div className="p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-slate-900">AI Assistent</h3>
                        <p className="text-xs text-slate-500">Frågor & Förtydliganden</p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "max-w-[80%] p-3 rounded-lg text-sm",
                                msg.sender === 'user'
                                    ? "ml-auto bg-blue-600 text-white rounded-br-none"
                                    : "bg-slate-100 text-slate-800 rounded-bl-none"
                            )}
                        >
                            {msg.text}
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Skriv ett svar..."
                            className="flex-1 h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                        />
                        <button
                            onClick={handleSend}
                            className="h-10 w-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
