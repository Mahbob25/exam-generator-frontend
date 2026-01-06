'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useLessons, useSubjects, LessonList, Breadcrumbs } from '@/features/curriculum';
import { PageContainer } from '@/components/layout';
import { QueryProvider } from '@/lib/query';

function SubjectPageContent() {
    const params = useParams();
    const subjectId = params.subjectId as string;

    const { data: subjects } = useSubjects();
    const { data: lessons, isLoading, error } = useLessons(subjectId);

    // Find current subject for display name
    const currentSubject = subjects?.find(s => s.id === subjectId);
    const subjectName = currentSubject?.display_name || currentSubject?.name || subjectId;

    const breadcrumbs = [
        { label: 'الرئيسية', href: '/' },
        { label: 'التعلم', href: '/learn' },
        { label: subjectName },
    ];

    return (
        <PageContainer
            title={subjectName}
            description="اختر الدرس الذي تريد دراسته"
            backButton={{
                label: 'العودة للمواد',
                onClick: () => window.history.back(),
            }}
        >
            <Breadcrumbs items={breadcrumbs} />
            <LessonList
                lessons={lessons}
                subjectId={subjectId}
                isLoading={isLoading}
                error={error}
            />
        </PageContainer>
    );
}

export default function SubjectPage() {
    return (
        <QueryProvider>
            <SubjectPageContent />
        </QueryProvider>
    );
}
