import axios from 'axios';

const API_URL = 'http://localhost:5000';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

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

// Tạo flashcard từ word
export const createFlashcard = (wordId: string) =>
    axios.post(`${API_URL}/api/flashcards/create`, { wordId }, {
        headers: getAuthHeaders()
    });

// Lấy flashcards cần review
export const getFlashcardsForReview = (limit = 10, difficulty?: string) => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (difficulty) params.append('difficulty', difficulty);

    return axios.get(`${API_URL}/api/flashcards/review?${params}`, {
        headers: getAuthHeaders()
    });
};

// Cập nhật kết quả review
export const updateReviewResult = (flashcardId: string, isCorrect: boolean) =>
    axios.put(`${API_URL}/api/flashcards/review`, { flashcardId, isCorrect }, {
        headers: getAuthHeaders()
    });

// Lấy thống kê flashcards
export const getFlashcardStats = () =>
    axios.get(`${API_URL}/api/flashcards/stats`, {
        headers: getAuthHeaders()
    });

// Tạo flashcards từ tất cả words
export const createFlashcardsFromWords = () =>
    axios.post(`${API_URL}/api/flashcards/create-from-words`, {}, {
        headers: getAuthHeaders()
    }); 