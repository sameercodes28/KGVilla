'use client';

import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

export default function NotFound() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 text-center">

                <div className="bg-gradient-to-b from-blue-50 to-white p-10 pb-6">
                    <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                        <Search className="h-10 w-10 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">{t('notfound.title')}</h2>
                    <p className="text-slate-500 text-lg leading-relaxed">
                        {t('notfound.message')}
                    </p>
                </div>

                <div className="p-8 pt-2 space-y-4">
                    <Link
                        href="/"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center"
                    >
                        <Home className="h-5 w-5 mr-2" />
                        {t('common.back_home')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
