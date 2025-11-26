'use client';

import React from 'react';
import { ShieldCheck, FileText, Clock, AlertTriangle } from 'lucide-react';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { useTranslation } from '@/contexts/LanguageContext';

interface ContractScopeProps {
    totalCost: number;
}

export function ContractScope({ totalCost }: ContractScopeProps) {
    const { t } = useTranslation();

    const paymentSteps = [
        { label: t('contract.step1'), percent: 10, amount: totalCost * 0.10 },
        { label: t('contract.step2'), percent: 25, amount: totalCost * 0.25 },
        { label: t('contract.step3'), percent: 35, amount: totalCost * 0.35 },
        { label: t('contract.step4'), percent: 20, amount: totalCost * 0.20 },
        { label: t('contract.step5'), percent: 10, amount: totalCost * 0.10 },
    ];

    const RiskDisplay = (
        <div className="text-right">
            <div className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Totalentreprenad</div>
            <div className="text-xs text-slate-400">ABT 06 Standard</div>
        </div>
    );

    return (
        <div className="mb-8">
            <CollapsibleSection
                title={t('contract.title')}
                subtitle={t('contract.subtitle')}
                rightContent={RiskDisplay}
            >
                <div className="p-4 space-y-6">
                    {/* Key Protections */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 p-3 rounded-xl border border-green-100 flex flex-col items-center text-center">
                            <ShieldCheck className="h-6 w-6 text-green-600 mb-2" />
                            <div className="text-sm font-bold text-green-800">{t('contract.warranty')}</div>
                            <div className="text-[10px] text-green-600">{t('contract.warranty_desc')}</div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex flex-col items-center text-center">
                            <FileText className="h-6 w-6 text-blue-600 mb-2" />
                            <div className="text-sm font-bold text-blue-800">{t('contract.fixed_price')}</div>
                            <div className="text-[10px] text-blue-600">{t('contract.fixed_price_desc')}</div>
                        </div>
                    </div>

                    {/* Payment Schedule */}
                    <div>
                        <div className="flex items-center space-x-2 mb-3">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <h4 className="text-sm font-semibold text-slate-700">{t('contract.payment_schedule')}</h4>
                        </div>
                        <div className="space-y-3">
                            {paymentSteps.map((step, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">
                                            {i + 1}
                                        </div>
                                        <span className="text-slate-600">{step.label}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono font-medium text-slate-900">{step.amount.toLocaleString('sv-SE')} kr</div>
                                        <div className="text-[10px] text-slate-400">{step.percent}%</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Inclusions Note */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-start">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0" />
                        <p>
                            <strong>{t('contract.included')}</strong><br/>
                            <strong>{t('contract.excluded')}</strong>
                        </p>
                    </div>
                </div>
            </CollapsibleSection>
        </div>
    );
}
