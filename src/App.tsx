import {
    BarChartOutlined,
    BookOutlined,
    LogoutOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {
    Alert,
    Avatar,
    Button,
    Card,
    Dropdown,
    Form,
    Input,
    List,
    Modal,
    Select,
    Space,
    Spin,
    message,
} from "antd";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    createFlashcardsFromWords,
    getFlashcardStats,
    getFlashcardsForReview,
    reviewFlashcard,
} from "./api/flashcardApi";
import {
    addWord,
    deleteWord,
    getExamples,
    getWords,
    translateToVietnamese,
    updateHanViet,
    updateWord,
} from "./api/wordApi";
import PronunciationPractice from "./components/audio/PronunciationPractice";
import DashboardModal from "./components/dashboard/DashboardModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import EditChineseModal from "./components/EditChineseModal";
import EditHanVietModal from "./components/EditHanVietModal";
import ExampleModal from "./components/ExampleModal";
import FlashcardModal from "./components/FlashcardModal";
import LoginModal from "./components/LoginModal";
import RegisterModal from "./components/RegisterModal";
import WordTable from "./components/WordTable";
import { useAuth } from "./hooks/useAuth";
import { useMediaQuery } from "./hooks/useMediaQuery";
import usePronunciation from "./hooks/usePronunciation";
import useWordTableColumns from "./hooks/useWordTableColumns";
import { Flashcard, FlashcardStats } from "./types/flashcard";
import { User } from "./types/user";
import { WordRow } from "./types/word";

