'use client';

import { Home, FileText, MessageSquare, Sparkles, Globe } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export function BottomNav() {
    const pathname = usePathname();
    const { t, language, setLanguage } = useTranslation();

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        return pathname.startsWith(path);
    };

    return (
        <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-4 py-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="max-w-2xl mx-auto flex justify-between items-center">
                {/* Navigation Links */}
                <div className="flex justify-around items-center flex-1 max-w-md">
                    <Link
                        href="/"
                        className={cn(
                            "flex flex-col items-center p-2 rounded-xl transition-all duration-300",
                            isActive('/') ? "text-red-600 scale-105" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <Home className={cn("h-6 w-6 mb-1", isActive('/') && "fill-red-600/10")} />
                        <span className="text-[10px] font-medium tracking-wide">{t('nav.home')}</span>
                    </Link>

                    <Link
                        href="/qto"
                        className={cn(
                            "flex flex-col items-center p-2 rounded-xl transition-all duration-300",
                            isActive('/qto') && !pathname.includes('/chat') ? "text-red-600 scale-105" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <FileText className={cn("h-6 w-6 mb-1", isActive('/qto') && !pathname.includes('/chat') && "fill-red-600/10")} />
                        <span className="text-[10px] font-medium tracking-wide">{t('nav.project_view')}</span>
                    </Link>

                    <Link
                        href="/qto/chat"
                        className={cn(
                            "flex flex-col items-center p-2 rounded-xl transition-all duration-300",
                            isActive('/qto/chat') ? "text-purple-600 scale-105" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <div className="relative">
                            <MessageSquare className={cn("h-6 w-6 mb-1", isActive('/qto/chat') && "fill-purple-600/10")} />
                            <Sparkles className={cn("absolute -top-1 -right-1 h-3 w-3 text-purple-500 animate-pulse", !isActive('/qto/chat') && "hidden")} />
                        </div>
                        <span className="text-[10px] font-medium tracking-wide">{t('nav.ai_analysis')}</span>
                    </Link>
                </div>

                {/* Language Toggle */}
                <div className="flex items-center gap-1 bg-slate-100 rounded-full p-0.5 ml-4">
                    <button
                        onClick={() => setLanguage('en')}
                        className={cn(
                            "flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold transition-all",
                            language === 'en'
                                ? "bg-red-600 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <Globe className="h-3 w-3" />
                        <span>EN</span>
                    </button>
                    <button
                        onClick={() => setLanguage('sv')}
                        className={cn(
                            "flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold transition-all",
                            language === 'sv'
                                ? "bg-red-600 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <Globe className="h-3 w-3" />
                        <span>SV</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
