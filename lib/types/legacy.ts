export type QuestionType = "msq" | "true_false" | "fill_blank";
export type QuestionTier = "MEMORIZATION" | "GENERAL" | "DIAGNOSTIC" | "NUMBERS_STATISTICS";

export interface Topic {
    topic: string; // The backend returns list of strings, but we might wrap it if needed. 
    // Actually backend returns { "topics": ["..."] }
}

export interface QuestionCounts {
    msq: number;
    true_false: number;
    fill_blank: number;
}

export interface GenerationRequest {
    subject: string;
    grade: number;
    topics: string[];
    counts: QuestionCounts;
    question_type?: QuestionType; // Often ignored if counts has all types, but good to have
}

export interface JobResponse {
    job_id: string;
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
    message: string;
}

export interface JobStatus {
    job_id: string;
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
    progress?: string;
    created_at: number;
    result?: Question[];
    error?: string | null;
}

export interface Question {
    type: QuestionType;
    question_text: string;
    question_tier: QuestionTier;
    explanation: {
        correct_answer?: string; // Standard
        why_correct?: string; // Standard
        correct?: string | null;  // T/F specific
        why_false?: string; // T/F specific
        why_others_wrong?: Record<string, string>; // For MSQ
    };
    // Specific fields based on type
    statement?: string; // T/F often uses this instead of question_text
    options?: { id: string; text: string; is_correct?: boolean }[]; // Changed to array to match JSON
    correct_answer?: string | boolean; // "a" or true/false
    correct_option_id?: string; // For MSQ sometimes this is distinct
    accepted_answers?: string[]; // For fill_blank
}

export interface TopicResponse {
    topics: string[];
}

// Feedback Types
export type FeedbackCategory =
    | "wrong_answer"
    | "unclear_question"
    | "wrong_explanation"
    | "technical_issue"
    | "other";

export interface QuestionFeedback {
    question: Question;
    category: FeedbackCategory;
    comment?: string;
    timestamp: number;
    metadata?: {
        subject?: string;
        grade?: number;
        userAnswered?: boolean;
        userAnswer?: string | boolean;
    };
}

// General Feedback Types (for app-wide suggestions/issues)
export type GeneralFeedbackType =
    | "suggestion"
    | "improvement"
    | "bug_report"
    | "feature_request"
    | "other";

export interface GeneralFeedback {
    type: GeneralFeedbackType;
    message: string;
    page?: string;
    timestamp: number;
    metadata?: Record<string, any>;
}
