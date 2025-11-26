'use client';

import { MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useProjects } from '@/hooks/useProjects';
import { useTranslation } from '@/contexts/LanguageContext';

export function ProjectList() {
    const { projects } = useProjects();
    const { t } = useTranslation();

    return (
        <div className="max-w-5xl mx-auto pt-24 px-6 pb-20">
            <div className="mb-12">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">{t('list.select_project')}</h1>
                <p className="text-slate-500">{t('list.choose_desc')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <Link key={project.id} href={`/qto?project=${project.id}`} className="block group">
                        <div className="h-48 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col">
                            <div className="p-6 flex-1">
                                <h3 className="font-bold text-slate-900 text-lg mb-1">{project.name}</h3>
                                <div className="flex items-center text-slate-500 text-sm">
                                    <MapPin className="h-3.5 w-3.5 mr-1" />
                                    {project.location}
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/50 rounded-b-2xl flex justify-between items-center text-sm text-slate-500 group-hover:text-blue-600">
                                <span>{t('common.open_project')}</span>
                                <ArrowRight className="h-4 w-4" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