const App = () => {
    // Logic xác thực được quản lý bởi useAuth
    const {
        currentUser,
        isAuthenticated,
        isAuthLoading,
        showLoginModal,
        setShowLoginModal,
        showRegisterModal,
        setShowRegisterModal,
        handleAuthSuccess,
        handleLogout,
    } = useAuth();

    const [form] = Form.useForm();
    const [data, setData] = useState<WordRow[]>([]);
    const [editingRow, setEditingRow] = useState<WordRow | null>(null);
    const [hanVietInput, setHanVietInput] = useState("");

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [pageError, setPageError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [translateLoading, setTranslateLoading] = useState<{ [key: string]: boolean }>({});
    const [exampleModal, setExampleModal] = useState<{ open: boolean; example: string }>({ open: false, example: "" });
    const [examples, setExamples] = useState<{ [key: string]: string }>({});
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [deleteRow, setDeleteRow] = useState<WordRow | null>(null);
    const [editingChineseRow, setEditingChineseRow] = useState<WordRow | null>(null);
    const [chineseInput, setChineseInput] = useState("");
    const [userChineseInputs, setUserChineseInputs] = useState<{ [key: string]: string }>({});
    const [userChineseStatus, setUserChineseStatus] = useState<{ [key: string]: "correct" | "incorrect" | undefined }>({});
    const [searchOrAdd, setSearchOrAdd] = useState("");
    const [filteredData, setFilteredData] = useState<WordRow[]>([]);
    const [editingVietnameseRow, setEditingVietnameseRow] = useState<WordRow | null>(null);
    const [vietnameseInput, setVietnameseInput] = useState("");

    const { voices, selectedVoice, setSelectedVoice, speechRate, setSpeechRate, getDisplayVoiceName, speakChinese } = usePronunciation();
    const isMobile = useMediaQuery('(max-width: 768px)');

    // Flashcard states
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [flashcardStats, setFlashcardStats] = useState<FlashcardStats | null>(null);
    const [showFlashcardModal, setShowFlashcardModal] = useState(false);
    const [flashcardLoading, setFlashcardLoading] = useState(false);
    const [showDashboardModal, setShowDashboardModal] = useState(false);

    // Chỉ fetch data khi đã authenticated và quá trình kiểm tra auth ban đầu đã xong
    useEffect(() => {
        if (isAuthenticated) {
            fetchWords();
        } else if (!isAuthLoading) {
            // Nếu không đăng nhập và đã kiểm tra xong, tắt loading trang
            setPageLoading(false);
        }
    }, [isAuthenticated, isAuthLoading, page, pageSize]);

    const fetchWords = async () => {
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
            setPageError("Không thể tải dữ liệu từ máy chủ. Vui lòng làm mới lại trang.");
        } finally {
            setPageLoading(false);
        }
    };

    const userMenuItems = [
        {
            key: "profile",
            icon: <UserOutlined />,
            label: `Xin chào, ${currentUser?.displayName}`,
        },
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Đăng xuất",
            onClick: handleLogout, // Sử dụng hàm từ hook
        },
    ];

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

    useEffect(() => {
        if (!searchOrAdd) {
            setFilteredData(data);
        } else {
            setFilteredData(data.filter((row) => row.chinese.includes(searchOrAdd)));
        }
    }, [searchOrAdd, data]);

    useEffect(() => {
        if (isAuthenticated) {
            loadFlashcardStats();
        }
    }, [isAuthenticated]);

    const loadFlashcardStats = async () => {
        try {
            const response = await getFlashcardStats();
            setFlashcardStats(response.data);
        } catch (error) {
            console.error("Error loading flashcard stats:", error);
        }
    };

    const handleStartFlashcards = async () => {
        setFlashcardLoading(true);
        try {
            let reviewResponse = await getFlashcardsForReview(10);
            let reviewFlashcards = (reviewResponse.data as any).flashcards;

            if (reviewFlashcards.length === 0) {
                const statsResponse = await getFlashcardStats();
                const currentStats = statsResponse.data;
                setFlashcardStats(currentStats);

                if (currentStats.total > 0) {
                    toast.success("Chúc mừng! Bạn đã ôn tập hết các thẻ đến hạn.");
                } else {
                    toast.info("Chưa có flashcard, đang tạo từ danh sách từ vựng...");
                    const createResponse = await createFlashcardsFromWords();
                    const createdCount = (createResponse.data as any).created;

                    if (createdCount > 0) {
                        toast.success(`Đã tạo ${createdCount} flashcard mới. Bắt đầu ôn tập!`);
                        reviewResponse = await getFlashcardsForReview(10);
                        reviewFlashcards = (reviewResponse.data as any).flashcards;
                    } else {
                        toast.warn("Không có từ vựng nào để tạo flashcard. Hãy thêm từ mới trước.");
                    }
                }
            }
            
            if (reviewFlashcards && reviewFlashcards.length > 0) {
                setFlashcards(reviewFlashcards);
                setShowFlashcardModal(true);
            } else if (reviewFlashcards) { 
                 toast.info("Hiện không có thẻ nào để ôn tập.");
            }

        } catch (error) {
            toast.error("Có lỗi xảy ra trong quá trình chuẩn bị flashcard!");
            console.error(error);
        } finally {
            setFlashcardLoading(false);
        }
    };

    const handleFlashcardFinish = () => {
        setShowFlashcardModal(false);
        loadFlashcardStats();
        toast.success("Hoàn thành phiên ôn tập!");
    };
    
    const handleAdd = async (values: { chinese: string }) => {
        try {
            await addWord(values.chinese);
            form.resetFields();
            toast.success("Thêm từ thành công!");
            fetchWords();
        } catch (e) {
            toast.error("Lỗi khi thêm từ!");
        }
    };

    const handleAddIfNotExist = async () => {
        if (!searchOrAdd) return;
        if (!/^[\u4e00-\u9fff]+$/.test(searchOrAdd)) {
            toast.error("Chỉ nhập chữ Trung!");
            return;
        }
        const exists = data.some((row) => row.chinese === searchOrAdd);
        if (!exists) {
            await handleAdd({ chinese: searchOrAdd });
            setSearchOrAdd("");
        }
    };

    const handleEditHanViet = (row: WordRow) => {
        setEditingRow(row);
        setHanVietInput(row.hanViet);
    };

    const handleSaveHanViet = async () => {
        if (!editingRow) return;
        setLoading(true);
        try {
            await updateHanViet(editingRow.chinese, hanVietInput);
            await updateWord(editingRow.key, { hanViet: hanVietInput });
            setData(
                data.map((row) =>
                    row.key === editingRow.key ? { ...row, hanViet: hanVietInput } : row
                )
            );
            toast.success("Cập nhật nghĩa Hán Việt thành công!");
        } catch (e) {
            toast.error("Lỗi khi cập nhật nghĩa Hán Việt!");
        }
        setLoading(false);
        setEditingRow(null);
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

    const handleEditChinese = (row: WordRow) => {
        setEditingChineseRow(row);
        setChineseInput(row.chinese);
    };

    const handleSaveChinese = async () => {
        if (!editingChineseRow) return;
        setLoading(true);
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
        setLoading(false);
        setEditingChineseRow(null);
    };

    const handleUserChineseChange = (
        key: string,
        value: string,
        chinese: string
    ) => {
        setUserChineseInputs((prev) => ({ ...prev, [key]: value }));
        if (value === chinese) {
            setUserChineseStatus((prev) => ({ ...prev, [key]: "correct" }));
        } else if (value.length > 0) {
            setUserChineseStatus((prev) => ({ ...prev, [key]: "incorrect" }));
        } else {
            setUserChineseStatus((prev) => ({ ...prev, [key]: undefined }));
        }
    };

    const handleEditVietnamese = (row: WordRow) => {
        setEditingVietnameseRow(row);
        setVietnameseInput(row.vietnamese);
    };

    const handleSaveVietnamese = async () => {
        if (!editingVietnameseRow) return;
        setLoading(true);
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
        setLoading(false);
        setEditingVietnameseRow(null);
    };

    const handleTranslateVietnamese = async (row: WordRow) => {
        setTranslateLoading((prev) => ({ ...prev, [row.key]: true }));
        try {
            const res = await translateToVietnamese(row.chinese);
            const translatedText = (res.data as any).translated;

            const updateRes = await updateWord(row.key, {
                vietnamese: translatedText,
            });
            const updated = updateRes.data as Partial<WordRow>;
            setData(
                data.map((item) =>
                    item.key === row.key ? { ...item, ...updated, key: item.key } : item
                )
            );
            toast.success("Dịch nghĩa tiếng Việt thành công!");
        } catch (e) {
            toast.error("Lỗi khi dịch nghĩa tiếng Việt!");
        }
        setTranslateLoading((prev) => ({ ...prev, [row.key]: false }));
    };


    const columns = useWordTableColumns({
        page, pageSize, speakChinese, examples, setExampleModal, userChineseInputs,
        userChineseStatus, translateLoading,
        handleEditHanViet: (row: WordRow) => { setEditingRow(row); setHanVietInput(row.hanViet); },
        handleEditVietnamese: (row: WordRow) => { setEditingVietnameseRow(row); setVietnameseInput(row.vietnamese); },
        handleTranslateVietnamese,
        handleUserChineseChange,
        handleEditChinese: (row: WordRow) => { setEditingChineseRow(row); setChineseInput(row.chinese); },
        setDeleteRow,
    });

    if (isAuthLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Spin tip="Đang kiểm tra phiên đăng nhập..." size="large" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px",
                }}
            >
                <div
                    style={{
                        maxWidth: 600,
                        width: "100%",
                        padding: "60px 40px",
                        background: "#fff",
                        borderRadius: 24,
                        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            fontSize: 64,
                            color: "#1890ff",
                            marginBottom: 24,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <BookOutlined />
                    </div>

                    <h1
                        style={{
                            fontSize: 48,
                            fontWeight: 800,
                            marginBottom: 16,
                            letterSpacing: 2,
                            color: "#262626",
                            margin: "0 0 16px 0",
                        }}
                    >
                        Hỗ trợ học tiếng Trung
                    </h1>

                    <p
                        style={{
                            fontSize: 20,
                            marginBottom: 48,
                            color: "#666",
                            lineHeight: 1.6,
                        }}
                    >
                        Học tiếng Trung hiệu quả với công cụ hỗ trợ thông minh
                    </p>

                    <div style={{ marginBottom: 40 }}>
                        <Space size="large" direction="vertical" style={{ width: "100%" }}>
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => setShowLoginModal(true)}
                                style={{
                                    fontSize: 18,
                                    height: 56,
                                    padding: "0 48px",
                                    borderRadius: 12,
                                    fontWeight: 600,
                                    width: "100%",
                                    maxWidth: 300,
                                }}
                            >
                                Đăng nhập
                            </Button>
                            <Button
                                size="large"
                                onClick={() => setShowRegisterModal(true)}
                                style={{
                                    fontSize: 18,
                                    height: 56,
                                    padding: "0 48px",
                                    borderRadius: 12,
                                    fontWeight: 600,
                                    width: "100%",
                                    maxWidth: 300,
                                    border: "2px solid #1890ff",
                                    color: "#1890ff",
                                }}
                            >
                                Đăng ký
                            </Button>
                        </Space>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 40,
                            flexWrap: "wrap",
                        }}
                    >
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 32, color: "#1890ff", marginBottom: 8 }}>
                                📚
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: "#262626" }}>
                                Từ vựng phong phú
                            </div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 32, color: "#1890ff", marginBottom: 8 }}>
                                🎯
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: "#262626" }}>
                                Học tập hiệu quả
                            </div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 32, color: "#1890ff", marginBottom: 8 }}>
                                🔄
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: "#262626" }}>
                                Dịch thuật tự động
                            </div>
                        </div>
                    </div>

                    <LoginModal
                        open={showLoginModal}
                        onClose={() => setShowLoginModal(false)}
                        onSuccess={handleAuthSuccess}
                        onSwitchToRegister={() => {
                            setShowLoginModal(false);
                            setShowRegisterModal(true);
                        }}
                    />

                    <RegisterModal
                        open={showRegisterModal}
                        onClose={() => setShowRegisterModal(false)}
                        onSuccess={handleAuthSuccess}
                        onSwitchToLogin={() => {
                            setShowRegisterModal(false);
                            setShowLoginModal(true);
                        }}
                    />
                </div>
            </div>
        );
    }
    
    if (pageError) {
        return (
            <div style={{ padding: 40 }}>
                <Alert
                    message="Lỗi"
                    description={pageError}
                    type="error"
                    showIcon
                    action={ <Button size="small" type="primary" onClick={fetchWords}>Thử lại</Button> }
                />
            </div>
        );
    }

    // Khi đã đăng nhập, hiển thị loading cho dữ liệu từ vựng
    if (pageLoading) {
        return (
             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <Spin tip="Đang tải dữ liệu từ vựng..." size="large" />
            </div>
        )
    }


    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                padding: isMobile ? "10px" : "20px",
            }}
        >
            <div
                style={{
                    maxWidth: 1400,
                    margin: "0 auto",
                    background: "#fff",
                    borderRadius: 24,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        background: "linear-gradient(135deg, #1890ff 0%, #722ed1 100%)",
                        padding: "32px 40px",
                        color: "white",
                        position: "relative",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 24,
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div
                                style={{
                                    fontSize: 48,
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <BookOutlined />
                            </div>
                            <div>
                                <h1
                                    style={{
                                        fontSize: 36,
                                        fontWeight: 800,
                                        margin: 0,
                                        color: "white",
                                    }}
                                >
                                    Hỗ trợ học tiếng Trung
                                </h1>
                                <p
                                    style={{
                                        fontSize: 16,
                                        margin: "8px 0 0 0",
                                        opacity: 0.9,
                                    }}
                                >
                                    Học tiếng Trung hiệu quả với công cụ hỗ trợ thông minh
                                </p>
                            </div>
                        </div>

                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                            <Button
                                type="text"
                                style={{
                                    height: "auto",
                                    padding: "12px 20px",
                                    background: "rgba(255,255,255,0.1)",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    borderRadius: 12,
                                    color: "white",
                                }}
                            >
                                <Space>
                                    <Avatar
                                        icon={<UserOutlined />}
                                        style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                                    />
                                    <span style={{ fontWeight: 600 }}>
                                        {currentUser?.displayName}
                                    </span>
                                </Space>
                            </Button>
                        </Dropdown>
                    </div>

                    {/* Voice Selection */}
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "center",
                            gap: 16,
                            background: "rgba(255,255,255,0.1)",
                            padding: "16px 20px",
                            borderRadius: 12,
                            backdropFilter: "blur(10px)",
                        }}
                    >
                        <span style={{ fontWeight: 600, fontSize: 16 }}>🎤 Giọng đọc:</span>
                        <Select
                            style={{
                                minWidth: isMobile ? '100%' : 300,
                                background: "rgba(255,255,255,0.9)",
                                borderRadius: 8,
                            }}
                            value={selectedVoice}
                            onChange={setSelectedVoice}
                            options={voices.map((v) => ({
                                label: getDisplayVoiceName(v),
                                value: v.name,
                            }))}
                            placeholder="Chọn giọng đọc"
                        />
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 600 }}>🕒 Tốc độ đọc:</span>
                            <Select
                                style={{ width: 160 }}
                                value={speechRate}
                                onChange={setSpeechRate}
                                options={[
                                    { value: 0.5, label: "Chậm" },
                                    { value: 1, label: "Bình thường" },
                                    { value: 1.5, label: "Nhanh" },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ padding: isMobile ? "20px" : "40px" }}>
                    {/* Search and Add Section */}
                    <div
                        style={{
                            background: "#f8f9fa",
                            padding: "24px",
                            borderRadius: 16,
                            marginBottom: 32,
                            border: "1px solid #e9ecef",
                        }}
                    >
                        <div style={{ marginBottom: 16 }}>
                            <h3
                                style={{
                                    fontSize: 20,
                                    fontWeight: 600,
                                    margin: "0 0 8px 0",
                                    color: "#262626",
                                }}
                            >
                                🔍 Tìm kiếm & Thêm từ mới
                            </h3>
                            <p
                                style={{
                                    fontSize: 14,
                                    color: "#666",
                                    margin: 0,
                                }}
                            >
                                Nhập chữ Trung để tìm kiếm hoặc thêm từ mới vào danh sách học
                            </p>
                        </div>

                        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <Input
                                    placeholder="Nhập hoặc tìm kiếm chữ Trung..."
                                    value={searchOrAdd}
                                    onChange={(e) => setSearchOrAdd(e.target.value)}
                                    onPressEnter={handleAddIfNotExist}
                                    style={{
                                        height: 48,
                                        fontSize: 16,
                                        borderRadius: 12,
                                        border: "2px solid #e9ecef",
                                    }}
                                    allowClear
                                />
                            </div>
                            {!data.some((row) => row.chinese === searchOrAdd) &&
                                searchOrAdd && (
                                    <Button
                                        type="primary"
                                        onClick={handleAddIfNotExist}
                                        style={{
                                            height: 48,
                                            fontSize: 16,
                                            fontWeight: 600,
                                            borderRadius: 12,
                                            padding: "0 24px",
                                            background:
                                                "linear-gradient(135deg, #1890ff 0%, #722ed1 100%)",
                                            border: "none",
                                        }}
                                    >
                                        ➕ Thêm từ này
                                    </Button>
                                )}
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: 20,
                            marginBottom: 32,
                        }}
                    >
                        <div
                            style={{
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                padding: "24px",
                                borderRadius: 16,
                                color: "white",
                                textAlign: "center",
                            }}
                        >
                            <div style={{ fontSize: 32, marginBottom: 8 }}>📚</div>
                            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
                                {total}
                            </div>
                            <div style={{ fontSize: 14, opacity: 0.9 }}>Từ vựng đã học</div>
                        </div>

                        <div
                            style={{
                                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                                padding: "24px",
                                borderRadius: 16,
                                color: "white",
                                textAlign: "center",
                            }}
                        >
                            <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
                            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
                                {page}
                            </div>
                            <div style={{ fontSize: 14, opacity: 0.9 }}>Trang hiện tại</div>
                        </div>

                        <div
                            style={{
                                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                padding: "24px",
                                borderRadius: 16,
                                color: "white",
                                textAlign: "center",
                            }}
                        >
                            <div style={{ fontSize: 32, marginBottom: 8 }}>🔄</div>
                            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
                                Auto
                            </div>
                            <div style={{ fontSize: 14, opacity: 0.9 }}>
                                Dịch thuật tự động
                            </div>
                        </div>

                        <div
                            style={{
                                background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                                padding: "24px",
                                borderRadius: 16,
                                color: "white",
                                textAlign: "center",
                                cursor: "pointer",
                                transition: "transform 0.2s ease-in-out",
                            }}
                            onClick={handleStartFlashcards}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.transform = "translateY(-4px)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.transform = "translateY(0)")
                            }
                        >
                            <div style={{ fontSize: 32, marginBottom: 8 }}>🎴</div>
                            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
                                {flashcardStats?.dueForReview || 0}
                            </div>
                            <div style={{ fontSize: 14, opacity: 0.9 }}>
                                {flashcardLoading ? "Đang tải..." : "Flashcards cần review"}
                            </div>
                        </div>

                        <div
                            style={{
                                background: "linear-gradient(135deg, #8BC6EC 0%, #9599E2 100%)",
                                padding: "24px",
                                borderRadius: 16,
                                color: "white",
                                textAlign: "center",
                                cursor: "pointer",
                                transition: "transform 0.2s ease-in-out",
                            }}
                            onClick={() => setShowDashboardModal(true)}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.transform = "translateY(-4px)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.transform = "translateY(0)")
                            }
                        >
                            <div style={{ fontSize: 32, marginBottom: 8 }}>
                                <BarChartOutlined />
                            </div>
                            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
                                Thống kê
                            </div>
                            <div style={{ fontSize: 14, opacity: 0.9 }}>Xem tiến độ học tập</div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div
                        style={{
                            background: "white",
                            borderRadius: 16,
                            border: "1px solid #e9ecef",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        }}
                    >
                        <div
                            style={{
                                padding: "20px 24px",
                                background: "#f8f9fa",
                                borderBottom: "1px solid #e9ecef",
                            }}
                        >
                            <h3
                                style={{
                                    fontSize: 18,
                                    fontWeight: 600,
                                    margin: 0,
                                    color: "#262626",
                                }}
                            >
                                📖 Danh sách từ vựng
                            </h3>
                        </div>

                        <div style={{ padding: isMobile ? "10px" : "0 24px 24px 24px" }}>
                            {isMobile ? (
                                <List
                                    loading={pageLoading}
                                    dataSource={filteredData}
                                    renderItem={(word) => (
                                        <List.Item>
                                            <Card title={word.chinese} style={{ width: '100%' }}>
                                                <p><strong>Pinyin:</strong> {word.pinyin}</p>
                                                <p><strong>Hán Việt:</strong> {word.hanViet}</p>
                                                <p><strong>Nghĩa:</strong> {word.vietnamese}</p>
                                                <Space style={{ marginTop: 16, flexWrap: 'wrap' }}>
                                                    <Button size="small" onClick={() => speakChinese(word.chinese)}>Phát âm</Button>
                                                    <Button size="small" onClick={() => handleEditVietnamese(word)}>Sửa nghĩa</Button>
                                                    <Button size="small" onClick={() => setDeleteRow(word)}>Xóa</Button>
                                                </Space>
                                            </Card>
                                        </List.Item>
                                    )}
                                    pagination={{
                                        current: page,
                                        pageSize: pageSize,
                                        total: total,
                                        onChange: (p: number, ps: number) => {
                                            setPage(p);
                                            setPageSize(ps);
                                        },
                                        simple: true,
                                    }}
                                />
                            ) : (
                                <WordTable
                                    columns={columns}
                                    data={filteredData}
                                    pagination={{
                                        current: page,
                                        pageSize: pageSize,
                                        total: total,
                                        onChange: (p: number, ps: number) => {
                                            setPage(p);
                                            setPageSize(ps);
                                        },
                                        showSizeChanger: true,
                                        pageSizeOptions: [5, 10, 20, 50],
                                        style: { marginTop: 16 },
                                    }}
                                    examples={examples}
                                    onEditChinese={handleEditChinese}
                                    onEditHanViet={handleEditHanViet}
                                    onDelete={setDeleteRow}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <EditHanVietModal
                open={!!editingRow}
                value={hanVietInput}
                onChange={setHanVietInput}
                onOk={handleSaveHanViet}
                onCancel={() => setEditingRow(null)}
                loading={loading}
                oldChinese={editingRow?.chinese}
            />
            <ExampleModal
                open={exampleModal.open}
                example={exampleModal.example}
                onClose={() => setExampleModal({ open: false, example: "" })}
            />
            <DeleteConfirmModal
                open={!!deleteRow}
                onOk={confirmDelete}
                onCancel={() => setDeleteRow(null)}
                chinese={deleteRow?.chinese}
                confirmLoading={isDeleting}
            />
            <EditChineseModal
                open={!!editingChineseRow}
                value={chineseInput}
                onChange={setChineseInput}
                onOk={handleSaveChinese}
                onCancel={() => setEditingChineseRow(null)}
                loading={loading}
                oldChinese={editingChineseRow?.chinese}
            />
            <Modal
                open={!!editingVietnameseRow}
                title={`Sửa nghĩa tiếng Việt cho: ${editingVietnameseRow?.chinese}`}
                onOk={() => {
                    if (!vietnameseInput.trim()) {
                        toast.error("Không được để trống nghĩa tiếng Việt!");
                        return;
                    }
                    handleSaveVietnamese();
                }}
                onCancel={() => setEditingVietnameseRow(null)}
                confirmLoading={loading}
            >
                <Input
                    value={vietnameseInput}
                    onChange={(e) => setVietnameseInput(e.target.value)}
                    placeholder="Nhập nghĩa tiếng Việt mới"
                />
            </Modal>
            <ToastContainer position="top-right" autoClose={3000} />

            <LoginModal
                open={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSuccess={handleAuthSuccess}
                onSwitchToRegister={() => {
                    setShowLoginModal(false);
                    setShowRegisterModal(true);
                }}
            />

            <RegisterModal
                open={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={() => {
                    setShowRegisterModal(false);
                    setShowLoginModal(true);
                }}
            />

            <FlashcardModal
                open={showFlashcardModal}
                onClose={() => setShowFlashcardModal(false)}
                flashcards={flashcards}
                onFinish={handleFlashcardFinish}
            />

            <DashboardModal
                open={showDashboardModal}
                onClose={() => setShowDashboardModal(false)}
            />
            <PronunciationPractice targetWord="你好" />
        </div>
    );
};

export default App;
