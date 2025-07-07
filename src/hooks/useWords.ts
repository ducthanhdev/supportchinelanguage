import { useEffect, useState } from 'react';
import { addWord, deleteWord, getWords, updateWord } from '../api/wordApi';
import { WordRow } from '../types/word';

export function useWords() {
    const [data, setData] = useState<WordRow[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchWords();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize]);

    const fetchWords = async () => {
        setLoading(true);
        try {
            const res = await getWords(page, pageSize);
            const dataRes = res.data as any;
            const words = (dataRes.words || dataRes).map((item: any) => ({
                ...item,
                key: item._id || item.key,
            }));
            setData(words);
            setTotal(dataRes.total || words.length);
        } catch (e) {
            // Có thể xử lý lỗi ở đây nếu muốn
        }
        setLoading(false);
    };

    const add = async (chinese: string) => {
        setLoading(true);
        try {
            const res = await addWord(chinese);
            const word = res.data as any;
            setData(prev => [...prev, { ...word, key: word._id || word.key }]);
            setTotal(prev => prev + 1);
            return true;
        } catch (e) {
            return false;
        } finally {
            setLoading(false);
        }
    };

    const update = async (id: string | number, dataUpdate: any) => {
        setLoading(true);
        try {
            const res = await updateWord(id, dataUpdate);
            const updated = res.data as Partial<WordRow>;
            setData(prev => prev.map(row => row.key === id ? { ...row, ...updated, key: row.key } : row));
            return true;
        } catch (e) {
            return false;
        } finally {
            setLoading(false);
        }
    };

    const remove = async (id: string | number) => {
        setLoading(true);
        try {
            await deleteWord(id);
            setData(prev => prev.filter(item => item.key !== id));
            setTotal(prev => prev - 1);
            return true;
        } catch (e) {
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        total,
        page,
        setPage,
        pageSize,
        setPageSize,
        loading,
        fetchWords,
        add,
        update,
        remove,
    };
} 