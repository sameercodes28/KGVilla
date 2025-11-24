'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProjectData } from '@/hooks/useProjectData';
import { useTranslation } from '@/contexts/LanguageContext';
import { MapPin, CheckCircle, ShieldCheck, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import Link from 'next/link';

function CustomerViewContent() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get('project') || undefined;
    const { items, totalCost, floorPlanUrl } = useProjectData(projectId);
    const { t } = useTranslation();

    // Group items by phase for summary
    const phases = ['ground', 'structure', 'installations', 'interior'];
    const phaseCosts = phases.map(phase => ({
        id: phase,
        label: t(`phase.${phase}`), // Ensure translation keys match 'phase.ground' etc
        total: items.filter(i => i.phase === phase).reduce((sum, i) => sum + i.totalCost, 0)
    }));

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <LanguageToggle />
            
            <Link 
                href={`/qto?project=${projectId || ''}`}
                className="fixed top-6 left-6 z-50 flex items-center text-white/80 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur px-4 py-2 rounded-full transition-all"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Back to Editor</span>
            </Link>
            
            {/* Hero Section */}
            <div className="relative h-[60vh] bg-slate-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-black/40 z-10" />
                {floorPlanUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={floorPlanUrl} alt="Floor Plan" className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm scale-105" />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
                )}
                
                <div className="relative z-20 text-center text-white px-6 max-w-4xl mx-auto">
                    <div className="inline-flex items-center px-3 py-1 rounded-full border border-white/30 bg-white/10 backdrop-blur text-xs font-bold uppercase tracking-widest mb-6">
                        Proposal Ready
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 tracking-tight">Villa JB-1405</h1>
                    <div className="flex items-center justify-center text-lg text-white/80 mb-8">
                        <MapPin className="w-5 h-5 mr-2" />
                        Husby, Sweden
                    </div>
                    <div className="text-6xl font-mono font-bold tracking-tighter">
                        {totalCost.toLocaleString('sv-SE')} <span className="text-2xl align-top text-white/60">SEK</span>
                    </div>
                    <p className="mt-4 text-white/60 text-sm uppercase tracking-widest">Estimated Turnkey Price (Totalentreprenad)</p>
                </div>
            </div>

            {/* Executive Summary */}
            <div className="max-w-4xl mx-auto px-6 py-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-4">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">10-Year Warranty</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">Full defect liability protection under Konsumenttjänstlagen.</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Fixed Price Contract</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">No hidden fees. ABT 06 standard contract for your peace of mind.</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto bg-purple-100 text-purple-700 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Turnkey Delivery</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">We handle everything from permits (Bygglov) to final cleaning.</p>
                    </div>
                </div>
            </div>

            {/* Cost Breakdown (Simplified) */}
            <div className="bg-slate-50 py-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-16">Where your money goes</h2>
                    
                    <div className="space-y-4">
                        {phaseCosts.map((phase) => (
                            <div key={phase.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between hover:shadow-md transition-all">
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900">{phase.label || phase.id}</h4>
                                    <p className="text-sm text-slate-500">Material & Labor included</p>
                                </div>
                                <div className="text-xl font-mono font-bold text-slate-900">
                                    {phase.total.toLocaleString('sv-SE')} kr
                                </div>
                            </div>
                        ))}
                        
                        <div className="flex justify-between items-center pt-8 mt-8 border-t border-slate-200">
                            <span className="text-xl font-bold">Total Estimated Cost</span>
                            <span className="text-4xl font-bold text-blue-600">{totalCost.toLocaleString('sv-SE')} kr</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="py-24 px-6 text-center">
                <h2 className="text-3xl font-bold mb-6">Ready to move forward?</h2>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center">
                        Download Full PDF Quote
                    </button>
                    <button className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center">
                        Contact Builder <ArrowRight className="ml-2 w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CustomerViewPage() {
    return (
        <Suspense fallback={<div>Loading Proposal...</div>}>
            <CustomerViewContent />
        </Suspense>
    );
}
