'use client';

import { useState, useRef } from 'react';
import { Plus, FolderOpen, ArrowRight, MapPin, X, UploadCloud, Trash2, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { mockProject } from '@/data/projectData';
import { useTranslation } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useProjects } from '@/hooks/useProjects';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { CostItem } from '@/types';

export default function Home() {
  const { t } = useTranslation();
  const { projects, createProject, deleteProject } = useProjects();
  const router = useRouter();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectLocation, setNewProjectLocation] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setSelectedFile(e.target.files[0]);
    }
  };

  const handleCreate = async () => {
    if (!newProjectName) return;
    
    setIsAnalyzing(true);
    let initialItems: CostItem[] = [];
    let planUrl = '';

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
            const res = await fetch(`${API_URL}/analyze`, { method: 'POST', body: formData });
            if (res.ok) initialItems = await res.json();
        } catch (e) {
            console.error("Analysis failed", e);
        }
    }

    // 3. Create Project with Data
    const id = createProject(newProjectName, newProjectLocation, selectedFile ? { items: initialItems, planUrl } : undefined);
    
    setIsAnalyzing(false);
    setIsModalOpen(false);
    router.push(`/qto?project=${id}`); 
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (confirm('Are you sure you want to delete this project?')) {
          deleteProject(id);
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-60"></div>
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-50/80 to-transparent"></div>
        </div>

      <LanguageToggle />
      
      <main className="max-w-6xl mx-auto pt-16 px-6 pb-20 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/80 backdrop-blur border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide mb-6 shadow-sm">
                <Sparkles className="w-3 h-3 mr-2 text-blue-500" />
                Smart Construction Intelligence
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
                Precision Pricing for <br/>
                <span className="text-blue-600">Swedish Villas.</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed mb-8">
                Instantly analyze blueprints against <strong>BBR 2025</strong> regulations and current market rates. Generate compliant, professional quotes in seconds.
            </p>

            {/* Feature Badges */}
            <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-slate-600">
                <div className="flex items-center bg-white/60 px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                    <ShieldCheck className="w-4 h-4 mr-2 text-green-600" />
                    BBR 2025 Compliant
                </div>
                <div className="flex items-center bg-white/60 px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-blue-600" />
                    Säker Vatten Ready
                </div>
                <div className="flex items-center bg-white/60 px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-purple-600" />
                    ABT 06 Logic
                </div>
            </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Create New Card */}
            <button 
                onClick={() => setIsModalOpen(true)}
                className="group relative flex flex-col items-center justify-center h-72 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-white overflow-hidden"
            >
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="h-20 w-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform border border-white/30">
                    <Plus className="h-10 w-10" />
                </div>
                <h3 className="font-bold text-2xl">{t('dash.create_project')}</h3>
                <p className="text-blue-100 text-sm mt-2 font-medium">Start from a blueprint</p>
            </button>

            {/* Project Cards */}
            {projects.map((project) => (
                <Link key={project.id} href={`/qto?project=${project.id}`} className="block group relative">
                    <div className="h-72 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
                        <div className="h-36 bg-slate-50 relative flex items-center justify-center border-b border-slate-100 group-hover:bg-blue-50/50 transition-colors">
                            <FolderOpen className="h-16 w-16 text-slate-300 group-hover:text-blue-400 transition-colors" />
                            <div className="absolute top-4 right-4 flex space-x-2">
                                <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase text-slate-500 border border-slate-200 shadow-sm">
                                    {project.status || 'DRAFT'}
                                </div>
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
                                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
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
      </main>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative border border-slate-100">
                {isAnalyzing && (
                    <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur flex flex-col items-center justify-center text-center p-8">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="h-6 w-6 text-blue-600 animate-pulse" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Analyzing Blueprint...</h3>
                        <p className="text-sm text-slate-500">Checking compliance with BBR 2025 & Säker Vatten.</p>
                    </div>
                )}
                
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-900">New Project</h3>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Project Name</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 placeholder:text-slate-400 transition-all bg-slate-50 focus:bg-white"
                            placeholder="e.g. Villa Utsikten"
                            value={newProjectName}
                            onChange={e => setNewProjectName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Location</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 placeholder:text-slate-400 transition-all bg-slate-50 focus:bg-white"
                            placeholder="e.g. Stockholm"
                            value={newProjectLocation}
                            onChange={e => setNewProjectLocation(e.target.value)}
                        />
                    </div>
                    
                    {/* File Upload Area */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Floor Plan (Recommended)</label>
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all group"
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                className="hidden" 
                                onChange={handleFileSelect}
                                accept="image/*,application/pdf"
                            />
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                                <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-blue-600" />
                            </div>
                            {selectedFile ? (
                                <div className="text-center">
                                    <span className="text-sm font-bold text-blue-600 block">{selectedFile.name}</span>
                                    <span className="text-xs text-slate-400">Click to change</span>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <span className="text-sm font-medium text-slate-600 block">Click to upload PDF/Image</span>
                                    <span className="text-xs text-slate-400">or drag and drop here</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button 
                        onClick={handleCreate}
                        disabled={!newProjectName}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2 active:scale-[0.98]"
                    >
                        {selectedFile ? 'Analyze & Create Project' : 'Create Empty Project'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
