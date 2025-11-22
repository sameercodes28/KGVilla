'use client';

import { useState } from 'react';
import { Plus, FolderOpen, ArrowRight, MapPin, X } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useProjects } from '@/hooks/useProjects';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { t } = useTranslation();
  const { projects, createProject } = useProjects();
  const router = useRouter();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectLocation, setNewProjectLocation] = useState('');

  const handleCreate = () => {
    if (!newProjectName) return;
    createProject(newProjectName, newProjectLocation);
    setIsModalOpen(false);
    // TODO: Add dynamic routing /qto/[id]. For now, we just use the default view but the data is created.
    // Since the SplitLayout is currently hardcoded to the mock ID, we just redirect to /qto.
    // In the future, this will be `router.push(/qto/${id})`
    router.push('/qto'); 
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
                <Link key={project.id} href="/qto" className="block group">
                    <div className="h-64 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
                        <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 relative flex items-center justify-center">
                            <FolderOpen className="h-12 w-12 text-slate-300" />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold uppercase text-slate-500">
                                {project.status || 'DRAFT'}
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
                </Link>
            ))}
        </div>
      </main>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
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
                    <button 
                        onClick={handleCreate}
                        disabled={!newProjectName}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
                    >
                        Create Project
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
