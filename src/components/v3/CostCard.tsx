'use client';

import React, { useState } from 'react';
import { CostItem } from '@/types';
import { ChevronDown, ChevronUp, Info, AlertCircle, CheckCircle2, Edit2, Save, X, Calculator, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';

interface CostCardProps {
    item: CostItem;
    onUpdate?: (updatedItem: CostItem) => void;
}

export function CostCard({ item, onUpdate }: CostCardProps) {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState({
        unitPrice: item.customUnitPrice || item.unitPrice,
        quantity: item.customQuantity || item.quantity
    });
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

    // Calculate effective values
    const unitPrice = item.customUnitPrice ?? item.unitPrice;
    const quantity = item.customQuantity ?? item.quantity;
    const totalCost = unitPrice * quantity;

    // Check if item has been customized
    const hasCustomValues = item.customUnitPrice !== undefined || item.customQuantity !== undefined;

    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onUpdate) {
            onUpdate({
                ...item,
                customUnitPrice: editValues.unitPrice,
                customQuantity: editValues.quantity,
                totalCost: editValues.unitPrice * editValues.quantity,
                totalQuantity: editValues.quantity
            });
        }
        setIsEditing(false);
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditValues({
            unitPrice: item.customUnitPrice || item.unitPrice,
            quantity: item.customQuantity || item.quantity
        });
        setIsEditing(false);
    };

    const currentOption = item.options?.find(opt => opt.id === selectedOptionId);

    return (
        <div
            className={cn(
                "border rounded-xl transition-all duration-200 bg-white hover:shadow-md",
                isExpanded ? "border-blue-200 shadow-sm" : "border-slate-100",
                item.isUserAdded ? "border-l-4 border-l-purple-500" : ""
            )}
        >
            <div
                className="p-4 cursor-pointer"
                onClick={() => !isEditing && setIsExpanded(!isExpanded)}
            >
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-slate-900">{item.elementName}</h4>
                            {item.isUserAdded && (
                                <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase rounded">{t('card.custom')}</span>
                            )}
                            {hasCustomValues && !item.isUserAdded && (
                                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded">{t('card.edited')}</span>
                            )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                            <p className="text-sm text-slate-500">{item.description}</p>
                            {currentOption && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                    {currentOption.name}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Quantity & Cost */}
                    <div className="text-right">
                        {isEditing ? (
                            <div className="flex flex-col items-end space-y-2" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center space-x-2">
                                    <label className="text-xs text-slate-500">{t('card.qty')}</label>
                                    <input
                                        type="number"
                                        value={editValues.quantity}
                                        onChange={(e) => setEditValues({ ...editValues, quantity: Number(e.target.value) })}
                                        className="w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <label className="text-xs text-slate-500">{t('card.price')}</label>
                                    <input
                                        type="number"
                                        value={editValues.unitPrice}
                                        onChange={(e) => setEditValues({ ...editValues, unitPrice: Number(e.target.value) })}
                                        className="w-24 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="flex space-x-2 mt-1">
                                    <button onClick={handleSave} className="p-1 text-green-600 hover:bg-green-50 rounded"><Save className="h-4 w-4" /></button>
                                    <button onClick={handleCancel} className="p-1 text-red-600 hover:bg-red-50 rounded"><X className="h-4 w-4" /></button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="font-mono font-medium text-slate-900">
                                    {quantity.toFixed(1)} <span className="text-slate-500 text-sm">{item.unit}</span>
                                </div>
                                <div className="text-sm font-semibold text-slate-700 mt-0.5">
                                    {totalCost.toLocaleString('sv-SE')} kr
                                </div>
                                <div className="flex items-center justify-end text-[10px] text-slate-400 mt-1">
                                    {unitPrice.toLocaleString('sv-SE')} kr/{item.unit}
                                    {!isEditing && onUpdate && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsEditing(true);
                                            }}
                                            className="ml-2 p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition-colors"
                                        >
                                            <Edit2 className="h-3 w-3" />
                                        </button>
                                    )}
                                    <ChevronDown className={cn("h-3 w-3 ml-1 transition-transform", isExpanded && "rotate-180")} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Expansion Content */}
            {isExpanded && (
                <div className="px-4 pb-4 pt-0 bg-slate-50/50 border-t border-slate-100">

                    {/* Options Selector */}
                    {item.options && (
                        <div className="mb-4 pt-4">
                            <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('card.select_option')}</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {item.options.map(option => (
                                    <button
                                        key={option.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedOptionId(option.id);
                                        }}
                                        className={cn(
                                            "px-3 py-2 rounded-lg text-sm text-left border transition-all",
                                            selectedOptionId === option.id
                                                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                                : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                                        )}
                                    >
                                        <div className="font-medium">{option.name}</div>
                                        <div className={cn("text-xs mt-0.5", selectedOptionId === option.id ? "text-blue-100" : "text-slate-500")}>
                                            {option.priceModifier} kr/{item.unit}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Cost Breakdown */}
                    <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('card.breakdown')}</h5>
                        <div className="flex items-center space-x-4 text-sm">
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="text-slate-600">{t('card.materials')}</span>
                                    <span className="font-medium text-slate-900">{(totalCost * 0.6).toLocaleString('sv-SE')} kr</span>
                                </div>
                                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[60%]"></div>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="text-slate-600">{t('card.labor')}</span>
                                    <span className="font-medium text-slate-900">{(totalCost * 0.4).toLocaleString('sv-SE')} kr</span>
                                </div>
                                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 w-[40%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {/* Calculation Logic */}
                        {item.calculationLogic && (
                            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                                <div className="flex items-center text-blue-700 mb-1">
                                    <Calculator className="h-3.5 w-3.5 mr-1.5" />
                                    <span className="text-xs font-bold uppercase tracking-wide">{t('card.ai_calculation')}</span>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed">
                                    {item.calculationLogic}
                                </p>
                            </div>
                        )}

                        {/* Guideline Reference */}
                        {item.guidelineReference && (
                            <div className="bg-slate-100 rounded-xl p-3 border border-slate-200">
                                <div className="flex items-center text-slate-600 mb-1">
                                    <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                                    <span className="text-xs font-bold uppercase tracking-wide">{t('card.guideline')}</span>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed">
                                    {item.guidelineReference}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
