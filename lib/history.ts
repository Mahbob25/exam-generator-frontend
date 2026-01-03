
export interface ExamResult {
    id: string;
    date: string; // ISO string
    subject: string; // e.g., 'seerah'
    subjectName: string; // Arabic name e.g., 'السيرة النبوية'
    grade: number;
    score: number;
    total: number;
    percentage: number;
}

const STORAGE_KEY = "exam_history";

export const saveExamResult = (result: Omit<ExamResult, "id" | "date">) => {
    try {
        const history = getExamHistory();
        const newResult: ExamResult = {
            ...result,
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
        };
        const updatedHistory = [newResult, ...history];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
        return newResult;
    } catch (error) {
        console.error("Failed to save exam result:", error);
        return null;
    }
};

export const getExamHistory = (): ExamResult[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored);
    } catch (error) {
        console.error("Failed to load exam history:", error);
        return [];
    }
};

export const clearHistory = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error("Failed to clear history:", error);
    }
};
