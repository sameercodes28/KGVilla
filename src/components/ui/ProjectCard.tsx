'use client';

import { ArrowRight, FileText, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Project } from '@/types';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
    project: Project;
    /** Callback to get cost for project (from localStorage items) */
    getCost?: (project: Project) => number;
    /** Callback when delete button is clicked */
    onDelete?: (e: React.MouseEvent, projectId: string) => void;
    /** Callback when status badge is clicked */
    onStatusToggle?: (e: React.MouseEvent, project: Project) => void;
    /** Whether to show delete button on hover */
    showDeleteButton?: boolean;
    /** Whether to show status badge */
    showStatusBadge?: boolean;
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
    onStatusToggle,
    showDeleteButton = true,
    showStatusBadge = true,
    href,
}: ProjectCardProps) {
    const cost = getCost ? getCost(project) : project.estimatedCost || 0;
    const linkHref = href || `/qto?project=${project.id}`;

    return (
        <Link href={linkHref} className="block group relative">
            <div className="h-72 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative">
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

                {/* Gradient Overlay - lighter to show plan better */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent group-hover:from-slate-900/85 transition-all" />

                {/* Status Badge - Top Right */}
                {showStatusBadge && (
                    <div className="absolute top-4 right-4 z-20">
                        <button
                            onClick={(e) => onStatusToggle?.(e, project)}
                            className={cn(
                                "backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold uppercase shadow-lg transition-all border",
                                project.status === 'final'
                                    ? "bg-green-500/90 text-white border-green-400/50 hover:bg-green-400"
                                    : "bg-white/20 text-white border-white/30 hover:bg-white/30"
                            )}
                        >
                            {project.status || 'DRAFT'}
                        </button>
                    </div>
                )}

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

                {/* Content Overlay - Bottom - pushed down more */}
                <div className="absolute bottom-0 left-0 right-0 p-5 pt-8 z-10">
                    {/* Project Name */}
                    <h3 className="font-bold text-white text-xl mb-2 line-clamp-1 drop-shadow-lg">{project.name}</h3>

                    {/* Stats Row */}
                    <div className="flex items-center gap-3 mb-3">
                        {/* Area Badge */}
                        <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white/15 backdrop-blur-md border border-white/20">
                            <span className="text-sm font-semibold text-white">
                                {project.boa || project.totalArea || 0}
                                {project.biarea && project.biarea > 0 && (
                                    <span className="text-white/70">+{project.biarea}</span>
                                )}
                                <span className="text-white/60 ml-1 text-xs">m²</span>
                            </span>
                        </div>

                        {/* Price Badge */}
                        <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-red-500/80 backdrop-blur-md border border-red-400/30">
                            <span className="text-sm font-bold text-white">
                                {cost.toLocaleString('sv-SE')}
                                <span className="text-white/80 ml-1 text-xs">kr</span>
                            </span>
                        </div>
                    </div>

                    {/* Arrow Button */}
                    <div className="flex justify-end">
                        <div className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-red-500 group-hover:scale-110 transition-all border border-white/20">
                            <ArrowRight className="h-4 w-4 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
