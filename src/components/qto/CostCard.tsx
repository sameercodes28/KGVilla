'use client';

import React, { useState, useEffect } from 'react';
import { CostItem } from '@/types';
import { ChevronDown, Info, Edit2, Save, X, Calculator, BookOpen, ShieldCheck, ToggleLeft, ToggleRight, Factory, TrendingDown, Zap, Target } from 'lucide-react';
import { getItemRegulations, REGULATION_COLORS, RegulationRef } from '@/data/regulationMapping';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/LanguageContext';
import { logger } from '@/lib/logger';

interface CostCardProps {
    item: CostItem;
    onUpdate?: (updatedItem: CostItem) => void;
    onInspect?: (item: CostItem) => void;
}

export function CostCard({ item, onUpdate, onInspect }: CostCardProps) {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState({
        unitPrice: item.customUnitPrice || item.unitPrice,
        quantity: item.customQuantity || item.quantity
    });
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

    // Track component mount with item info
    useEffect(() => {
        logger.debug('CostCard', `Mounted: ${item.elementName}`, { itemId: item.id });
    }, [item.id, item.elementName]);

    // Calculate effective values
    const unitPrice = item.customUnitPrice ?? item.unitPrice;
    const quantity = item.customQuantity ?? item.quantity;
    const totalCost = unitPrice * quantity;

    // Check if item has been ACTUALLY customized (values differ from original)
    // Note: null/undefined both mean "not customized" - only truthy values count
    const hasCustomValues = (
        (item.customUnitPrice != null && item.customUnitPrice !== item.unitPrice) ||
        (item.customQuantity != null && item.customQuantity !== item.quantity)
    );

    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        logger.info('CostCard', 'Saving item changes', {
            itemId: item.id,
            elementName: item.elementName,
            oldValues: { unitPrice: item.unitPrice, quantity: item.quantity },
            newValues: editValues
        });
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

    // Validation Constants
    const MIN_QUANTITY = 0;
    const MAX_QUANTITY = 1000000;

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // Allow empty string for typing, parse otherwise
        if (val === '') {
            setEditValues(prev => ({ ...prev, quantity: 0 })); // Or handle as empty
            return;
        }
        const num = parseFloat(val);
        if (!isNaN(num)) {
            setEditValues(prev => ({ ...prev, quantity: num }));
        }
    };

    const handleQuantityBlur = () => {
        let num = editValues.quantity;
        if (num < MIN_QUANTITY) num = MIN_QUANTITY;
        if (num > MAX_QUANTITY) num = MAX_QUANTITY;
        setEditValues(prev => ({ ...prev, quantity: num }));
    };

    // Price Validation
    const MIN_PRICE = 0;
    const MAX_PRICE = 10000000;

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '') {
            setEditValues(prev => ({ ...prev, unitPrice: 0 }));
            return;
        }
        const num = parseFloat(val);
        if (!isNaN(num)) {
            setEditValues(prev => ({ ...prev, unitPrice: num }));
        }
    };

    const handlePriceBlur = () => {
        let num = editValues.unitPrice;
        if (num < MIN_PRICE) num = MIN_PRICE;
        if (num > MAX_PRICE) num = MAX_PRICE;
        setEditValues(prev => ({ ...prev, unitPrice: num }));
    };

    const currentOption = item.options?.find(opt => opt.id === selectedOptionId);

    // Translation logic for item name and description
    const nameKey = `item.${item.id}`;
    const descKey = `item.${item.id}_desc`;
    
    const translatedName = t(nameKey) !== nameKey ? t(nameKey) : item.elementName;
    const translatedDesc = t(descKey) !== descKey ? t(descKey) : item.description;

    // Get applicable regulations for this item
    const applicableRegulations = getItemRegulations({
        id: item.id,
        elementName: item.elementName,
        phase: item.phase
    });

    const isDisabled = item.disabled === true;

    const handleToggleDisabled = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onUpdate) {
            onUpdate({
                ...item,
                disabled: !isDisabled
            });
        }
    };

    return (
        <div
            className={cn(
                "border rounded-xl transition-all duration-200 bg-white hover:shadow-md",
                isExpanded ? "border-red-200 shadow-sm" : "border-slate-100",
                item.isUserAdded ? "border-l-4 border-l-purple-500" : "",
                isDisabled && "opacity-50 bg-slate-50"
            )}
        >
            <div
                className="p-4 cursor-pointer"
                onClick={() => !isEditing && setIsExpanded(!isExpanded)}
            >
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center space-x-2">
                            {/* Enable/Disable Toggle */}
                            {onUpdate && (
                                <button
                                    onClick={handleToggleDisabled}
                                    className={cn(
                                        "p-0.5 rounded transition-colors flex-shrink-0",
                                        isDisabled
                                            ? "text-slate-400 hover:text-green-600"
                                            : "text-green-600 hover:text-slate-400"
                                    )}
                                    title={isDisabled ? t('card.enable') || 'Enable item' : t('card.disable') || 'Disable item'}
                                >
                                    {isDisabled ? (
                                        <ToggleLeft className="h-5 w-5" />
                                    ) : (
                                        <ToggleRight className="h-5 w-5" />
                                    )}
                                </button>
                            )}
                            <h4 className={cn(
                                "font-semibold text-slate-900",
                                isDisabled && "line-through text-slate-400"
                            )}>{translatedName}</h4>
                            {onInspect && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onInspect(item); }}
                                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                    title={t('costcard.view_analysis')}
                                >
                                    <Info className="h-4 w-4" />
                                </button>
                            )}
                            {isDisabled && (
                                <span className="px-1.5 py-0.5 bg-slate-200 text-slate-500 text-[10px] font-bold uppercase rounded">{t('card.excluded') || 'Excluded'}</span>
                            )}
                            {item.isUserAdded && !isDisabled && (
                                <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase rounded">{t('card.custom')}</span>
                            )}
                            {hasCustomValues && !item.isUserAdded && !isDisabled && (
                                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded">{t('card.edited')}</span>
                            )}
                            {item.prefabDiscount && !isDisabled && (
                                <span className={cn(
                                    "px-1.5 py-0.5 text-[10px] font-bold uppercase rounded flex items-center gap-1",
                                    item.prefabDiscount.efficiencyType === 'STREAMLINED'
                                        ? "bg-blue-100 text-blue-700"
                                        : item.prefabDiscount.efficiencyType === 'STANDARDIZED'
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-green-100 text-green-700"
                                )}>
                                    {item.prefabDiscount.efficiencyType === 'STREAMLINED' ? (
                                        <Zap className="h-3 w-3" />
                                    ) : item.prefabDiscount.efficiencyType === 'STANDARDIZED' ? (
                                        <Target className="h-3 w-3" />
                                    ) : (
                                        <Factory className="h-3 w-3" />
                                    )}
                                    {item.prefabDiscount.efficiencyType || 'PREFAB'}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                            <p className="text-sm text-slate-500">{translatedDesc}</p>
                            {currentOption && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700">
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
                                        min={MIN_QUANTITY}
                                        max={MAX_QUANTITY}
                                        value={editValues.quantity}
                                        onChange={handleQuantityChange}
                                        onBlur={handleQuantityBlur}
                                        className="w-20 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-red-500 outline-none"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <label className="text-xs text-slate-500">{t('card.price')}</label>
                                    <input
                                        type="number"
                                        min={MIN_PRICE}
                                        max={MAX_PRICE}
                                        value={editValues.unitPrice}
                                        onChange={handlePriceChange}
                                        onBlur={handlePriceBlur}
                                        className="w-24 px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-red-500 outline-none"
                                    />
                                </div>
                                <div className="flex space-x-2 mt-1">
                                    <button onClick={handleSave} aria-label="Save changes" className="p-1 text-green-600 hover:bg-green-50 rounded"><Save className="h-4 w-4" /></button>
                                    <button onClick={handleCancel} aria-label="Cancel editing" className="p-1 text-red-600 hover:bg-red-50 rounded"><X className="h-4 w-4" /></button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="font-mono font-medium text-slate-900">
                                    {(Math.round(quantity * 10) / 10).toFixed(1)} <span className="text-slate-500 text-sm">{item.unit}</span>
                                </div>
                                <div className="text-sm font-semibold text-slate-700 mt-0.5">
                                    {Math.round(totalCost).toLocaleString('sv-SE')} kr
                                </div>
                                <div className="flex items-center justify-end text-[10px] text-slate-400 mt-1">
                                    {Math.round(unitPrice).toLocaleString('sv-SE')} kr/{item.unit}
                                    {!isEditing && onUpdate && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsEditing(true);
                                            }}
                                            className="ml-2 p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-red-600 transition-colors"
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
                                                ? "bg-red-600 text-white border-red-600 shadow-sm"
                                                : "bg-white text-slate-700 border-slate-200 hover:border-red-300"
                                        )}
                                    >
                                        <div className="font-medium">{option.name}</div>
                                        <div className={cn("text-xs mt-0.5", selectedOptionId === option.id ? "text-red-100" : "text-slate-500")}>
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
                                    <span className="font-medium text-slate-900">{Math.round(totalCost * 0.6).toLocaleString('sv-SE')} kr</span>
                                </div>
                                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 w-[60%]"></div>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="text-slate-600">{t('card.labor')}</span>
                                    <span className="font-medium text-slate-900">{Math.round(totalCost * 0.4).toLocaleString('sv-SE')} kr</span>
                                </div>
                                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 w-[40%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* JB Villan Efficiency */}
                    {item.prefabDiscount && (() => {
                        const effType = item.prefabDiscount.efficiencyType || 'PREFAB';
                        const colors = {
                            PREFAB: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-200 text-green-800' },
                            STREAMLINED: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-200 text-blue-800' },
                            STANDARDIZED: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-200 text-purple-800' },
                        }[effType];
                        const Icon = effType === 'STREAMLINED' ? Zap : effType === 'STANDARDIZED' ? Target : Factory;
                        const title = effType === 'PREFAB' ? t('prefab.title') : `JB VILLAN ${effType}`;

                        return (
                            <div className={cn("mb-4 p-3 rounded-xl border", colors.bg, colors.border)}>
                                <div className={cn("flex items-center mb-2", colors.text)}>
                                    <Icon className="h-3.5 w-3.5 mr-1.5" />
                                    <span className="text-xs font-bold uppercase tracking-wide">{title}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <div className="text-slate-500 text-xs mb-0.5">{t('prefab.general_contractor')}</div>
                                        <div className="font-mono text-slate-400 line-through">
                                            {Math.round(item.prefabDiscount.generalContractorPrice).toLocaleString('sv-SE')} kr
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-slate-500 text-xs mb-0.5">{t('prefab.jb_price')}</div>
                                        <div className={cn("font-mono font-semibold", colors.text)}>
                                            {Math.round(item.prefabDiscount.jbVillanPrice).toLocaleString('sv-SE')} kr
                                        </div>
                                    </div>
                                </div>
                                <div className={cn("mt-2 pt-2 border-t flex items-center justify-between", colors.border)}>
                                    <div className={cn("flex items-center gap-1.5", colors.text)}>
                                        <TrendingDown className="h-3.5 w-3.5" />
                                        <span className="text-xs font-medium">
                                            {t('prefab.you_save')} <span className="font-bold font-mono">{Math.round(item.prefabDiscount.savingsAmount).toLocaleString('sv-SE')} kr</span>
                                        </span>
                                        <span className={cn("px-1.5 py-0.5 text-[10px] font-bold rounded-full", colors.badge)}>
                                            -{item.prefabDiscount.savingsPercent}%
                                        </span>
                                    </div>
                                </div>
                                {/* Short reason */}
                                <p className={cn("mt-2 text-xs font-medium leading-relaxed", colors.text)}>
                                    {item.prefabDiscount.reason}
                                </p>
                                {/* Detailed explanation (if available) */}
                                {item.prefabDiscount.explanation && (
                                    <p className="mt-2 text-xs text-slate-600 leading-relaxed bg-white/50 rounded-lg p-2 border border-slate-100">
                                        {item.prefabDiscount.explanation}
                                    </p>
                                )}
                            </div>
                        );
                    })()}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {/* Calculation Logic */}
                        {item.calculationLogic && (
                            <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                                <div className="flex items-center text-red-700 mb-1">
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

                    {/* Applicable Regulations */}
                    {applicableRegulations.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center text-slate-600 mb-3">
                                <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                                <span className="text-xs font-bold uppercase tracking-wide">{t('card.regulations') || 'Applicable Regulations'}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {applicableRegulations.map((reg: RegulationRef) => {
                                    const colors = REGULATION_COLORS[reg.id] || { color: 'text-slate-700', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' };
                                    return (
                                        <div
                                            key={reg.id}
                                            className={cn(
                                                "group relative px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-help",
                                                colors.bgColor,
                                                colors.borderColor,
                                                colors.color,
                                                "hover:shadow-sm"
                                            )}
                                            title={`${reg.name}${reg.section ? ` (${reg.section})` : ''}: ${reg.requirement || ''}`}
                                        >
                                            <span className="font-semibold">{reg.name}</span>
                                            {reg.section && (
                                                <span className="ml-1 opacity-70">{reg.section}</span>
                                            )}
                                            {/* Tooltip on hover */}
                                            {reg.requirement && (
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                                                    {reg.requirement}
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
