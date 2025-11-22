'use client';

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TechnicalTermProps {
    term: string;
    definition: string;
    className?: string;
}

export function TechnicalTerm({ term, definition, className }: TechnicalTermProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <span
            className={cn("relative inline-flex items-center cursor-help group", className)}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <span className="border-b border-dotted border-slate-400 group-hover:border-blue-500 group-hover:text-blue-600 transition-colors">
                {term}
            </span>
            <HelpCircle className="h-3 w-3 ml-1 text-slate-400 group-hover:text-blue-500" />

            {isVisible && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200">
                    {definition}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                </div>
            )}
        </span>
    );
}
