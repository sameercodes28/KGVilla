'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useProjects } from '@/hooks/useProjects';
import { useTranslation } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Building, ChevronDown, ArrowLeft, Presentation } from 'lucide-react';
import { SyncState } from '@/hooks/useProjectData';
import { SyncIndicator } from '@/components/ui/SyncIndicator';

interface ProjectHeaderProps {
    currentProjectId?: string;
    showBackButton?: boolean;
    title?: string;
    subtitle?: string;
    syncState?: SyncState;
    hideProposalButton?: boolean;
    // Project stats for the header display
    boa?: number;
    biarea?: number;
    itemsCount?: number;
    totalCost?: number;
}

export function ProjectHeader({
    currentProjectId,
    showBackButton = false,
    title,
    subtitle,
    syncState,
    hideProposalButton = false,
    boa = 0,
    biarea = 0,
    itemsCount = 0,
    totalCost = 0
}: ProjectHeaderProps) {
    const { projects } = useProjects();
    const { t } = useTranslation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const selectedProject = projects.find(p => p.id === currentProjectId);

    // Calculate cost per m²
    const costPerSqm = boa > 0 ? Math.round(totalCost / boa) : 0;

    return (
        <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-sm sticky top-0 z-30">
            <div className="max-w-7xl mx-auto flex items-center">
                {/* Left Side: Back Button */}
                <div className="flex items-center w-24">
                    {showBackButton && (
                        <Link
                            href="/"
                            className="p-2 -ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                            title={t('header.back_home')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    )}
                </div>

                {/* Center: Project Switcher with Stats */}
                <div className="flex-1 flex justify-center">
                    <div className="relative group">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                            className="flex flex-col items-center bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-5 py-2 transition-colors"
                        >
                            <div className="flex items-center space-x-2">
                                <Building className="h-4 w-4 text-slate-500" />
                                <span className="text-lg font-bold text-slate-900">
                                    {selectedProject?.name || t('common.select_project')}
                                </span>
                                <ChevronDown className="h-4 w-4 text-slate-400" />
                            </div>
                            {selectedProject && (boa > 0 || itemsCount > 0) && (
                                <div className="text-xs text-slate-500 mt-0.5">
                                    {boa > 0 && (
                                        <span>
                                            <span className="font-medium text-slate-600">{boa} m²</span>
                                            <span className="text-slate-400"> BOA</span>
                                        </span>
                                    )}
                                    {itemsCount > 0 && (
                                        <span>
                                            {boa > 0 && ' · '}
                                            <span className="font-medium text-slate-600">{itemsCount}</span>
                                            <span className="text-slate-400"> Items</span>
                                        </span>
                                    )}
                                    {costPerSqm > 0 && (
                                        <span>
                                            {' · '}
                                            <span className="font-medium text-slate-600">{costPerSqm.toLocaleString('sv-SE')}</span>
                                            <span className="text-slate-400"> kr/m²</span>
                                        </span>
                                    )}
                                </div>
                            )}
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="max-h-80 overflow-y-auto">
                                    {projects.map(p => (
                                        <Link
                                            key={p.id}
                                            href={`?project=${p.id}`}
                                            onClick={() => setIsDropdownOpen(false)}
                                            className={cn(
                                                "block w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0",
                                                currentProjectId === p.id ? "bg-red-50" : ""
                                            )}
                                        >
                                            <div className={cn(
                                                "font-semibold",
                                                currentProjectId === p.id ? "text-red-700" : "text-slate-800"
                                            )}>
                                                {p.name}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5">
                                                {p.boa && (
                                                    <span>
                                                        <span className="font-medium">{p.boa} m²</span> BOA
                                                    </span>
                                                )}
                                                {p.estimatedCost && p.boa && (
                                                    <span>
                                                        {' · '}
                                                        <span className="font-medium">
                                                            {Math.round(p.estimatedCost / p.boa).toLocaleString('sv-SE')}
                                                        </span> kr/m²
                                                    </span>
                                                )}
                                                {!p.boa && p.location && (
                                                    <span className="text-slate-400">{p.location}</span>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                <div className="p-2 bg-slate-50 border-t border-slate-100">
                                    <Link href="/" className="block text-center text-xs font-bold text-red-600 hover:underline py-1">
                                        {t('header.create_new')}
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Sync & Quote Button */}
                <div className="flex items-center space-x-3 w-24 justify-end">
                    {syncState && (
                        <div className="hidden md:block">
                            <SyncIndicator syncState={syncState} />
                        </div>
                    )}

                    {currentProjectId && !hideProposalButton && (
                         <Link
                            href={`/qto/customer?project=${currentProjectId}`}
                            className="hidden md:flex items-center text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors text-xs font-bold"
                        >
                            <Presentation className="h-3.5 w-3.5 mr-1.5" />
                            {t('report.quote')}
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
