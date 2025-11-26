'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SplitLayout } from '@/components/qto/SplitLayout';
import { ProjectList } from '@/components/qto/ProjectList';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { BottomNav } from '@/components/layout/BottomNav';

function QTOContent() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get('project') || undefined;

    if (!projectId) {
        return (
            <>
                <ProjectList />
                <LanguageToggle />
                <BottomNav />
            </>
        );
    }

    return (
        <>
            <SplitLayout projectId={projectId} />
            <LanguageToggle />
            <BottomNav />
        </>
    );
}

export default function QTOPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center text-slate-500">{/* Loading handled by SplitLayout */}</div>}>
            <QTOContent />
        </Suspense>
    );
}
