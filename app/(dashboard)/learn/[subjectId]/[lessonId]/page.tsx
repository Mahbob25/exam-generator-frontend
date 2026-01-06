'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import {
    useConcepts,
    useLessons,
    useSubjects,
    ConceptList,
    Breadcrumbs
} from '@/features/curriculum';
import { PageContainer } from '@/components/layout';
import { QueryProvider } from '@/lib/query';

function LessonPageContent() {
    const params = useParams();
    const subjectId = params.subjectId as string;
    const lessonId = params.lessonId as string;

    const { data: subjects } = useSubjects();
    const { data: lessons } = useLessons(subjectId);
    const { data: concepts, isLoading, error } = useConcepts(lessonId);

    // Find current subject and lesson for display names
    const currentSubject = subjects?.find(s => s.id === subjectId);
    const currentLesson = lessons?.find(l => l.id === lessonId);

    const subjectName = currentSubject?.display_name || currentSubject?.name || subjectId;
    const lessonName = currentLesson?.display_name || currentLesson?.title || lessonId;

    const breadcrumbs = [
        { label: 'الرئيسية', href: '/' },
        { label: 'التعلم', href: '/learn' },
        { label: subjectName, href: `/learn/${subjectId}` },
        { label: lessonName },
    ];

    return (
        <PageContainer
            title={lessonName}
            description="ابدأ بتعلم المفاهيم الأساسية"
            backButton={{
                label: 'العودة للدروس',
                onClick: () => window.history.back(),
            }}
        >
            <Breadcrumbs items={breadcrumbs} />
            <ConceptList
                concepts={concepts}
                subjectId={subjectId}
                lessonId={lessonId}
                isLoading={isLoading}
                error={error}
            />
        </PageContainer>
    );
}

export default function LessonPage() {
    return (
        <QueryProvider>
            <LessonPageContent />
        </QueryProvider>
    );
}
