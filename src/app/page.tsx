'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Plus, FolderOpen, ArrowRight, X, UploadCloud, Trash2, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useProjects } from '@/hooks/useProjects';
import { useRouter } from 'next/navigation';
import { CostItem, Project } from '@/types';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { apiClient } from '@/lib/apiClient';
import { getAssetPath } from '@/lib/constants';

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

// Funny Swedish loading messages
const LOADING_MESSAGES_SV = [
  'Analyserar JBs tankar...',
  'Räknar takpannor i huvudet...',
  'Konsulterar gamla byggmästare...',
  'Mäter väggar med tumstock...',
  'Beräknar kostnader med pannkalkylator...',
  'Jämför priser med grannens hus...',
  'Undersöker ritningen med förstoringsglas...',
  'Kollar om det finns fika i budgeten...',
  'Funderar på hur många skruvar som behövs...',
  'Räknar kvadratmeter som en matematiker...',
];

const LOADING_MESSAGES_EN = [
  'Analyzing JB\'s thoughts...',
  'Counting roof tiles in my head...',
  'Consulting ancient builders...',
  'Measuring walls with a ruler...',
  'Calculating costs with a calculator...',
  'Comparing prices with the neighbor\'s house...',
  'Examining blueprints with a magnifying glass...',
  'Checking if coffee is in the budget...',
  'Figuring out how many screws are needed...',
  'Counting square meters like a mathematician...',
];

