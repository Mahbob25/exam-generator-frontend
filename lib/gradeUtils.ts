/**
 * Translates grade numbers to Arabic grade names
 */
export function getGradeDisplayName(grade: number): string {
    const gradeNames: Record<number, string> = {
        1: "الصف الأول الابتدائي",
        2: "الصف الثاني الابتدائي",
        3: "الصف الثالث الابتدائي",
        4: "الصف الرابع الابتدائي",
        5: "الصف الخامس الابتدائي",
        6: "الصف السادس الابتدائي",
        7: "الصف السابع إعدادي",
        8: "الصف الثامن إعدادي",
        9: "الصف التاسع إعدادي",
        10: "الصف الأول الثانوي",
        11: "الصف الثاني الثانوي",
        12: "الصف الثالث الثانوي",
    };

    return gradeNames[grade] || `الصف ${grade}`;
}
