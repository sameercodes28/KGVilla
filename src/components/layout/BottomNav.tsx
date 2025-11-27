'use client';

import { Home, FileText, MessageSquare, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export function BottomNav() {
    const pathname = usePathname();
    const { t } = useTranslation();

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        return pathname.startsWith(path);
    };

    return (
        <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-6 py-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="max-w-md mx-auto flex justify-around items-center">
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
        </nav>
    );
}