export default function Home() {
  const { t, language } = useTranslation();
  const { projects, createProject, deleteProject, updateProjectStatus } = useProjects();
  const router = useRouter();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for calculated costs (from items in localStorage)
  const [projectCosts, setProjectCosts] = useState<Record<string, number>>({});

  // Calculate costs from items for all projects
  const getProjectCost = useCallback((project: Project): number => {
    // First check if we have a calculated cost from items
    if (projectCosts[project.id] !== undefined) {
      return projectCosts[project.id];
    }
    // Fall back to estimatedCost from project metadata
    return project.estimatedCost || 0;
  }, [projectCosts]);

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

    setProjectCosts(costs);
  }, [projects]);

  // Log component mount and state (intentionally runs only on mount)
  useEffect(() => {
    logger.trackMount('HomePage', { projectCount: projects.length });
    logger.info('HomePage', 'Component mounted', {
      projectCount: projects.length,
      language
    });
    return () => logger.trackUnmount('HomePage');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Log modal state changes
  useEffect(() => {
    logger.trackStateChange('HomePage', 'isModalOpen', !isModalOpen, isModalOpen);
    if (isModalOpen) {
      logger.info('HomePage', 'Create project modal opened');
    }
  }, [isModalOpen]);

  // Log delete modal state changes
  useEffect(() => {
    if (projectToDelete) {
      logger.trackStateChange('HomePage', 'projectToDelete', null, projectToDelete);
      logger.info('HomePage', 'Delete confirmation modal opened', { projectId: projectToDelete });
    }
  }, [projectToDelete]);

  // Rotate loading messages
  const loadingMessages = useMemo(() =>
    language === 'sv' ? LOADING_MESSAGES_SV : LOADING_MESSAGES_EN,
    [language]
  );

  useEffect(() => {
    if (!isAnalyzing) return;
    const interval = setInterval(() => {
      setLoadingMessageIndex(prev => (prev + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isAnalyzing, loadingMessages.length]);

  const filteredProjects = projects.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Top 3 for the Grid (Recent)
  const recentProjects = projects.slice(0, 3);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        logger.info('HomePage', 'File selected for upload', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
        });
        setSelectedFile(file);

        // Auto-fill project name from filename (without extension)
        if (!newProjectName) {
            const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
            setNewProjectName(fileName);
            logger.debug('HomePage', 'Auto-filled project name from file', { fileName });
        }
    }
  };

  const handleCreate = async () => {
    // Use filename if no project name provided
    const projectName = newProjectName || (selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, '') : '');
    if (!projectName) {
      logger.warn('HomePage', 'handleCreate called without project name');
      return;
    }

    logger.info('HomePage', 'Starting project creation', {
      projectName,
      hasFile: !!selectedFile,
      fileName: selectedFile?.name
    });
    const perfEnd = logger.startPerformance('project-creation');

    setIsAnalyzing(true);
    let initialItems: CostItem[] = [];
    let planUrl = '';
    let totalArea = 0;

    let estimatedCost = 0;
    let boa = 0;
    let biarea = 0;

    if (selectedFile) {
        // 1. Create Preview URL
        const reader = new FileReader();
        const previewPromise = new Promise<string>((resolve) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(selectedFile);
        });
        planUrl = await previewPromise;

        // 2. Analyze
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            logger.info('Home', 'Starting analysis', { fileName: selectedFile.name });
            const result = await apiClient.upload<{
                items: CostItem[],
                totalArea: number,
                boa?: number,
                biarea?: number
            }>('/analyze', formData);
            initialItems = result.items || [];
            totalArea = result.totalArea || 0;
            boa = result.boa || 0;
            biarea = result.biarea || 0;
            // Calculate estimated cost from items
            estimatedCost = initialItems.reduce((sum, item) => sum + (item.totalCost || 0), 0);
            logger.info('Home', 'Analysis complete', { itemCount: initialItems.length, totalArea, boa, biarea, estimatedCost });

            if (initialItems.length === 0) {
                logger.warn('Home', 'Analysis returned no items');
            }
        } catch (e) {
            logger.error('Home', 'Analysis failed', e);
            // Continue with empty project - user can retry from QTO view
        }
    }

    // 3. Create Project with Data
    logger.info('HomePage', 'Creating project in storage', { projectName, itemCount: initialItems.length });
    const id = await createProject(projectName, '', selectedFile ? { items: initialItems, planUrl, totalArea, boa, biarea, estimatedCost } : undefined);

    perfEnd(); // End performance tracking
    logger.info('HomePage', 'Project created successfully', { projectId: id, projectName });

    setIsAnalyzing(false);
    setIsModalOpen(false);
    logger.trackNavigation('HomePage', `/qto?project=${id}`);
    router.push(`/qto?project=${id}`); 
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      logger.info('HomePage', 'Delete button clicked', { projectId: id });
      setProjectToDelete(id);
  };

  const confirmDelete = () => {
      if (projectToDelete) {
          logger.info('HomePage', 'Confirming project deletion', { projectId: projectToDelete });
          deleteProject(projectToDelete);
          setProjectToDelete(null);
          logger.info('HomePage', 'Project deleted successfully');
      }
  };

  const handleStatusToggle = (e: React.MouseEvent, project: Project) => {
      e.preventDefault();
      e.stopPropagation();
      const newStatus = project.status === 'final' ? 'draft' : 'final';
      logger.info('HomePage', 'Status toggle clicked', {
          projectId: project.id,
          oldStatus: project.status,
          newStatus
      });
      updateProjectStatus(project.id, newStatus);
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-60"></div>
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-red-50/80 to-transparent"></div>
        </div>

      <LanguageToggle />
      
      <main className="max-w-6xl mx-auto pt-16 px-6 pb-20 relative z-10">
        {/* Hero Section - Clean & Minimal */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* JB Villan Official Logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={getAssetPath('/jb-villan-logo.png')}
                alt="JB Villan"
                className="h-16 mx-auto mb-10"
            />

            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                <span className="text-slate-900">{t('dash.hero_title')}</span>
                <br />
                <span className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
                    {t('dash.hero_subtitle')}
                </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-slate-500 max-w-xl mx-auto leading-relaxed mb-8">
                {language === 'sv'
                    ? 'Ladda upp en ritning. Få en kostnadskalkyl på sekunder.'
                    : 'Upload a blueprint. Get a cost estimate in seconds.'}
            </p>

            {/* CTA Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-semibold rounded-2xl shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-slate-900/30 hover:-translate-y-0.5 transition-all duration-300"
            >
                <Plus className="w-5 h-5" />
                <span>{t('dash.create_project')}</span>
                <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
            </button>

        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-900">{t('dash.recent_activity')}</h2>
            <div className="relative">
                <input
                    type="text"
                    placeholder={t('dash.search_placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-4 pr-10 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white/80 backdrop-blur"
                />
            </div>
        </div>

        {/* Projects Grid (Recent) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Recent Project Cards - Floor Plan Style */}
            {recentProjects.map((project) => (
                <Link key={project.id} href={`/qto?project=${project.id}`} className="block group relative">
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

                        {/* Gradient Overlay for readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/10 group-hover:from-slate-900/95 transition-all" />

                        {/* Status Badge - Top Right */}
                        <div className="absolute top-4 right-4 z-20">
                            <button
                                onClick={(e) => handleStatusToggle(e, project)}
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

                        {/* Delete Button - Top Left */}
                        <button
                            onClick={(e) => handleDelete(e, project.id)}
                            className="absolute top-4 left-4 p-2 bg-black/30 hover:bg-red-500 text-white/80 hover:text-white rounded-full backdrop-blur-md transition-all shadow-lg opacity-0 group-hover:opacity-100 z-20 border border-white/20"
                            title="Delete Project"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>

                        {/* Content Overlay - Bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                            {/* Project Name */}
                            <h3 className="font-bold text-white text-xl mb-2 line-clamp-1 drop-shadow-lg">{project.name}</h3>

                            {/* Stats Row */}
                            <div className="flex items-center gap-3 mb-3">
                                {/* Area Badge */}
                                <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white/15 backdrop-blur-md border border-white/20">
                                    {(project.boa && project.boa > 0) ? (
                                        <span className="text-sm font-semibold text-white">
                                            {project.boa}
                                            {project.biarea && project.biarea > 0 && (
                                                <span className="text-white/70">+{project.biarea}</span>
                                            )}
                                            <span className="text-white/60 ml-1 text-xs">m²</span>
                                        </span>
                                    ) : (
                                        <span className="text-sm font-semibold text-white">
                                            {project.totalArea || 0}
                                            <span className="text-white/60 ml-1 text-xs">m²</span>
                                        </span>
                                    )}
                                </div>

                                {/* Price Badge */}
                                <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-red-500/80 backdrop-blur-md border border-red-400/30">
                                    <span className="text-sm font-bold text-white">
                                        {getProjectCost(project).toLocaleString('sv-SE')}
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
            ))}
        </div>

        {/* All Projects List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-900">{t('dash.all_projects')} ({filteredProjects.length})</h3>
            </div>
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4 font-medium">{t('dash.project_name')}</th>
                        <th className="px-6 py-4 font-medium text-right">BOA</th>
                        <th className="px-6 py-4 font-medium text-right">Biarea</th>
                        <th className="px-6 py-4 font-medium text-right">{t('dash.estimated_cost')}</th>
                        <th className="px-6 py-4 font-medium">{t('dash.status')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredProjects.map((project) => (
                        <tr key={project.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => router.push(`/qto?project=${project.id}`)}>
                            <td className="px-6 py-4 font-medium text-slate-900 flex items-center">
                                <FolderOpen className="h-4 w-4 mr-3 text-slate-400" />
                                {project.name}
                            </td>
                            <td className="px-6 py-4 text-right text-slate-700">{project.boa || project.totalArea || 0} m²</td>
                            <td className="px-6 py-4 text-right text-slate-500">{project.biarea || 0} m²</td>
                            <td className="px-6 py-4 text-right font-medium text-red-600">{getProjectCost(project).toLocaleString('sv-SE')} kr</td>
                            <td className="px-6 py-4">
                                <button
                                    onClick={(e) => handleStatusToggle(e, project)}
                                    className={cn(
                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors uppercase",
                                        project.status === 'final'
                                            ? "bg-green-50 text-green-700 border-green-100 hover:bg-green-100"
                                            : "bg-red-50 text-red-700 border-red-100 hover:bg-red-100"
                                    )}
                                >
                                    {project.status || 'Draft'}
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filteredProjects.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                {t('dash.no_projects_found')} &quot;{searchQuery}&quot;
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

      </main>

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-900">{t('dash.delete_project')}</h3>
                <p className="text-sm text-slate-500">{t('dash.delete_confirm')}</p>
                <div className="flex space-x-3 justify-end pt-2">
                    <button
                        onClick={() => setProjectToDelete(null)}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                    >
                        {t('dash.cancel')}
                    </button>
                    <button
                        onClick={confirmDelete}
                        className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors"
                    >
                        {t('dash.delete')}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative border border-slate-100">
                {isAnalyzing && (
                    <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur flex flex-col items-center justify-center text-center p-8">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-red-100 border-t-red-600 rounded-full animate-spin mb-6"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="h-6 w-6 text-red-600 animate-pulse" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{t('dash.analyzing')}</h3>
                        <p className="text-sm text-slate-500 min-h-[20px] transition-opacity duration-300">{loadingMessages[loadingMessageIndex]}</p>
                    </div>
                )}

                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-900">{t('dash.new_project')}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('dash.project_name')}</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none text-slate-900 placeholder:text-slate-400 transition-all bg-slate-50 focus:bg-white"
                            placeholder="e.g. Villa Utsikten"
                            value={newProjectName}
                            onChange={e => setNewProjectName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    {/* File Upload Area */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{t('dash.floor_plan')}</label>
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-red-50 hover:border-red-300 transition-all group"
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                className="hidden" 
                                onChange={handleFileSelect}
                                accept="image/*,application/pdf"
                            />
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-red-100 transition-colors">
                                <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-red-600" />
                            </div>
                            {selectedFile ? (
                                <div className="text-center">
                                    <span className="text-sm font-bold text-red-600 block">{selectedFile.name}</span>
                                    <span className="text-xs text-slate-400">{t('dash.click_to_change')}</span>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <span className="text-sm font-medium text-slate-600 block">{t('dash.click_to_upload')}</span>
                                    <span className="text-xs text-slate-400">{t('dash.drag_drop')}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleCreate}
                        disabled={!newProjectName && !selectedFile}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2 active:scale-[0.98]"
                    >
                        {selectedFile ? t('dash.analyze_create') : t('dash.create_empty')}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}