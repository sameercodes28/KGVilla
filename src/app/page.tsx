'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, FolderOpen, ArrowRight, MapPin, X, UploadCloud, Trash2, Sparkles } from 'lucide-react';
import { RegulationBadges } from '@/components/ui/RegulationBadges';
import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useProjects } from '@/hooks/useProjects';
import { useRouter } from 'next/navigation';
import { CostItem, Project } from '@/types';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { apiClient } from '@/lib/apiClient';

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
      
      <main className="max-w-6xl mx-auto pt-12 px-6 pb-20 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* JB Villan Official Logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/jb-villan-logo.png`}
                alt="JB Villan"
                className="h-14 mx-auto mb-6"
            />
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/80 backdrop-blur border border-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wide mb-4 shadow-sm">
                <Sparkles className="w-3 h-3 mr-2 text-red-500" />
                {t('dash.smart_intelligence')}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4 leading-tight">
                {t('dash.hero_title')} <br/>
                <span className="text-red-600">{t('dash.hero_subtitle')}</span>
            </h1>
            <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: t('dash.hero_desc') }} />

            {/* Regulation Badges - Clickable with explanations */}
            <RegulationBadges />
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
            
            {/* Create New Card */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="group relative flex flex-col items-center justify-center h-72 bg-white rounded-3xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border-2 border-dashed border-slate-200 hover:border-red-300"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="h-16 w-16 bg-red-50 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-red-100 transition-all border border-red-100">
                    <Plus className="h-8 w-8 text-red-500 group-hover:text-red-600 transition-colors" />
                </div>
                <h3 className="font-bold text-xl text-slate-800">{t('dash.create_project')}</h3>
                <p className="text-slate-400 text-sm mt-2 font-medium">{t('dash.start_blueprint')}</p>
            </button>

            {/* Recent Project Cards */}
            {recentProjects.map((project) => (
                <Link key={project.id} href={`/qto?project=${project.id}`} className="block group relative">
                    <div className="h-72 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-red-200 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
                        <div className="h-36 bg-slate-50 relative flex items-center justify-center border-b border-slate-100 group-hover:bg-red-50/50 transition-colors">
                            {/* Project Stats Display */}
                            <div className="flex flex-col items-center justify-center space-y-2">
                                <div className="text-center">
                                    {(project.boa && project.boa > 0) ? (
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-bold text-slate-800">{project.boa}</span>
                                            <span className="text-sm text-slate-400">BOA</span>
                                            {project.biarea && project.biarea > 0 && (
                                                <>
                                                    <span className="text-slate-300 mx-1">+</span>
                                                    <span className="text-lg font-semibold text-slate-600">{project.biarea}</span>
                                                    <span className="text-xs text-slate-400">Bi</span>
                                                </>
                                            )}
                                            <span className="text-sm text-slate-500 ml-1">m²</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-3xl font-bold text-slate-800">{project.totalArea || 0}</span>
                                            <span className="text-lg text-slate-500 ml-1">m²</span>
                                        </>
                                    )}
                                </div>
                                <div className="text-center">
                                    <span className="text-xl font-semibold text-red-600">
                                        {(project.estimatedCost || 0).toLocaleString('sv-SE')}
                                    </span>
                                    <span className="text-sm text-slate-500 ml-1">kr</span>
                                </div>
                            </div>
                            <div className="absolute top-4 right-4 flex space-x-2">
                                <button
                                    onClick={(e) => handleStatusToggle(e, project)}
                                    className={cn(
                                        "backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm transition-all border z-20",
                                        project.status === 'final'
                                            ? "bg-green-100/90 text-green-700 border-green-200 hover:bg-green-200"
                                            : "bg-white/90 text-slate-500 border-slate-200 hover:bg-slate-100"
                                    )}
                                >
                                    {project.status || 'DRAFT'}
                                </button>
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-between bg-white relative z-10">
                            <div>
                                <h3 className="font-bold text-slate-900 text-xl mb-1 line-clamp-1">{project.name}</h3>
                                <div className="flex items-center text-slate-500 text-sm">
                                    <MapPin className="h-3.5 w-3.5 mr-1" />
                                    {project.location}
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-4 border-t border-slate-50">
                                <span>{t('dash.updated')} {project.lastModified}</span>
                                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={(e) => handleDelete(e, project.id)}
                        className="absolute top-4 left-4 p-2 bg-white/80 hover:bg-white text-slate-400 hover:text-red-500 rounded-full backdrop-blur transition-all shadow-sm hover:shadow-md opacity-0 group-hover:opacity-100 z-20 border border-slate-200"
                        title="Delete Project"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
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
                        <th className="px-6 py-4 font-medium">{t('dash.location')}</th>
                        <th className="px-6 py-4 font-medium text-right">BOA</th>
                        <th className="px-6 py-4 font-medium text-right">Biarea</th>
                        <th className="px-6 py-4 font-medium text-right">{t('dash.estimated_cost')}</th>
                        <th className="px-6 py-4 font-medium">{t('dash.status')}</th>
                        <th className="px-6 py-4 font-medium">{t('dash.last_updated')}</th>
                        <th className="px-6 py-4 font-medium text-right">{t('dash.actions')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredProjects.map((project) => (
                        <tr key={project.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => router.push(`/qto?project=${project.id}`)}>
                            <td className="px-6 py-4 font-medium text-slate-900 flex items-center">
                                <FolderOpen className="h-4 w-4 mr-3 text-slate-400" />
                                {project.name}
                            </td>
                            <td className="px-6 py-4 text-slate-500">{project.location}</td>
                            <td className="px-6 py-4 text-right text-slate-700">{project.boa || project.totalArea || 0} m²</td>
                            <td className="px-6 py-4 text-right text-slate-500">{project.biarea || 0} m²</td>
                            <td className="px-6 py-4 text-right font-medium text-red-600">{(project.estimatedCost || 0).toLocaleString('sv-SE')} kr</td>
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
                            <td className="px-6 py-4 text-slate-500">{project.lastModified}</td>
                            <td className="px-6 py-4 text-right">
                                <button
                                    onClick={(e) => handleDelete(e, project.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filteredProjects.length === 0 && (
                        <tr>
                            <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
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