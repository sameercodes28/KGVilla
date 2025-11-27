import { clientCosts } from '@/data/projectData';
import { Info, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { CostItem } from '@/types';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';

interface ClientCostSectionProps {
    onInspectItem?: (item: CostItem) => void;
}

export function ClientCostSection({ onInspectItem }: ClientCostSectionProps) {
    const { t } = useTranslation();
    const totalClientCost = clientCosts.reduce((sum, item) => sum + item.cost, 0);

    // Map IDs to translation keys
    const getTranslationKey = (id: string) => {
        switch(id) {
            case 'cc-01': return 'lagfart';
            case 'cc-02': return 'pantbrev';
            case 'cc-03': return 'bygglov';
            case 'cc-04': return 'karta';
            case 'cc-05': return 'utstakning';
            case 'cc-06': return 'ka';
            case 'cc-07': return 'el';
            case 'cc-08': return 'fiber';
            case 'cc-09': return 'byggstrom'; 
            case 'cc-10': return 'forsakring';
            default: return 'lagfart';
        }
    };

    const handleInspect = (item: typeof clientCosts[0], title: string, desc: string) => {
        if (!onInspectItem) return;

        // Construct a temporary CostItem for the Inspector
        const inspectableItem: CostItem = {
            id: item.id,
            projectId: 'client-cost',
            phase: 'ground', // Dummy phase
            elementName: title,
            description: desc,
            quantity: 1,
            unit: 'st',
            unitPrice: item.cost,
            totalCost: item.cost,
            totalQuantity: 1,
            confidenceScore: 1.0,
            breakdown: {
                material: 0,
                labor: 0,
                formula: "Standard Fee / Tariff",
                components: ["Government/Municipal Fee", "Administrative Cost"],
                source: "Official Taxor 2025"
            }
        };
        onInspectItem(inspectableItem);
    };

    const TotalDisplay = (
        <div className="text-right">
            <div className="text-lg font-bold text-amber-800 font-mono">{Math.round(totalClientCost).toLocaleString('sv-SE')} kr</div>
            <div className="text-[10px] text-amber-600 uppercase tracking-wider font-medium">{t('client.est_total')}</div>
        </div>
    );

    return (
        <div className="mb-8 bg-amber-50 rounded-2xl border-2 border-amber-200 p-1">
            <CollapsibleSection
                title={t('client.title')}
                subtitle={t('client.desc')}
                rightContent={TotalDisplay}
            >
                {/* Warning notice */}
                <div className="mb-4 p-3 bg-amber-100 rounded-xl border border-amber-200 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <div className="text-sm font-semibold text-amber-800">{t('client.warning_title')}</div>
                        <div className="text-xs text-amber-700 mt-1">{t('client.warning_desc')}</div>
                    </div>
                </div>

                {clientCosts.map((item) => {
                    const key = getTranslationKey(item.id);
                    const title = t(`cost.${key}`) !== `cost.${key}` ? t(`cost.${key}`) : item.name;
                    const desc = t(`cost.${key}_desc`) !== `cost.${key}_desc` ? t(`cost.${key}_desc`) : item.description;

                    return (
                        <div key={item.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-amber-100 shadow-sm group hover:border-amber-300 transition-all">
                            <div className="flex items-start space-x-3">
                                <button
                                    onClick={() => handleInspect(item, title, desc)}
                                    className="mt-1 p-1 bg-amber-50 rounded text-amber-600 hover:bg-amber-100 hover:scale-110 transition-all"
                                    title="View Fee Details"
                                >
                                    <Info className="h-4 w-4" />
                                </button>
                                <div>
                                    <div className="font-semibold text-slate-900">{title}</div>
                                    <div className="text-xs text-slate-500">{desc}</div>
                                </div>
                            </div>
                            <div className="font-mono font-medium text-amber-700">
                                {Math.round(item.cost).toLocaleString('sv-SE')} kr
                            </div>
                        </div>
                    );
                })}
            </CollapsibleSection>
        </div>
    );
}
