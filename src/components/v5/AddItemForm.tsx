'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';
import { CostItem, ConstructionPhase } from '@/types';

interface AddItemFormProps {
    onAdd: (item: Partial<CostItem>) => void;
    phases: { id: string; label: string }[];
}

export function AddItemForm({ onAdd, phases }: AddItemFormProps) {
    const { t } = useTranslation();
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [newItemData, setNewItemData] = useState<Partial<CostItem>>({
        elementName: '',
        unitPrice: 0,
        quantity: 1,
        unit: 'st',
        phase: 'structure'
    });

    const handleSubmit = () => {
        if (!newItemData.elementName || newItemData.unitPrice === undefined) return;
        
        onAdd(newItemData);
        
        setIsAddingItem(false);
        setNewItemData({ elementName: '', unitPrice: 0, quantity: 1, unit: 'st', phase: 'structure' });
    };

    if (!isAddingItem) {
        return (
            <button
                onClick={() => setIsAddingItem(true)}
                className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
                <Plus className="w-5 h-5" />
                <span>{t('qto.add_custom_item')}</span>
            </button>
        );
    }

    return (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-bold text-slate-900">{t('qto.add_new_item')}</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">{t('qto.item_name')}</label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g. Extra Insulation"
                        value={newItemData.elementName}
                        onChange={e => setNewItemData({ ...newItemData, elementName: e.target.value })}
                        autoFocus
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">{t('qto.price')}</label>
                    <input
                        type="number"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newItemData.unitPrice}
                        onChange={e => setNewItemData({ ...newItemData, unitPrice: Number(e.target.value) })}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">{t('qto.quantity')}</label>
                    <input
                        type="number"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newItemData.quantity}
                        onChange={e => setNewItemData({ ...newItemData, quantity: Number(e.target.value) })}
                    />
                </div>
                <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">{t('qto.phase')}</label>
                    <select
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={newItemData.phase}
                        onChange={e => setNewItemData({ ...newItemData, phase: e.target.value as ConstructionPhase })}
                    >
                        {phases.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex space-x-3 pt-2">
                <button
                    onClick={handleSubmit}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    {t('qto.btn_add')}
                </button>
                <button
                    onClick={() => setIsAddingItem(false)}
                    className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium"
                >
                    {t('qto.btn_cancel')}
                </button>
            </div>
        </div>
    );
}
