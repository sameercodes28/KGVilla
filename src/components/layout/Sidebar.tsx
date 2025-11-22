'use client';

import { useTranslation } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Settings, FolderOpen, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
    const pathname = usePathname();
    const { t, language, setLanguage } = useTranslation();

    const navigation = [
        { name: t('nav.dashboard'), href: '/', icon: LayoutDashboard },
        { name: t('nav.projects'), href: '/projects', icon: FolderOpen },
        { name: t('nav.qto'), href: '/qto', icon: FileText },
        { name: t('nav.settings'), href: '/settings', icon: Settings },
    ];

    return (
        <div className="flex h-full w-64 flex-col bg-slate-900 text-white border-r border-slate-800">
            <div className="flex h-16 items-center px-6 border-b border-slate-800">
                <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center mr-3">
                    <span className="font-bold text-lg text-white">JB</span>
                </div>
                <span className="text-lg font-semibold tracking-tight">JB Villan Kalkyl</span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                                isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            )}
                        >
                            <item.icon
                                className={cn(
                                    'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'
                                )}
                            />
                            {item.name}
                            {isActive && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-4">
                {/* Language Toggle */}
                <button
                    onClick={() => setLanguage(language === 'en' ? 'sv' : 'en')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-xs font-medium text-slate-300"
                >
                    <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-slate-400" />
                        <span>{language === 'en' ? 'English' : 'Svenska'}</span>
                    </div>
                    <span className="bg-slate-900 px-1.5 py-0.5 rounded text-slate-500 uppercase">
                        {language}
                    </span>
                </button>

                <div className="flex items-center px-3 py-2">
                    <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                        <span className="text-xs font-medium">SM</span>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-white">Sameer M.</p>
                        <p className="text-xs text-slate-500">Pro Plan</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
