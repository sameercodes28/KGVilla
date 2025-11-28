'use client';

import { ArrowRight, FileText, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Project } from '@/types';

interface ProjectCardProps {
    project: Project;
    /** Callback to get cost for project (from localStorage items) */
    getCost?: (project: Project) => number;
    /** Callback when delete button is clicked */
    onDelete?: (e: React.MouseEvent, projectId: string) => void;
    /** Whether to show delete button on hover */
    showDeleteButton?: boolean;
    /** Custom href override */
    href?: string;
}

/**
 * Reusable ProjectCard component with floor plan background design.
 * Used on homepage and project list views.
 */
export function ProjectCard({
    project,
    getCost,
    onDelete,
    showDeleteButton = true,
    href,
}: ProjectCardProps) {
    const cost = getCost ? getCost(project) : project.estimatedCost || 0;
    const linkHref = href || `/qto?project=${project.id}`;

    return (
        <Link href={linkHref} className="block group relative">
            <div className="h-72 rounded-3xl shadow-lg shadow-slate-200/80 ring-1 ring-slate-200/60 hover:shadow-xl hover:shadow-slate-300/60 hover:-translate-y-1 transition-all duration-300 overflow-hidden relative flex flex-col">
                {/* Floor Plan Background */}
                {project.floorPlanUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={project.floorPlanUrl}
                        alt={project.name}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <FileText className="h-16 w-16 text-slate-300" />
                    </div>
                )}

                {/* Gradient Overlay - lighter */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent group-hover:from-slate-900/70 transition-all" />

                {/* Delete Button - Top Left */}
                {showDeleteButton && onDelete && (
                    <button
                        onClick={(e) => onDelete(e, project.id)}
                        className="absolute top-4 left-4 p-2 bg-black/30 hover:bg-red-500 text-white/80 hover:text-white rounded-full backdrop-blur-md transition-all shadow-lg opacity-0 group-hover:opacity-100 z-20 border border-white/20"
                        title="Delete Project"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}

                {/* Content Overlay - Bottom aligned with arrow */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                    <div className="flex items-end justify-between gap-3">
                        {/* Left side: Name + Stats */}
                        <div className="flex-1 min-w-0">
                            {/* Project Name */}
                            <h3 className="font-bold text-white text-xl mb-2 line-clamp-1 drop-shadow-lg">{project.name}</h3>

                            {/* Stats Row */}
                            <div className="flex items-center gap-2">
                                {/* Area Badge */}
                                <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-md border border-white/20">
                                    <span className="text-sm font-semibold text-white">
                                        {project.boa || project.totalArea || 0}
                                        {project.biarea && project.biarea > 0 && (
                                            <span className="text-white/70">+{project.biarea}</span>
                                        )}
                                        <span className="text-white/60 ml-1 text-xs">m²</span>
                                    </span>
                                </div>

                                {/* Price Badge */}
                                <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-red-500/80 backdrop-blur-md border border-red-400/30">
                                    <span className="text-sm font-bold text-white">
                                        {cost.toLocaleString('sv-SE')}
                                        <span className="text-white/80 ml-1 text-xs">kr</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right side: Arrow Button */}
                        <div className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-red-500 group-hover:scale-110 transition-all border border-white/20 flex-shrink-0">
                            <ArrowRight className="h-4 w-4 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
