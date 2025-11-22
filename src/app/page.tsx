'use client';

import { Plus, FolderOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { mockProject } from '@/data/projectData';

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto pt-20 px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">My Projects</h1>
        <p className="text-slate-500 text-lg">Manage your house estimates and calculations.</p>
      </div>

      {/* Project List */}
      <div className="space-y-4">
        {/* Existing Project Card */}
        <Link href="/qto" className="block group">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FolderOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">{mockProject.name}</h3>
                <p className="text-slate-500">{mockProject.location} • Updated 2h ago</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
          </div>
        </Link>

        {/* New Project Button */}
        <button className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 hover:bg-slate-100 transition-all group">
          <Plus className="h-6 w-6 mr-2 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Create New Project</span>
        </button>
      </div>
    </div>
  );
}
