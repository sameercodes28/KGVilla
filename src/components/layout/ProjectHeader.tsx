'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useProjects } from '@/hooks/useProjects';
import { useTranslation } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Sparkles, Building, ChevronDown, ArrowLeft, Presentation } from 'lucide-react';
import { SyncState } from '@/hooks/useProjectData';
import { SyncIndicator } from '@/components/ui/SyncIndicator';

interface ProjectHeaderProps {
    currentProjectId?: string;
    showBackButton?: boolean;
    title?: string;
    subtitle?: string;
    syncState?: SyncState;
    hideProposalButton?: boolean;
}

export function ProjectHeader({
    currentProjectId,
    showBackButton = false,
    title,
    subtitle,
    syncState,
    hideProposalButton = false
}: ProjectHeaderProps) {
    const { projects } = useProjects();
    const { t } = useTranslation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const selectedProject = projects.find(p => p.id === currentProjectId);

    return (
        <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm sticky top-0 z-30">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Left Side: Back Button + Title */}
                <div className="flex items-center space-x-4">
                    {showBackButton && (
                        <Link 
                            href="/" 
                            className="p-2 -ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                            title="Back to Home"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    )}
                    
                    <div className="flex items-center space-x-3">
                        <div className="bg-purple-100 p-2 rounded-xl hidden md:block">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                                    {title || t('app.title')}
                                </h1>
                                <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                    v{process.env.NEXT_PUBLIC_APP_VERSION}
                                </span>
                            </div>
                            {subtitle && (
                                <p className="text-xs text-slate-500">{subtitle}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Project Switcher & Actions */}
                <div className="flex items-center space-x-3">
                    {syncState && (
                        <div className="hidden md:block mr-2">
                            <SyncIndicator syncState={syncState} />
                        </div>
                    )}

                     {/* Project Switcher Dropdown */}
                    <div className="relative group">
                        <button 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                            className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                        >
                            <Building className="h-4 w-4 text-slate-500" />
                            <span className="max-w-[150px] truncate">
                                {selectedProject?.name || 'Select Project'}
                            </span>
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                        </button>
                        
                        {isDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="max-h-80 overflow-y-auto">
                                    {projects.map(p => (
                                        <Link 
                                            key={p.id}
                                            href={`?project=${p.id}`}
                                            onClick={() => setIsDropdownOpen(false)}
                                            className={cn(
                                                "block w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0",
                                                currentProjectId === p.id ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700"
                                            )}
                                        >
                                            {p.name}
                                            <span className="block text-xs text-slate-400 font-normal">{p.location}</span>
                                        </Link>
                                    ))}
                                </div>
                                <div className="p-2 bg-slate-50 border-t border-slate-100">
                                    <Link href="/" className="block text-center text-xs font-bold text-blue-600 hover:underline py-1">
                                        + Create New Project
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {currentProjectId && !hideProposalButton && (
                         <Link
                            href={`/qto/customer?project=${currentProjectId}`}
                            className="hidden md:flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors text-xs font-bold"
                        >
                            <Presentation className="h-3.5 w-3.5 mr-1.5" />
                            Proposal
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
