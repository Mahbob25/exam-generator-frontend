'use client';

import React, { useEffect, useState } from 'react';
import { useLearningStore } from '@/lib/store';
import { Spinner } from '@/components/ui';
import { StepIndicator } from './StepIndicator';
import { HookSection } from './HookSection';
import { DoseSection } from './DoseSection';
import { ExperimentSection } from './ExperimentSection';
import { WhySection } from './WhySection';
import { ExitChallenge } from './ExitChallenge';
import { AdaptiveMessage } from './AdaptiveMessage';
import { CelebrationScreen } from './CelebrationScreen';
import type { LearningSession as LearningSessionType, LearningStep } from '../types';
import styles from './LearningSession.module.css';

interface LearningSessionProps {
    session: LearningSessionType;
    onComplete: (result: { total_xp: number; bonus_xp: number }) => void;
    onRecordFailure: (step: LearningStep) => void;
    onRefreshSession: () => void;
}

/**
 * LearningSession Component
 * 
 * Main orchestrator that manages the 5-stage learning flow.
 */
export function LearningSession({
    session,
    onComplete,
    onRecordFailure,
    onRefreshSession,
}: LearningSessionProps) {
    const { currentStep, nextStep, previousStep, setCurrentStep } = useLearningStore();
    const [showAdaptive, setShowAdaptive] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [completionResult, setCompletionResult] = useState<{ total_xp: number; bonus_xp: number } | null>(null);

    const { flow, progress, adaptive } = session;

    // Get current hook from adaptive recommendation
    const currentHook = adaptive.current_hook || flow.hooks[0];

    const handleHookContinue = () => {
        nextStep();
    };

    const handleDoseContinue = () => {
        nextStep();
    };

    const handleExperimentCorrect = () => {
        nextStep();
    };

    const handleExperimentIncorrect = () => {
        onRecordFailure('experiment');
        setShowAdaptive(true);
    };

    const handleAdaptiveContinue = () => {
        setShowAdaptive(false);
        // After showing adaptive content, go back to experiment
        setCurrentStep('experiment');
        onRefreshSession();
    };

    const handleWhyContinue = () => {
        nextStep();
    };

    const handleExitComplete = () => {
        // This will trigger the complete API call
        setIsCompleted(true);
        setCompletionResult({
            total_xp: flow.reward.xp,
            bonus_xp: progress.failed_attempts > 0 ? 5 : 0, // Bonus for resilience
        });
        onComplete({
            total_xp: flow.reward.xp,
            bonus_xp: progress.failed_attempts > 0 ? 5 : 0,
        });
    };

    const handleCelebrationContinue = () => {
        // Navigate back to lesson page
        window.history.back();
    };

    // Show adaptive message after failure
    if (showAdaptive && flow.adaptive_explain) {
        return (
            <div className={styles.container}>
                <AdaptiveMessage
                    adaptive={flow.adaptive_explain}
                    failedAttempts={progress.failed_attempts + 1}
                    onContinue={handleAdaptiveContinue}
                />
            </div>
        );
    }

    // Show celebration on completion
    if (isCompleted && completionResult) {
        return (
            <CelebrationScreen
                reward={flow.reward}
                bonusXp={completionResult.bonus_xp}
                conceptTitle={flow.concept_id}
                onContinue={handleCelebrationContinue}
            />
        );
    }

    // Render current step
    const renderStep = () => {
        switch (currentStep) {
            case 'hook':
                return (
                    <HookSection
                        hook={currentHook}
                        onContinue={handleHookContinue}
                    />
                );
            case 'dose':
                return (
                    <DoseSection
                        dose={flow.dose}
                        storyContext={flow.story_context}
                        onContinue={handleDoseContinue}
                    />
                );
            case 'experiment':
                return (
                    <ExperimentSection
                        experiment={flow.experiment}
                        onCorrect={handleExperimentCorrect}
                        onIncorrect={handleExperimentIncorrect}
                    />
                );
            case 'why':
                return (
                    <WhySection
                        why={flow.why}
                        onContinue={handleWhyContinue}
                    />
                );
            case 'exit_challenge':
                return (
                    <ExitChallenge
                        challenge={flow.exit_challenge}
                        onComplete={handleExitComplete}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>
            <StepIndicator
                currentStep={currentStep}
                failedAttempts={progress.failed_attempts}
            />
            <div className={styles.stepContent}>
                {renderStep()}
            </div>
        </div>
    );
}

export default LearningSession;
