'use client';

import React from 'react';
import { useSubjects, SubjectGrid, Breadcrumbs } from '@/features/curriculum';
import { PageContainer } from '@/components/layout';
import { QueryProvider } from '@/lib/query';

function LearnPageContent() {
    const { data: subjects, isLoading, error } = useSubjects();

    const breadcrumbs = [
        { label: 'الرئيسية', href: '/' },
        { label: 'التعلم' },
    ];

    return (
        <PageContainer
            title="اختر المادة"
            description="ابدأ رحلة التعلم باختيار المادة التي تريد دراستها"
        >
            <Breadcrumbs items={breadcrumbs} />
            <SubjectGrid
                subjects={subjects}
                isLoading={isLoading}
                error={error}
            />
        </PageContainer>
    );
}

export default function LearnPage() {
    return (
        <QueryProvider>
            <LearnPageContent />
        </QueryProvider>
    );
}
