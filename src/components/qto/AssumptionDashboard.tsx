'use client';

import { AlertTriangle, Check, X, HelpCircle } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { TechnicalTerm } from '@/components/ui/TechnicalTerm';

const assumptions = [
    {
        id: 1,
        type: 'warning',
        title: 'Takhöjd ej angiven',
        description: 'Takhöjd saknas i sektionsritning A-40-2-001. Antagit standardhöjd enligt BBR 3:3.',
        value: '2400 mm',
        confidence: 0.85,
    },
    {
        id: 2,
        type: 'info',
        title: 'Materialval Yttertak',
        description: 'Identifierat "Betongpannor" baserat på fasadritningens textur, men ej specificerat i text.',
        value: 'Betongpannor 2-kupiga',
        confidence: 0.72,
    },
    {
        id: 3,
        type: 'info',
        title: 'Våtrumszon',
        description: 'Rum 104 identifierat som WC/Dusch. Antagit tätskiktszon 1 för hela golvet.',
        value: 'GVK Zon 1',
        confidence: 0.92,
    },
];

export function AssumptionDashboard() {
    const { t } = useTranslation();

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-amber-50/50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <h3 className="font-semibold text-slate-900">
                        {t('assump.title')}
                    </h3>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full">
                    3 {t('assump.review')}
                </span>
            </div>

            <div className="divide-y divide-slate-100">
                {assumptions.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <span className="font-medium text-slate-900">{item.title}</span>
                                    <span className="text-xs text-slate-400 flex items-center">
                                        <HelpCircle className="h-3 w-3 mr-1" />
                                        {Math.round(item.confidence * 100)}% {t('assump.confidence')}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600">
                                    {item.id === 1 ? (
                                        <>
                                            Takhöjd saknas. Antagit standardhöjd enligt <TechnicalTerm term="BBR 3:3" definition="Boverkets byggregler (BBR) section 3:3 regulates room height. Minimum 2.40m is required for habitable rooms." />.
                                        </>
                                    ) : item.description}
                                </p>
                                <div className="flex items-center space-x-2 mt-2">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('assump.suggested')}</span>
                                    <span className="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800">{item.value}</span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                                <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Godkänn">
                                    <Check className="h-5 w-5" />
                                </button>
                                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Ändra">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
