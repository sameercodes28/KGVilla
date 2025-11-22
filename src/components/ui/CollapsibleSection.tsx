'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
    title: string;
    subtitle?: string;
    rightContent?: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

export function CollapsibleSection({ 
    title, 
    subtitle, 
    rightContent, 
    children, 
    defaultOpen = false 
}: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300">
            <div 
                role="button"
                tabIndex={0}
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 hover:bg-slate-100/50 transition-colors text-left group cursor-pointer outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
                <div>
                    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                    {!isOpen && subtitle && (
                        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className="flex items-center space-x-4">
                    {rightContent}
                    <div className={cn(
                        "p-2 rounded-full bg-white border border-slate-200 text-slate-400 group-hover:text-blue-600 transition-all",
                        isOpen && "rotate-180 bg-blue-50 border-blue-100 text-blue-600"
                    )}>
                        <ChevronDown className="h-5 w-5" />
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="px-6 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
}
