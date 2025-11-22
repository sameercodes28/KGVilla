import { useState, useEffect } from 'react';
import { Project, CostItem } from '@/types';
import { projectDetails } from '@/data/projectData';

const STORAGE_KEY = 'kgvilla-projects';

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                // eslint-disable-next-line
                setProjects(JSON.parse(saved));
            } else {
                // Initialize with mock project if empty
                 
                setProjects([projectDetails]);
            }
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && projects.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        }
    }, [projects]);

    const createProject = (name: string, location: string, initialData?: { items: CostItem[], planUrl: string }) => {
        const newProject: Project = {
            id: `p-${Date.now()}`,
            name,
            location,
            description: 'New Project',
            createdAt: new Date(),
            updatedAt: new Date(),
            bbrStandard: 'BBR 29',
            levels: [],
            totalArea: 0,
            currency: 'SEK',
            status: 'draft',
            lastModified: new Date().toLocaleDateString(),
            version: '1.0.0'
        };
        
        // Save Metadata
        setProjects(prev => [newProject, ...prev]);

        // Save Initial Data (if any)
        if (initialData) {
            if (typeof window !== 'undefined') {
                localStorage.setItem(`kgvilla-cost-items-${newProject.id}`, JSON.stringify(initialData.items));
                localStorage.setItem(`kgvilla-plan-${newProject.id}`, initialData.planUrl);
            }
        }

        return newProject.id;
    };

    const deleteProject = (id: string) => {
        setProjects(prev => prev.filter(p => p.id !== id));
        if (typeof window !== 'undefined') {
            localStorage.removeItem(`kgvilla-cost-items-${id}`);
            localStorage.removeItem(`kgvilla-plan-${id}`);
        }
    };

    return { projects, createProject, deleteProject };
}
