/**
 * Curriculum Feature Module
 * 
 * Provides components and hooks for browsing curriculum content.
 * 
 * @see docs/frontend_api_integration_guide.md Section 5
 */

// Types
export type { Subject, Lesson, Concept } from './types';

// Hooks
export { useSubjects, useLessons, useConcepts } from './hooks';

// Components
export {
    SubjectCard,
    SubjectGrid,
    LessonCard,
    LessonList,
    ConceptCard,
    ConceptList,
    Breadcrumbs,
} from './components';
export type { BreadcrumbItem } from './components';
