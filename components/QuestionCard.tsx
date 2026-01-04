"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Eye, EyeOff, CheckCircle2, HelpCircle } from "lucide-react";
import { Question, QuestionTier } from "@/lib/types";
import { clsx } from "clsx";
import { ArabicTextNormalizer } from "@/lib/arabicNormalizer";

interface QuestionCardProps {
    question: Question;
    index: number;
}

const tierColors: Record<QuestionTier, string> = {
    MEMORIZATION: "bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-900/40 dark:text-blue-100 dark:border-blue-700",
    GENERAL: "bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-100 dark:border-emerald-700",
    DIAGNOSTIC: "bg-rose-100 text-rose-900 border-rose-200 dark:bg-rose-900/40 dark:text-rose-100 dark:border-rose-700",
    NUMBERS_STATISTICS: "bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-900/40 dark:text-purple-100 dark:border-purple-700",
};

const tierArabicNames: Record<QuestionTier, string> = {
    MEMORIZATION: "حفظ وتذكر",
    GENERAL: "عام / شامل",
    DIAGNOSTIC: "تشخيصي",
    NUMBERS_STATISTICS: "أرقام وإحصائيات",
};

export default function QuestionCard({ question, index, onAnswer }: QuestionCardProps & { onAnswer: (isCorrect: boolean) => void }) {
    const [showAnswer, setShowAnswer] = useState(false);
    const [expandedExplanation, setExpandedExplanation] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | boolean | null>(null);
    const [typedAnswer, setTypedAnswer] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Helper for robust text comparison
    const normalizeText = (text: string | number | boolean | null | undefined): string => {
        if (text === null || text === undefined) return "";
        let str = String(text).trim().toLowerCase();

        // Remove trailing punctuation (dots, etc)
        str = str.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ");

        // Arabic Normalization
        str = str.replace(/[أإآ]/g, "ا"); // Normalize Alef
        str = str.replace(/ة/g, "ه");     // Normalize Taa Marbuta
        str = str.replace(/ى/g, "ي");     // Normalize Ya

        return str.trim();
    };

    const handleSelectOption = (value: string | boolean | "True" | "False") => {
        if (isSubmitted) return;

        let finalValue: string | boolean = value;
        if (value === "True") finalValue = true;
        if (value === "False") finalValue = false;

        setSelectedOption(value);
        setIsSubmitted(true);
        setShowAnswer(true);

        let isCorrect = false;

        if (question.type === "true_false") {
            const boolValue = value === "True";
            isCorrect = boolValue === question.correct_answer;
        } else if (question.type === "msq") {
            // Robust Comparison Logic
            const correctOptionId = question.correct_option_id || question.correct_answer;
            const correctNorm = normalizeText(correctOptionId);

            if (Array.isArray(question.options)) {
                const selectedOpt = question.options.find(o => o.id === value);
                const selectedText = selectedOpt?.text || "";

                // Check 1: Is explicitly marked correct?
                // Check 2: ID matches correct ID/Answer
                // Check 3: Text matches correct Answer (Normalized)
                isCorrect = (selectedOpt?.is_correct === true) ||
                    (normalizeText(value) === correctNorm) ||
                    (normalizeText(selectedText) === correctNorm);
            } else {
                // Fallback for object map
                // Fetch text for the selected Key
                // @ts-ignore
                const selectedVal = question.options[value];
                const selectedText = typeof selectedVal === 'object' ? selectedVal.text : selectedVal;

                isCorrect = (normalizeText(value) === correctNorm) ||
                    (normalizeText(selectedText) === correctNorm);
            }
        }

        onAnswer(isCorrect);
    };

    const handleFillBlankSubmit = () => {
        if (isSubmitted || !typedAnswer.trim()) return;

        setIsSubmitted(true);
        setShowAnswer(true);
        setSelectedOption(typedAnswer);

        // Use robust Arabic normalization for fill-blank validation
        const isCorrect = ArabicTextNormalizer.isAnswerCorrect(
            typedAnswer,
            question.accepted_answers || []
        );

        onAnswer(isCorrect);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            dir="rtl"
        >
            {/* Header */}
            <div className="p-4 border-b bg-muted/20 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}
                    </span>
                    <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-bold border", tierColors[question.question_tier])}>
                        {tierArabicNames[question.question_tier]}
                    </span>
                </div>
                {/* Optional: Status Indicator */}
                {isSubmitted && (
                    <div className={clsx("text-sm font-bold flex items-center gap-2",
                        // Logic to determine color based on correctness needs to replicate handleSelect logic or use state?
                        // Let's just use the visual feedback in options for now.
                        "text-muted-foreground"
                    )}>
                        {/* We could pass isCorrect to state to show "Correct!" header here too */}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                <h3 className="text-lg font-bold font-heading leading-relaxed text-foreground">
                    {question.question_text || question.statement}
                </h3>

                {/* Options / Inputs */}
                <div className="space-y-3">
                    {question.type === "msq" && question.options && (
                        <div className="grid gap-3">
                            {Array.isArray(question.options) ? (
                                // ARRAY HANDLING (New Format: [{id: "A", text: "..."}, ...])
                                question.options.map((option) => {
                                    const key = option.id; // Use ID as key ("A", "B", "C")
                                    const correct = question.correct_option_id || question.correct_answer;
                                    const correctNorm = normalizeText(correct);

                                    const optionText = option.text;
                                    const optionTextNorm = normalizeText(optionText);

                                    // Valid if Key matches OR Text matches
                                    const isThisCorrect = (normalizeText(key) === correctNorm) || (optionTextNorm === correctNorm);
                                    const isSelected = selectedOption === key;
                                    const showStatus = isSubmitted;

                                    let statusClass = "bg-card hover:bg-muted/30";
                                    if (showStatus) {
                                        if (isThisCorrect) statusClass = "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800";
                                        else if (isSelected) statusClass = "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800";
                                        else statusClass = "opacity-50";
                                    }

                                    return (
                                        <button
                                            key={key}
                                            onClick={() => handleSelectOption(key)}
                                            disabled={isSubmitted}
                                            className={clsx(
                                                "w-full text-right p-3 rounded-lg border flex items-center gap-3 transition-all",
                                                statusClass,
                                                isSelected && "ring-2 ring-primary ring-offset-2"
                                            )}
                                        >
                                            <div className={clsx(
                                                "w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium shrink-0 transition-colors",
                                                showStatus && isThisCorrect
                                                    ? "bg-green-500 border-green-500 text-white"
                                                    : showStatus && isSelected && !isThisCorrect
                                                        ? "bg-red-500 border-red-500 text-white"
                                                        : "border-muted-foreground/30 text-muted-foreground"
                                            )}>
                                                {key.toUpperCase()}
                                            </div>
                                            <span className={clsx("text-sm", showStatus && isThisCorrect && "font-medium text-green-900 dark:text-green-100")}>
                                                {optionText}
                                            </span>
                                            {showStatus && isThisCorrect && <CheckCircle2 size={16} className="text-green-500 mr-auto" />}
                                        </button>
                                    );
                                })
                            ) : (
                                // OBJECT HANDLING (Legacy Format: {"A": "Text", ...})
                                Object.entries(question.options).map(([key, value]) => {
                                    const correct = question.correct_option_id || question.correct_answer;
                                    const correctNorm = normalizeText(correct);

                                    const optionText = typeof value === 'object' && value !== null ? (value as any).text : value;
                                    const optionTextNorm = normalizeText(optionText);

                                    const isThisCorrect = (normalizeText(key) === correctNorm) || (optionTextNorm === correctNorm);
                                    const isSelected = selectedOption === key;
                                    const showStatus = isSubmitted;

                                    let statusClass = "bg-card hover:bg-muted/30";
                                    if (showStatus) {
                                        if (isThisCorrect) statusClass = "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800";
                                        else if (isSelected) statusClass = "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800";
                                        else statusClass = "opacity-50";
                                    }

                                    return (
                                        <button
                                            key={key}
                                            onClick={() => handleSelectOption(key)}
                                            disabled={isSubmitted}
                                            className={clsx(
                                                "w-full text-right p-3 rounded-lg border flex items-center gap-3 transition-all",
                                                statusClass,
                                                isSelected && "ring-2 ring-primary ring-offset-2"
                                            )}
                                        >
                                            <div className={clsx(
                                                "w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium shrink-0 transition-colors",
                                                showStatus && isThisCorrect
                                                    ? "bg-green-500 border-green-500 text-white"
                                                    : showStatus && isSelected && !isThisCorrect
                                                        ? "bg-red-500 border-red-500 text-white"
                                                        : "border-muted-foreground/30 text-muted-foreground"
                                            )}>
                                                {key.toUpperCase()}
                                            </div>
                                            <span className={clsx("text-sm", showStatus && isThisCorrect && "font-medium text-green-900 dark:text-green-100")}>
                                                {optionText}
                                            </span>
                                            {showStatus && isThisCorrect && <CheckCircle2 size={16} className="text-green-500 mr-auto" />}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {question.type === "true_false" && (
                        <div className="flex gap-4">
                            {["True", "False"].map((opt) => {
                                const isTrue = opt === "True";
                                // Logic: Render buttons.
                                // Correct answer check:
                                const isThisCorrect = (isTrue && question.correct_answer === true) || (!isTrue && question.correct_answer === false);
                                const isSelected = selectedOption === opt;
                                const showStatus = isSubmitted;

                                let statusClass = "hover:bg-muted/30";
                                if (showStatus) {
                                    if (isThisCorrect) statusClass = "bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-100";
                                    else if (isSelected) statusClass = "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300";
                                    else statusClass = "opacity-50";
                                }

                                return (
                                    <button
                                        key={opt}
                                        onClick={() => handleSelectOption(opt)}
                                        disabled={isSubmitted}
                                        className={clsx(
                                            "flex-1 p-4 rounded-lg border text-center font-medium cursor-pointer transition-all",
                                            statusClass,
                                            isSelected && !isThisCorrect && "ring-2 ring-red-200"
                                        )}
                                    >
                                        {isTrue ? "صحيح" : "خاطئ"}
                                        {showStatus && isThisCorrect && <CheckCircle2 size={16} className="inline-block mr-2 text-green-500" />}
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {question.type === "fill_blank" && (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={typedAnswer}
                                    onChange={(e) => setTypedAnswer(e.target.value)}
                                    disabled={isSubmitted}
                                    placeholder="اكتب إجابتك هنا..."
                                    className="flex-1 p-3 rounded-md border bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                                <button
                                    onClick={handleFillBlankSubmit}
                                    disabled={isSubmitted || !typedAnswer}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                                >
                                    تحقق
                                </button>
                            </div>

                            {isSubmitted && (
                                <div className="p-4 bg-muted/10 rounded-lg border border-dashed border-muted-foreground/30">
                                    <p className="text-sm text-muted-foreground mb-2">الإجابة الصحيحة:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {question.accepted_answers?.map((ans, i) => (
                                            <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm dark:bg-green-900/30 dark:text-green-300">
                                                {ans}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Explanation */}
                <AnimatePresence>
                    {showAnswer && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 mt-4 border-t space-y-3">
                                <h4 className="font-semibold text-sm flex items-center gap-2 text-primary">
                                    <HelpCircle size={16} />
                                    التفسير
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {/* Explanation Text */}
                                    {question.type === "fill_blank" ? (
                                        <span className="block">
                                            {/* For fill-blank, explanation can be a string or object */}
                                            {typeof question.explanation === 'string'
                                                ? question.explanation
                                                : (question.explanation?.correct || question.explanation?.why_correct || "")}
                                        </span>
                                    ) : question.type === "true_false" ? (
                                        <span className="block mb-2">
                                            {/* For T/F, backend gives 'correct' (truth) and 'why_false' (misconception) */}
                                            {/* We should show the relevant info based on the correct answer */}
                                            {question.explanation.correct && <span className="block text-green-700 dark:text-green-300 mb-1">{question.explanation.correct}</span>}
                                            {question.explanation.why_false && <span className="block text-muted-foreground">{question.explanation.why_false}</span>}
                                        </span>
                                    ) : (
                                        <>
                                            {question.explanation.correct_answer ? (
                                                <div className="mb-2">
                                                    <span className="font-bold text-green-600 ml-1">✓ الإجابة الصحيحة:</span>
                                                    {question.explanation.correct_answer}
                                                </div>
                                            ) : (
                                                <div className="mb-2">
                                                    <span className="font-bold text-green-600 ml-1">✓ الإجابة الصحيحة:</span>
                                                    {(() => {
                                                        const correctId = question.correct_option_id || question.correct_answer;
                                                        if (Array.isArray(question.options)) {
                                                            return question.options.find(o => o.id === correctId)?.text || String(correctId);
                                                        }
                                                        // @ts-ignore
                                                        return question.options?.[correctId]?.text || question.options?.[correctId] || String(correctId);
                                                    })()}
                                                </div>
                                            )}

                                            {question.explanation.why_correct && (
                                                <div className="text-muted-foreground bg-green-50 dark:bg-green-900/10 p-2 rounded border border-green-100 dark:border-green-900">
                                                    {question.explanation.why_correct}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </p>

                                {(question.explanation.why_others_wrong || question.options) && (
                                    <div className="mt-2">
                                        <button
                                            onClick={() => setExpandedExplanation(!expandedExplanation)}
                                            className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {expandedExplanation ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            {expandedExplanation ? "إخفاء تفاصيل الخيارات" : "لماذا الخيارات الأخرى خاطئة؟"}
                                        </button>

                                        {expandedExplanation && question.explanation.why_others_wrong && (
                                            <div className="mt-2 space-y-2 pl-4 border-r-2 border-muted">
                                                {Object.entries(question.explanation.why_others_wrong).map(([key, reason]) => (
                                                    <div key={key} className="text-xs">
                                                        <span className="font-bold text-red-500/80 mr-1">{key.toUpperCase()}:</span>
                                                        <span className="text-muted-foreground">{reason}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
