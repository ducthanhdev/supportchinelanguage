export interface Flashcard {
    _id: string;
    userId: string;
    wordId: string;
    chinese: string;
    hanViet: string;
    pinyin: string;
    vietnamese: string;
    difficulty: 'easy' | 'medium' | 'hard';
    reviewCount: number;
    correctCount: number;
    lastReviewed: string;
    nextReview: string;
    isMastered: boolean;
    createdAt: string;
}

export interface FlashcardStats {
    total: number;
    mastered: number;
    easy: number;
    medium: number;
    hard: number;
    totalReviews: number;
    totalCorrect: number;
    dueForReview: number;
    accuracy: string;
} 


export interface Flashcard {
    _id: string;
    userId: string;
    wordId: string;
    chinese: string;
    hanViet: string;
    pinyin: string;
    vietnamese: string;
    difficulty: 'easy' | 'medium' | 'hard';
    reviewCount: number;
    correctCount: number;
    lastReviewed: string;
    nextReview: string;
    isMastered: boolean;
    createdAt: string;
}

export interface FlashcardStats {
    total: number;
    mastered: number;
    easy: number;
    medium: number;
    hard: number;
    totalReviews: number;
    totalCorrect: number;
    dueForReview: number;
    accuracy: string;
}