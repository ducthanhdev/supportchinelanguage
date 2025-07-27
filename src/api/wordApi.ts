import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper function để lấy token từ localStorage
const getAuthToken = () => localStorage.getItem('token');

// Helper function để tạo headers với token
const getAuthHeaders = () => ({
    Authorization: `Bearer ${getAuthToken()}`
});

export const getWords = (page: number, pageSize: number) =>
    axios.get(`${API_URL}/api/words?page=${page}&pageSize=${pageSize}`, {
        headers: getAuthHeaders()
    });

export const addWord = (chinese: string) =>
    axios.post(`${API_URL}/api/words`, { chinese }, {
        headers: getAuthHeaders()
    });

export const updateWord = (id: string | number, data: any) =>
    axios.put(`${API_URL}/api/words/${id}`, data, {
        headers: getAuthHeaders()
    });

export const deleteWord = (id: string | number) =>
    axios.delete(`${API_URL}/api/words/${id}`, {
        headers: getAuthHeaders()
    });

export const getExamples = (words: string[]) =>
    axios.post(`${API_URL}/api/example`, { words }, {
        headers: getAuthHeaders()
    });

export const updateHanViet = (chinese: string, hanviet: string) =>
    axios.put(`${API_URL}/api/hanviet`, { char: chinese, hanviet }, {
        headers: getAuthHeaders()
    });

// Translate APIs
export const translateToVietnamese = (text: string) =>
    axios.post(`${API_URL}/api/translate/single`, { text }, {
        headers: getAuthHeaders()
    });

export const translateBatch = (words: string[]) =>
    axios.post(`${API_URL}/api/translate/batch`, { words }, {
        headers: getAuthHeaders()
    }); 