import { useState, useEffect } from 'react';
import { Project } from '@/types';
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

    const createProject = (name: string, location: string) => {
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
        setProjects(prev => [newProject, ...prev]);
        return newProject.id;
    };

    return { projects, createProject };
}
