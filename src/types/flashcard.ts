export interface Flashcard {
  _id: string;
  userId: string;
  wordId: string;
  chinese: string;
  hanViet: string;
  pinyin: string;
  vietnamese: string;
  repetition: number;
  easinessFactor: number;
  interval: number;
  dueDate: string;
}

export interface FlashcardStats {
  total: number;
  dueForReview: number;
  learning: number;
  mature: number;
}