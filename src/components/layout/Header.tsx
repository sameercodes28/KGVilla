'use client';

import { Bell, Search } from 'lucide-react';

export function Header() {
    return (
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center">
                <h1 className="text-xl font-semibold text-slate-800">Nybyggnad Villa Svensson</h1>
                <span className="mx-3 text-slate-300">/</span>
                <span className="text-sm text-slate-500 font-medium">Mängdning</span>
            </div>

            <div className="flex items-center space-x-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Sök i projektet..."
                        className="h-9 w-64 rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>
                <button className="h-9 w-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-red-500"></span>
                </button>
            </div>
        </header>
    );
}
