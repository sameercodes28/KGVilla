'use client';

import { useCallback, useEffect, useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useTranslation } from '@/contexts/LanguageContext';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { Project, CostItem } from '@/types';

// Helper to get actual cost from items in localStorage
function getProjectCostFromItems(projectId: string): number {
    try {
        const itemsData = localStorage.getItem(`kgvilla_items_${projectId}`);
        if (itemsData) {
            const items: CostItem[] = JSON.parse(itemsData);
            return items
                .filter(item => !item.disabled)
                .reduce((sum, item) => sum + (item.totalCost || 0), 0);
        }
    } catch {
        // Silent fail
    }
    return 0;
}

export function ProjectList() {
    const { projects, deleteProject } = useProjects();
    const { t } = useTranslation();

    // State for calculated costs (from items in localStorage)
    const [projectCosts, setProjectCosts] = useState<Record<string, number>>({});

    // Load costs from localStorage items on mount and when projects change
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const costs: Record<string, number> = {};
        projects.forEach(project => {
            const costFromItems = getProjectCostFromItems(project.id);
            if (costFromItems > 0) {
                costs[project.id] = costFromItems;
            }
        });
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: syncing costs from localStorage on mount
        setProjectCosts(costs);
    }, [projects]);

    const getProjectCost = useCallback((project: Project): number => {
        if (projectCosts[project.id] !== undefined) {
            return projectCosts[project.id];
        }
        return project.estimatedCost || 0;
    }, [projectCosts]);

    const handleDelete = (e: React.MouseEvent, projectId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm(t('dash.delete_confirm'))) {
            deleteProject(projectId);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pt-24 px-6 pb-20">
            <div className="mb-12">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">{t('list.select_project')}</h1>
                <p className="text-slate-500">{t('list.choose_desc')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        getCost={getProjectCost}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
        </div>
    );
}
