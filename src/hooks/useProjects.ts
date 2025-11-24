import { useState, useEffect } from 'react';
import { Project, CostItem } from '@/types';
import { projectDetails } from '@/data/projectData';
import { apiClient } from '@/lib/apiClient';
import { logger } from '@/lib/logger';
import { generateUUID } from '@/lib/uuid';

const STORAGE_KEY = 'kgvilla_projects';

/**
 * useProjects Hook
 * 
 * Manages the list of projects (Metadata).
 * Implements LocalStorage-First strategy for offline resilience.
 */
export function useProjects() {
    // 1. Load from LocalStorage on Mount (Lazy Init)
    const [projects, setProjects] = useState<Project[]>(() => {
        try {
            if (typeof window !== 'undefined') {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    return parsed;
                }
            }
        } catch (e) {
            logger.error('useProjects', 'LocalStorage read failed', e);
        }
        return [projectDetails]; // Default
    });

    // 2. Sync with API (Background)
    useEffect(() => {
        const fetchFromApi = async () => {
            try {
                const data = await apiClient.get<Project[]>('/projects');
                if (Array.isArray(data) && data.length > 0) {
                    setProjects(data);
                    // Update LocalStorage with fresh data
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                    logger.info('useProjects', 'Synced with API', { count: data.length });
                }
            } catch (err) {
                logger.warn('useProjects', 'API unavailable, using local data', err);
                // Do not overwrite state if API fails, keep local data
            }
        };

        fetchFromApi();
    }, []);

    const saveToLocal = (newProjects: Project[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProjects));
    };

    const createProject = async (name: string, location: string, initialData?: { items: CostItem[], planUrl: string }) => {
        logger.info('useProjects', 'Creating project', { name });
        
        const newProject: Project = {
            id: generateUUID(),
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
            version: '1.0.0',
            floorPlanUrl: initialData?.planUrl
        };
        
        // Optimistic Update
        setProjects(prev => {
            const updated = [newProject, ...prev];
            saveToLocal(updated);
            return updated;
        });

        try {
            await apiClient.post('/projects', newProject);

            if (initialData) {
                await apiClient.post(`/projects/${newProject.id}/items`, initialData.items);
                // Note: We rely on useProjectData to handle item persistence locally
            }
        } catch (e) {
            logger.error('useProjects', 'API create failed (saved locally)', e);
        }

        return newProject.id;
    };

    const deleteProject = async (id: string) => {
        // Optimistic Update
        setProjects(prev => {
            const updated = prev.filter(p => p.id !== id);
            saveToLocal(updated);
            return updated;
        });
        
        try {
            await apiClient.delete(`/projects/${id}`);
            logger.info('useProjects', 'Deleted project API', { id });
        } catch (e) {
            logger.error('useProjects', 'Failed to delete project API', e);
        }
    };

    const updateProjectStatus = async (id: string, status: string) => {
        // Find project before update to avoid stale closure
        const project = projects.find(p => p.id === id);
        if (!project) {
            logger.error('useProjects', 'Project not found for status update', { id });
            return;
        }

        const updatedProject = { ...project, status };

        // Optimistic Update
        setProjects(prev => {
            const updated = prev.map(p => p.id === id ? updatedProject : p);
            saveToLocal(updated);
            return updated;
        });

        try {
            await apiClient.post('/projects', updatedProject);
        } catch (e) {
            logger.error('useProjects', 'Failed to update status API', e);
        }
    };

    return { projects, createProject, deleteProject, updateProjectStatus };
}
