'use client';

import { Home, Settings, FileText, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export function BottomNav() {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 px-6 py-4 z-50">
            <div className="max-w-2xl mx-auto flex justify-between items-center">
                <Link href="/" className="flex flex-col items-center text-blue-600">
                    <Home className="h-6 w-6" />
                    <span className="text-[10px] font-medium mt-1">Home</span>
                </Link>

                <button className="flex flex-col items-center text-slate-400 hover:text-slate-600 transition-colors" onClick={() => alert("Report generation coming soon!")}>
                    <FileText className="h-6 w-6" />
                    <span className="text-[10px] font-medium mt-1">Report</span>
                </button>

                <button className="flex flex-col items-center text-slate-400 hover:text-slate-600 transition-colors" onClick={() => alert("AI Chat coming soon!")}>
                    <MessageSquare className="h-6 w-6" />
                    <span className="text-[10px] font-medium mt-1">Ask AI</span>
                </button>

                <button className="flex flex-col items-center text-slate-400 hover:text-slate-600 transition-colors" onClick={() => alert("Settings coming soon!")}>
                    <Settings className="h-6 w-6" />
                    <span className="text-[10px] font-medium mt-1">Settings</span>
                </button>
            </div>
        </div>
    );
}
