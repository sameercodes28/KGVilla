import { useState, useEffect } from 'react';
import { Project, CostItem } from '@/types';
import { projectDetails } from '@/data/projectData';
import { API_URL } from '@/lib/api';

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([]);

    // Load from API
    useEffect(() => {
        fetch(`${API_URL}/projects`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setProjects(data);
                } else {
                    // Fallback to mock if empty DB
                    setProjects([projectDetails]);
                }
            })
            .catch(err => console.error("Failed to fetch projects", err));
    }, []);

    const createProject = async (name: string, location: string, initialData?: { items: CostItem[], planUrl: string }) => {
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
        
        // Optimistic UI Update
        setProjects(prev => [newProject, ...prev]);

        // Save Project Metadata
        await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProject)
        });

        // Save Initial Items
        if (initialData) {
            await fetch(`${API_URL}/projects/${newProject.id}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(initialData.items)
            });
            // Note: Plan URL handling would need a storage solution, for now we lose the blob unless we upload it.
            // But `analyze` already handled the file.
        }

        return newProject.id;
    };

    const deleteProject = (id: string) => {
        setProjects(prev => prev.filter(p => p.id !== id));
        // TODO: Implement DELETE API
    };

    const updateProjectStatus = async (id: string, status: string) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p));
        
        // Find project and sync to backend
        const project = projects.find(p => p.id === id);
        if (project) {
             await fetch(`${API_URL}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...project, status })
            });
        }
    };

    return { projects, createProject, deleteProject, updateProjectStatus };
}
