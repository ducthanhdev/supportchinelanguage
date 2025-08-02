import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getWords,
  addWord,
  updateWord,
  deleteWord,
  getExamples,
  translateToVietnamese,
  updateHanViet,
} from "../api/wordApi";
import { WordRow } from "../types/word";

// Hook này nhận vào trạng thái `isAuthenticated` để quyết định khi nào cần fetch dữ liệu
export const useWords = (isAuthenticated: boolean) => {
  // State quản lý dữ liệu từ vựng và giao diện
  const [data, setData] = useState<WordRow[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // State cho các hành động (thêm, sửa, xóa)
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // State quản lý các modal chỉnh sửa
  const [editingRow, setEditingRow] = useState<WordRow | null>(null);
  const [hanVietInput, setHanVietInput] = useState("");
  const [deleteRow, setDeleteRow] = useState<WordRow | null>(null);
  const [editingChineseRow, setEditingChineseRow] = useState<WordRow | null>(
    null
  );
  const [chineseInput, setChineseInput] = useState("");
  const [editingVietnameseRow, setEditingVietnameseRow] =
    useState<WordRow | null>(null);
  const [vietnameseInput, setVietnameseInput] = useState("");

  // State cho các tính năng phụ
  const [searchOrAdd, setSearchOrAdd] = useState("");
  const [filteredData, setFilteredData] = useState<WordRow[]>([]);
  const [examples, setExamples] = useState<{ [key: string]: string }>({});
  const [translateLoading, setTranslateLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [userChineseInputs, setUserChineseInputs] = useState<{
    [key: string]: string;
  }>({});
  const [userChineseStatus, setUserChineseStatus] = useState<{
    [key: string]: "correct" | "incorrect" | undefined;
  }>({});
  const [exampleModal, setExampleModal] = useState<{
    open: boolean;
    example: string;
  }>({ open: false, example: "" });

  // Hàm fetch dữ liệu từ vựng chính
  const fetchWords = async () => {
    if (!isAuthenticated) {
      setPageLoading(false);
      return;
    }
    setPageLoading(true);
    try {
      const res = await getWords(page, pageSize);
      const dataRes = res.data as any;
      const words = (dataRes.words || dataRes).map((item: any) => ({
        ...item,
        key: item._id || item.key,
      }));
      setData(words);
      setTotal(dataRes.total || words.length);
      setPageError(null);
    } catch (e) {
      toast.error("Không lấy được danh sách từ vựng!");
      setPageError(
        "Không thể tải dữ liệu từ máy chủ. Vui lòng làm mới lại trang."
      );
    } finally {
      setPageLoading(false);
    }
  };

  // useEffect để fetch dữ liệu khi trang thay đổi hoặc khi đăng nhập
  useEffect(() => {
    fetchWords();
  }, [isAuthenticated, page, pageSize]);

  // useEffect để lọc dữ liệu khi tìm kiếm
  useEffect(() => {
    if (!searchOrAdd) {
      setFilteredData(data);
    } else {
      setFilteredData(data.filter((row) => row.chinese.includes(searchOrAdd)));
    }
  }, [searchOrAdd, data]);

  // useEffect để lấy ví dụ cho các từ trên trang hiện tại
  useEffect(() => {
    const fetchExamples = async () => {
      const wordsOnPage = data.map((row) => row.chinese);
      if (wordsOnPage.length === 0) return setExamples({});
      try {
        const res = await getExamples(wordsOnPage);
        const examplesObj = (res.data as any).examples || {};
        const newExamples: { [key: string]: string } = {};
        for (const row of data) {
          let example = examplesObj[row.chinese] || "";
          if (example && row.chinese) {
            const re = new RegExp(row.chinese, "g");
            example = example.replace(
              re,
              `<span style='color: red; font-weight: bold;'>${row.chinese}</span>`
            );
          }
          newExamples[row.key] = example;
        }
        setExamples(newExamples);
      } catch {
        setExamples({});
      }
    };
    if (isAuthenticated) {
      fetchExamples();
    }
  }, [data, isAuthenticated]);

  // --- CÁC HÀM XỬ LÝ (HANDLERS) ---

  const handleAdd = async (values: { chinese: string }) => {
    setIsActionLoading(true);
    try {
      await addWord(values.chinese);
      toast.success("Thêm từ thành công!");
      fetchWords(); // Tải lại dữ liệu để cập nhật
    } catch (e) {
      toast.error("Lỗi khi thêm từ!");
    } finally {
      setIsActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;
    setIsDeleting(true);
    try {
      await deleteWord(deleteRow.key);
      setData(data.filter((item) => item.key !== deleteRow.key));
      toast.success("Xóa từ thành công!");
    } catch (e) {
      toast.error("Lỗi khi xóa từ!");
    }
    setIsDeleting(false);
    setDeleteRow(null);
  };

  const handleSaveHanViet = async () => {
    if (!editingRow) return;
    setIsActionLoading(true);
    try {
      await updateHanViet(editingRow.chinese, hanVietInput);
      await updateWord(editingRow.key, { hanViet: hanVietInput });
      setData(
        data.map((row) =>
          row.key === editingRow.key ? { ...row, hanViet: hanVietInput } : row
        )
      );
      toast.success("Cập nhật Hán Việt thành công!");
    } catch (e) {
      toast.error("Lỗi khi cập nhật Hán Việt!");
    }
    setIsActionLoading(false);
    setEditingRow(null);
  };

  const handleSaveChinese = async () => {
    if (!editingChineseRow) return;
    setIsActionLoading(true);
    try {
      const res = await updateWord(editingChineseRow.key, {
        chinese: chineseInput,
      });
      const updated = res.data as Partial<WordRow>;
      setData(
        data.map((row) =>
          row.key === editingChineseRow.key
            ? { ...row, ...updated, key: row.key }
            : row
        )
      );
      toast.success("Cập nhật chữ Trung thành công!");
    } catch (e) {
      toast.error("Lỗi khi cập nhật chữ Trung!");
    }
    setIsActionLoading(false);
    setEditingChineseRow(null);
  };

  const handleSaveVietnamese = async () => {
    if (!editingVietnameseRow) return;
    setIsActionLoading(true);
    try {
      const res = await updateWord(editingVietnameseRow.key, {
        vietnamese: vietnameseInput,
      });
      const updated = res.data as Partial<WordRow>;
      setData(
        data.map((row) =>
          row.key === editingVietnameseRow.key
            ? { ...row, ...updated, key: row.key }
            : row
        )
      );
      toast.success("Cập nhật nghĩa tiếng Việt thành công!");
    } catch (e) {
      toast.error("Lỗi khi cập nhật nghĩa tiếng Việt!");
    }
    setIsActionLoading(false);
    setEditingVietnameseRow(null);
  };

  // Trả về tất cả state và hàm cần thiết
  return {
    data,
    page,
    pageSize,
    total,
    pageLoading,
    pageError,
    isActionLoading,
    isDeleting,
    filteredData,
    searchOrAdd,
    examples,
    exampleModal,
    editingRow,
    hanVietInput,
    deleteRow,
    editingChineseRow,
    chineseInput,
    editingVietnameseRow,
    vietnameseInput,
    translateLoading,
    userChineseInputs,
    userChineseStatus,
    setPage,
    setPageSize,
    setSearchOrAdd,
    setExampleModal,
    setEditingRow,
    setHanVietInput,
    setDeleteRow,
    setEditingChineseRow,
    setChineseInput,
    setEditingVietnameseRow,
    setVietnameseInput,
    setUserChineseInputs,
    setUserChineseStatus,
    setTranslateLoading,
    handleAdd,
    confirmDelete,
    handleSaveHanViet,
    handleSaveChinese,
    handleSaveVietnamese,
    fetchWords,
  };
};
