import { useState, useEffect } from 'react';
import { Project, CostItem } from '@/types';
import { projectDetails } from '@/data/projectData';
import { API_URL } from '@/lib/api';
import { logger } from '@/lib/logger';

/**
 * useProjects Hook
 * 
 * Manages the list of projects (Metadata).
 * Synchronizes with the Backend API.
 */
export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([]);

    // Load from API
    useEffect(() => {
        fetch(`${API_URL}/projects`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setProjects(data);
                    logger.info('useProjects', 'Loaded projects from API', { count: data.length });
                } else {
                    // Fallback to mock if empty DB
                    setProjects([projectDetails]);
                }
            })
            .catch(err => logger.error('useProjects', 'Failed to fetch projects', err));
    }, []);

    const createProject = async (name: string, location: string, initialData?: { items: CostItem[], planUrl: string }) => {
        // ... (keep existing create logic but add logger)
        logger.info('useProjects', 'Creating project', { name });
        
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

        await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProject)
        });

        if (initialData) {
            await fetch(`${API_URL}/projects/${newProject.id}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(initialData.items)
            });
        }

        return newProject.id;
    };

    const deleteProject = async (id: string) => {
        setProjects(prev => prev.filter(p => p.id !== id));
        
        try {
            await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE' });
            logger.info('useProjects', 'Deleted project', { id });
        } catch (e) {
            logger.error('useProjects', 'Failed to delete project', e);
        }
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
