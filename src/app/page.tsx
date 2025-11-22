'use client';

import { useState, useRef } from 'react';
import { Plus, FolderOpen, ArrowRight, MapPin, X, UploadCloud, Trash2 } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50/50">
      <LanguageToggle />
      
      <main className="max-w-5xl mx-auto pt-24 px-6 pb-20">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wide mb-6">
                AI Quantity Take-Off
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6 font-serif">
                Estimate smarter,<br/> not harder.
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                {t('dash.manage_desc')} Upload blueprints, chat with AI, and get compliant cost breakdowns in seconds.
            </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Create New Card */}
            <button 
                onClick={() => setIsModalOpen(true)}
                className="group relative flex flex-col items-center justify-center h-64 bg-white border-2 border-dashed border-slate-200 rounded-3xl hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300"
            >
                <div className="h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-slate-900 text-lg">{t('dash.create_project')}</h3>
                <p className="text-slate-400 text-sm mt-1">Start from a blueprint</p>
            </button>

            {/* Project Cards */}
            {projects.map((project) => (
                <Link key={project.id} href={`/qto?project=${project.id}`} className="block group relative">
                    <div className="h-64 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
                        <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 relative flex items-center justify-center">
                            <FolderOpen className="h-12 w-12 text-slate-300" />
                            <div className="absolute top-4 right-4 flex space-x-2">
                                <div className="bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold uppercase text-slate-500">
                                    {project.status || 'DRAFT'}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900 text-xl mb-1">{project.name}</h3>
                                <div className="flex items-center text-slate-500 text-sm">
                                    <MapPin className="h-3.5 w-3.5 mr-1" />
                                    {project.location}
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100">
                                <span>{t('dash.updated')} {project.lastModified}</span>
                                <ArrowRight className="h-4 w-4 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={(e) => handleDelete(e, project.id)}
                        className="absolute top-4 left-4 p-2 bg-white/50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full backdrop-blur transition-colors z-10"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </Link>
            ))}
        </div>
      </main>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 relative">
                {isAnalyzing && (
                    <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="font-bold text-slate-900">Analyzing Blueprint...</p>
                        <p className="text-sm text-slate-500">This may take 10-20 seconds</p>
                    </div>
                )}
                
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900">New Project</h3>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 placeholder:text-slate-400"
                            placeholder="e.g. Villa Utsikten"
                            value={newProjectName}
                            onChange={e => setNewProjectName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 placeholder:text-slate-400"
                            placeholder="e.g. Stockholm"
                            value={newProjectLocation}
                            onChange={e => setNewProjectLocation(e.target.value)}
                        />
                    </div>
                    
                    {/* File Upload Area */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Floor Plan (Optional)</label>
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                className="hidden" 
                                onChange={handleFileSelect}
                                accept="image/*,application/pdf"
                            />
                            <UploadCloud className="h-8 w-8 text-blue-500 mb-2" />
                            {selectedFile ? (
                                <span className="text-sm font-medium text-blue-600">{selectedFile.name}</span>
                            ) : (
                                <span className="text-xs text-slate-400">Click to upload PDF/Image</span>
                            )}
                        </div>
                    </div>

                    <button 
                        onClick={handleCreate}
                        disabled={!newProjectName}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
                    >
                        {selectedFile ? 'Analyze & Create' : 'Create Project'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
