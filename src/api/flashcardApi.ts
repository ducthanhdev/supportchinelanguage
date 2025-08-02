import apiClient from './apiClient';
import { Flashcard, FlashcardStats } from '../types/flashcard';

// Tạo flashcard từ word
export const createFlashcard = (wordId: string) =>
    apiClient.post<Flashcard>('/api/flashcards/create', { wordId });

// Lấy flashcards cần review
export const getFlashcardsForReview = (limit = 10, difficulty?: string) => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (difficulty) params.append('difficulty', difficulty);

    return apiClient.get<Flashcard[]>(`/api/flashcards/review?${params}`);
};

// Cập nhật kết quả review
export const updateReviewResult = (flashcardId: string, isCorrect: boolean) =>
    apiClient.put('/api/flashcards/review', { flashcardId, isCorrect });

// Lấy thống kê flashcards
export const getFlashcardStats = () =>
    apiClient.get<FlashcardStats>('/api/flashcards/stats');

// Tạo flashcards từ tất cả words
export const createFlashcardsFromWords = () =>
    apiClient.post('/api/flashcards/create-from-words', {});

