/**
 * Learning Feature Types
 * 
 * Types for the learning runtime and session management.
 */

export type {
    LearningSession,
    LearningFlow,
    Progress,
    AdaptiveRecommendation,
    Hook,
    Dose,
    AdaptiveExplain,
    Experiment,
    Why,
    ExitChallenge,
    Reward,
} from '@/lib/types/api';

export type { LearningStep } from '@/lib/types/common';

/**
 * Learning step display info
 */
export interface StepInfo {
    id: LearningStep;
    label: string;
    icon: string;
}

export const LEARNING_STEPS: StepInfo[] = [
    { id: 'hook', label: 'المقدمة', icon: '🎯' },
    { id: 'dose', label: 'المحتوى', icon: '📖' },
    { id: 'experiment', label: 'التجربة', icon: '🧪' },
    { id: 'why', label: 'لماذا؟', icon: '💡' },
    { id: 'exit_challenge', label: 'التحدي', icon: '🏆' },
];

/**
 * Experiment answer state
 */
export interface ExperimentAnswer {
    selectedIndex: number | null;
    isCorrect: boolean | null;
    isSubmitted: boolean;
}

import type { LearningStep } from '@/lib/types/common';
