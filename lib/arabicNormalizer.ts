/**
 * Arabic Text Normalization Utility
 * 
 * Provides robust text normalization for Arabic language to handle common variations.
 * This is a TypeScript mirror of the backend Python normalizer to ensure consistent
 * validation on both client and server sides.
 * 
 * IMPORTANT: Keep this in sync with backend-api/utils/arabic_text_utils.py
 */

export class ArabicTextNormalizer {
    // Unicode ranges for Arabic diacritics (tashkeel)
    private static readonly ARABIC_DIACRITICS = /[\u064B-\u0652\u0670]/g;

    // Common Arabic and Latin punctuation
    private static readonly PUNCTUATION = /[.,،؛!?؟\-_(){}[\]"']/g;

    /**
     * Normalize Arabic text for comparison.
     * 
     * @param text - Input text to normalize
     * @param strict - If true, preserve more distinctions (currently unused)
     * @returns Normalized text string
     * 
     * @example
     * ```ts
     * ArabicTextNormalizer.normalize("العُمرة") // Returns: "العمره"
     * ArabicTextNormalizer.normalize("إبراهيم") // Returns: "ابراهيم"
     * ```
     */
    static normalize(text: string, strict: boolean = false): string {
        if (!text || typeof text !== 'string') {
            return '';
        }

        let normalized = text;

        // 1. Convert to lowercase
        normalized = normalized.toLowerCase();

        // 2. Remove all Arabic diacritics (tashkeel)
        normalized = normalized.replace(this.ARABIC_DIACRITICS, '');

        // 3. Normalize Alef variations to plain Alef
        // Alef with hamza above (أ), below (إ), madda (آ) → Alef (ا)
        normalized = normalized.replace(/[أإآ]/g, 'ا');

        // 4. Normalize Taa Marbouta to Haa
        // KEY normalization: العمرة ↔ العمره
        normalized = normalized.replace(/ة/g, 'ه');

        // 5. Normalize Ya variations
        // Alef Maksura (ى) → Ya (ي)
        normalized = normalized.replace(/ى/g, 'ي');

        // 6. Normalize Hamza forms
        // Hamza on Waw (ؤ), on Ya (ئ) → plain Hamza (ء)
        normalized = normalized.replace(/[ؤئ]/g, 'ء');

        // 7. Remove punctuation
        normalized = normalized.replace(this.PUNCTUATION, '');

        // 8. Normalize whitespace - collapse multiple spaces
        normalized = normalized.replace(/\s+/g, ' ');

        // 9. Strip leading/trailing whitespace
        normalized = normalized.trim();

        return normalized;
    }

    /**
     * Check if two texts are equivalent after normalization.
     * 
     * @param text1 - First text
     * @param text2 - Second text
     * @param strict - If true, use strict comparison
     * @returns True if texts are equivalent
     * 
     * @example
     * ```ts
     * ArabicTextNormalizer.areEquivalent("العمرة", "العمره") // Returns: true
     * ArabicTextNormalizer.areEquivalent("العُمرة", "العمرة") // Returns: true
     * ```
     */
    static areEquivalent(text1: string, text2: string, strict: boolean = false): boolean {
        const norm1 = this.normalize(text1, strict);
        const norm2 = this.normalize(text2, strict);
        return norm1 === norm2;
    }

    /**
     * Check if a user's answer matches any of the accepted answers.
     * 
     * @param userAnswer - The answer provided by the user
     * @param acceptedAnswers - List of acceptable answers
     * @param strict - If true, use strict comparison
     * @returns True if user answer matches any accepted answer
     * 
     * @example
     * ```ts
     * ArabicTextNormalizer.isAnswerCorrect("العمره", ["العمرة"]) // Returns: true
     * ```
     */
    static isAnswerCorrect(
        userAnswer: string,
        acceptedAnswers: string[],
        strict: boolean = false
    ): boolean {
        if (!userAnswer || !acceptedAnswers || acceptedAnswers.length === 0) {
            return false;
        }

        const normalizedUser = this.normalize(userAnswer, strict);

        for (const accepted of acceptedAnswers) {
            const normalizedAccepted = this.normalize(accepted, strict);
            if (normalizedUser === normalizedAccepted) {
                return true;
            }
        }

        return false;
    }

    /**
     * Calculate simple similarity score between two texts.
     * 
     * @param text1 - First text
     * @param text2 - Second text
     * @returns Similarity score from 0.0 (different) to 1.0 (identical)
     */
    static getSimilarityScore(text1: string, text2: string): number {
        const norm1 = this.normalize(text1);
        const norm2 = this.normalize(text2);

        if (norm1 === norm2) {
            return 1.0;
        }

        const longer = Math.max(norm1.length, norm2.length);
        if (longer === 0) {
            return 1.0;
        }

        // Count matching characters in same positions
        let matches = 0;
        const minLength = Math.min(norm1.length, norm2.length);
        for (let i = 0; i < minLength; i++) {
            if (norm1[i] === norm2[i]) {
                matches++;
            }
        }

        return matches / longer;
    }

    /**
     * Find the closest matching accepted answer.
     * 
     * @param userAnswer - The answer provided by the user
     * @param acceptedAnswers - List of acceptable answers
     * @returns Tuple of [closest match, similarity score]
     */
    static findClosestMatch(
        userAnswer: string,
        acceptedAnswers: string[]
    ): [string, number] {
        if (!userAnswer || !acceptedAnswers || acceptedAnswers.length === 0) {
            return ['', 0.0];
        }

        let bestMatch = acceptedAnswers[0];
        let bestScore = 0.0;

        for (const accepted of acceptedAnswers) {
            const score = this.getSimilarityScore(userAnswer, accepted);
            if (score === 1.0) {
                return [accepted, 1.0];
            }
            if (score > bestScore) {
                bestScore = score;
                bestMatch = accepted;
            }
        }

        return [bestMatch, bestScore];
    }

    /**
     * Generate common acceptable variations of an Arabic text.
     * 
     * @param text - Original text
     * @returns Array of common variations including the original
     * 
     * @example
     * ```ts
     * ArabicTextNormalizer.generateCommonVariations("العمرة")
     * // Returns: ["العمرة", "العمره"]
     * ```
     */
    static generateCommonVariations(text: string): string[] {
        const variations = new Set<string>([text]);

        // Add ة ↔ ه variations
        if (text.includes('ة')) {
            variations.add(text.replace(/ة/g, 'ه'));
        }
        if (text.endsWith('ه')) {
            variations.add(text.slice(0, -1) + 'ة');
        }

        // Add alef hamza variations
        if (/[أإآ]/.test(text)) {
            const variant = text.replace(/[أإآ]/g, 'ا');
            variations.add(variant);
        }

        // Add ya variations
        if (text.includes('ى')) {
            variations.add(text.replace(/ى/g, 'ي'));
        }
        if (text.endsWith('ي')) {
            variations.add(text.slice(0, -1) + 'ى');
        }

        return Array.from(variations).sort();
    }
}

// Convenience functions for direct import
export const normalizeArabic = (text: string): string =>
    ArabicTextNormalizer.normalize(text);

export const areEquivalent = (text1: string, text2: string): boolean =>
    ArabicTextNormalizer.areEquivalent(text1, text2);

export const isCorrectAnswer = (userAnswer: string, acceptedAnswers: string[]): boolean =>
    ArabicTextNormalizer.isAnswerCorrect(userAnswer, acceptedAnswers);
