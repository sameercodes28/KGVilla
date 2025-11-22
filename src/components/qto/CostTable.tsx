'use client';

import { useState, useMemo } from 'react';
import { CostItem } from '@/types';
import { initialCostItems as mockBoQ } from '@/data/projectData';
import { ChevronDown, MoreHorizontal, AlertCircle, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';
import { TechnicalTerm } from '@/components/ui/TechnicalTerm';

interface CostTableProps {
    currentLevelId: string;
}

export function CostTable({ currentLevelId }: CostTableProps) {
    const [items, setItems] = useState<CostItem[]>(mockBoQ);
    const { t } = useTranslation();

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            // If item has no levelId, it's project-wide (show always or in a "General" tab?)
            // For now, let's show project-wide items AND items for the current level
            return !item.levelId || item.levelId === currentLevelId;
        });
    }, [items, currentLevelId]);

    const updateWaste = (id: string, newWaste: number) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const total = item.quantity * (1 + newWaste / 100);
                return { ...item, wastePercentage: newWaste, totalQuantity: total };
            }
            return item;
        }));
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-900">{t('boq.title')}</h3>
                <div className="flex space-x-2">
                    <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50">
                        {t('boq.export_excel')}
                    </button>
                    <button className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        {t('boq.save')}
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 w-1/3">{t('boq.col.element')}</th>
                            <th className="px-6 py-4 text-right">{t('boq.col.quantity')}</th>
                            <th className="px-6 py-4 text-right">{t('boq.col.unit')}</th>
                            <th className="px-6 py-4 text-right w-32">
                                <TechnicalTerm
                                    term={t('boq.col.waste')}
                                    definition="Spill (Waste) accounts for material loss during cutting and installation. Standard is 5-10%."
                                />
                            </th>
                            <th className="px-6 py-4 text-right font-bold text-slate-900">{t('boq.col.total')}</th>
                            <th className="px-6 py-4 text-center">{t('boq.col.status')}</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className={cn(
                                            "h-8 w-8 rounded-lg flex items-center justify-center mr-3",
                                            item.confidenceScore > 0.9 ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
                                        )}>
                                            {item.confidenceScore < 0.9 && <AlertCircle className="h-4 w-4" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{item.elementName}</p>
                                            <p className="text-xs text-slate-500">{item.description}</p>
                                            {/* Show Level Badge if item is specific to a level */}
                                            {item.levelId && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 mt-1">
                                                    {item.levelId === 'l-01' ? 'Plan 1' : 'Vind'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-slate-600">
                                    {item.quantity.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-right text-slate-500">
                                    {item.unit}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-1">
                                        <input
                                            type="number"
                                            value={item.wastePercentage}
                                            onChange={(e) => updateWaste(item.id, Number(e.target.value))}
                                            className="w-16 text-right border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        />
                                        <span className="text-slate-400">%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right font-bold font-mono text-slate-900">
                                    {item.totalQuantity.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={cn(
                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                        item.confidenceScore > 0.9
                                            ? "bg-green-100 text-green-800"
                                            : "bg-amber-100 text-amber-800"
                                    )}>
                                        {Math.round(item.confidenceScore * 100)}%
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
