/**
 * Learning Feature Module
 * 
 * Provides the core adaptive learning flow with 5 stages.
 * 
 * @see docs/frontend_api_integration_guide.md Section 6 & 7
 */

// Types (renamed to avoid conflict with component names)
export type {
    LearningSession as LearningSessionType,
    LearningFlow,
    Progress,
    AdaptiveRecommendation,
    Hook,
    Dose,
    AdaptiveExplain,
    Experiment,
    Why,
    ExitChallenge as ExitChallengeType,
    Reward,
    LearningStep,
    StepInfo,
    ExperimentAnswer,
} from './types';

export { LEARNING_STEPS } from './types';

// Hooks
export {
    useStartLearning,
    useRecordFailure,
    useHandleFailure,
    useCompleteConcept,
    useLearningSession,
} from './hooks';

// Components
export {
    StepIndicator,
    HookSection,
    DoseSection,
    ExperimentSection,
    WhySection,
    ExitChallenge,
    AdaptiveMessage,
    CelebrationScreen,
    LearningSession,
} from './components';
