'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ConstructionPhaseProps {
    number: number;
    title: string;
    description: string;
    children: ReactNode;
    totalCost?: number; // Placeholder
}

export function ConstructionPhase({ number, title, description, children }: ConstructionPhaseProps) {
    return (
        <section className="mb-12 relative">
            {/* Timeline Connector */}
            <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-slate-100 -z-10 last:hidden"></div>

            <div className="flex items-start mb-6">
                <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-slate-900/20 z-10">
                    {number}
                </div>
                <div className="ml-4 pt-1">
                    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                    <p className="text-slate-500">{description}</p>
                </div>
            </div>

            <div className="pl-16 space-y-2">
                {children}
            </div>
        </section>
    );
}
