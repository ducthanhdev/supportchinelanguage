import apiClient from "./apiClient";
import { FlashcardStats } from "../types/flashcard";

// Lấy flashcards cần review
export const getFlashcardsForReview = (limit: number = 10) => {
  return apiClient.get(`/api/flashcards/review?limit=${limit}`);
};

// Lấy thống kê flashcards
export const getFlashcardStats = () => {
  return apiClient.get<FlashcardStats>("/api/flashcards/stats");
};

// Tạo flashcards từ tất cả words
export const createFlashcardsFromWords = () => {
  return apiClient.post("/api/flashcards/create-from-words");
};

/**
 * Cập nhật kết quả của một lần review bằng thuật toán SM-2.
 * @param flashcardId ID của thẻ flashcard
 * @param quality Điểm chất lượng người dùng tự đánh giá (0-5)
 */
export const reviewFlashcard = (flashcardId: string, quality: number) => {
  return apiClient.post(`/api/flashcards/${flashcardId}/review`, { quality });
};
