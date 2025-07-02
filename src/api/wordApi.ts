import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const getWords = (page: number, pageSize: number) =>
    axios.get(`${API_URL}/api/words?page=${page}&pageSize=${pageSize}`);

export const addWord = (chinese: string) =>
    axios.post(`${API_URL}/api/words`, { chinese });

export const updateWord = (id: string | number, data: any) =>
    axios.put(`${API_URL}/api/words/${id}`, data);

export const deleteWord = (id: string | number) =>
    axios.delete(`${API_URL}/api/words/${id}`);

export const getExamples = (words: string[]) =>
    axios.post(`${API_URL}/api/example`, { words });

export const updateHanViet = (chinese: string, hanviet: string) =>
    axios.put(`${API_URL}/api/hanviet`, { char: chinese, hanviet }); 