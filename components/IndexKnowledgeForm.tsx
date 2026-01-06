"use client";

import { useState, useEffect } from "react";
import { indexKnowledge, pollJobStatusClient, KnowledgeIndexingRequest, fetchIndexingMetadata } from "@/lib/api";
import { Select } from "@/components/ui";
import { GraduationCap, BookOpen, FileText } from "lucide-react";
import { getGradeDisplayName } from "@/lib/gradeUtils";

interface IndexKnowledgeFormProps {
    apiKey: string;
}

export default function IndexKnowledgeForm({ apiKey }: IndexKnowledgeFormProps) {
    const [subject, setSubject] = useState("");
    const [grade, setGrade] = useState<number>(10);
    const [topic, setTopic] = useState("");
    const [rawText, setRawText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [jobStatus, setJobStatus] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    // Metadata state
    const [grades, setGrades] = useState<number[]>([]);
    const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
    const [isLoadingMeta, setIsLoadingMeta] = useState(true);

    // Load metadata on mount
    useEffect(() => {
        async function loadMetadata() {
            try {
                const meta = await fetchIndexingMetadata();
                setGrades(meta.grades || []);

                // Set default grade if available
                if (meta.grades && meta.grades.length > 0) {
                    const defaultGrade = meta.grades[0];
                    setGrade(defaultGrade);
                    setSubjects(meta.subjects[defaultGrade] || []);
                }
            } catch (err) {
                console.error("Failed to load metadata:", err);
                setError("فشل تحميل البيانات");
            } finally {
                setIsLoadingMeta(false);
            }
        }
        loadMetadata();
    }, []);

    // Update subjects when grade changes
    const handleGradeChange = async (newGrade: number) => {
        setGrade(newGrade);
        setSubject(""); // Reset subject selection

        try {
            const meta = await fetchIndexingMetadata();
            setSubjects(meta.subjects[newGrade] || []);
        } catch (err) {
            console.error("Failed to update subjects:", err);
        }
    };

    // Poll job status
    useEffect(() => {
        if (!jobId) return;

        const interval = setInterval(async () => {
            try {
                const status = await pollJobStatusClient(jobId, apiKey);
                setJobStatus(status.status);

                if (status.status === "COMPLETED") {
                    clearInterval(interval);

                    // Format success message with score report
                    const result: any = status.result; // Use any to bypass TypeScript checking
                    console.log("Indexing result:", result);

                    if (result && result.score_report) {
                        const scores = result.score_report.scores;
                        const stats = result.stats;

                        const successMessage = `✅ تم فهرسة المحتوى بنجاح!

📊 تقييم الجودة:
• الأمانة (Faithfulness): ${scores.faithfulness}/30
• التغطية (Coverage): ${scores.coverage}/20
• البنية (Structure): ${scores.structure}/20
• جاهزية التقييم: ${scores.assessment_readiness}/20
• الوضوح (Clarity): ${scores.clarity}/10
━━━━━━━━━━━━━━━━━━━
📈 المجموع الكلي: ${result.score_report.total_score}/100

📚 إحصائيات التخزين:
• عدد الأجزاء المفهرسة: ${stats.total_chunks}
• المفاهيم الفريدة: ${stats.unique_concepts}
• عدد التضمينات: ${result.embedding_count}`;

                        setSuccess(successMessage);
                    } else {
                        console.warn("No score_report found in result:", result);
                        setSuccess(`تم فهرسة المحتوى بنجاح!`);
                    }

                    setIsSubmitting(false);
                    setJobId(null); // Clear jobId immediately to stop polling
                    setJobStatus(""); // Clear status

                    // Reset form after delay to let user see the results
                    setTimeout(() => {
                        setTopic("");
                        setRawText("");
                        setSuccess("");
                    }, 10000);
                } else if (status.status === "FAILED") {
                    clearInterval(interval);
                    setError(`فشلت العملية: ${status.error || "خطأ غير معروف"}`);
                    setIsSubmitting(false);
                    setJobId(null); // Clear jobId immediately
                    setJobStatus(""); // Clear status
                }
            } catch (err) {
                console.error("Error polling job status:", err);
            }
        }, 2000); // Poll every 2 seconds

        return () => clearInterval(interval);
    }, [jobId, apiKey]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsSubmitting(true);

        // Validation
        if (!subject || !topic || !rawText) {
            setError("يرجى ملء جميع الحقول المطلوبة");
            setIsSubmitting(false);
            return;
        }

        if (rawText.length < 100) {
            setError("النص يجب أن يكون على الأقل 100 حرف");
            setIsSubmitting(false);
            return;
        }

        try {
            const payload: KnowledgeIndexingRequest = {
                subject,
                grade,
                topic,
                raw_text: rawText,
            };

            const response = await indexKnowledge(payload, apiKey);
            setJobId(response.job_id);
            setJobStatus(response.status);
            setSuccess(`تم إرسال الطلب بنجاح! معرّف المهمة: ${response.job_id}`);
        } catch (err: any) {
            setError(err.message || "حدث خطأ أثناء إرسال الطلب");
            setIsSubmitting(false);
        }
    };

    if (isLoadingMeta) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">فهرسة محتوى جديد</h2>

                {/* Grade Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                        <GraduationCap size={18} />
                        الصف الدراسي
                    </label>
                    <Select
                        value={String(grade)}
                        onChange={(e) => handleGradeChange(Number(e.target.value))}
                        options={grades.map(g => ({ value: String(g), label: getGradeDisplayName(g) }))}
                        placeholder="اختر الصف"
                        disabled={isSubmitting}
                        fullWidth
                    />
                </div>

                {/* Subject Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                        <BookOpen size={18} />
                        المادة
                    </label>
                    <Select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        options={subjects.map(s => ({ value: s.id, label: s.name }))}
                        placeholder="اختر المادة"
                        disabled={isSubmitting}
                        fullWidth
                    />
                </div>

                {/* Topic Input */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                        عنوان الدرس
                    </label>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="مثال: صلح الحديبية"
                        required
                        disabled={isSubmitting}
                        maxLength={200}
                    />
                </div>

                {/* Raw Text Input */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                        النص الكامل للمحتوى
                    </label>
                    <textarea
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[300px] font-mono text-sm"
                        placeholder="الصق النص الكامل للدرس هنا... (على الأقل 100 حرف)"
                        required
                        disabled={isSubmitting}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        عدد الأحرف: {rawText.length} {rawText.length < 100 && "(الحد الأدنى: 100)"}
                    </p>
                </div>

                {/* Job Status Display */}
                {jobStatus && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-semibold text-blue-800">
                            حالة المهمة: {jobStatus}
                        </p>
                        {jobStatus === "RUNNING" && (
                            <div className="mt-2">
                                <div className="animate-pulse flex space-x-2">
                                    <div className="h-2 bg-blue-600 rounded w-1/4"></div>
                                    <div className="h-2 bg-blue-400 rounded w-1/4"></div>
                                    <div className="h-2 bg-blue-300 rounded w-1/4"></div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700 whitespace-pre-wrap">{success}</p>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || !subject || !topic || rawText.length < 100}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span className="mr-2">جاري المعالجة...</span>
                        </>
                    ) : (
                        <span>فهرسة المحتوى</span>
                    )}
                </button>
            </div>
        </form>
    );
}
