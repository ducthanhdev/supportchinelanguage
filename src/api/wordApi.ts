import apiClient from './apiClient';

export const getWords = (page: number, pageSize: number) =>
    apiClient.get(`/api/words?page=${page}&pageSize=${pageSize}`);

export const addWord = (chinese: string) =>
    apiClient.post('/api/words', { chinese });

export const updateWord = (id: string | number, data: any) =>
    apiClient.put(`/api/words/${id}`, data);

export const deleteWord = (id: string | number) =>
    apiClient.delete(`/api/words/${id}`);

export const getExamples = (words: string[]) =>
    apiClient.post('/api/example', { words });

export const updateHanViet = (chinese: string, hanviet: string) =>
    apiClient.put('/api/hanviet', { char: chinese, hanviet });

// Translate APIs
export const translateToVietnamese = (text: string) =>
    apiClient.post('/api/translate/single', { text });

export const translateBatch = (words: string[]) =>
    apiClient.post('/api/translate/batch', { words });
