import { BookOutlined, DeleteOutlined, EditOutlined, LogoutOutlined, SoundOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, Form, Input, Modal, Select, Space } from 'antd';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { addWord, deleteWord, getExamples, getWords, translateToVietnamese, updateHanViet, updateWord } from './api/wordApi';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import EditChineseModal from './components/EditChineseModal';
import EditHanVietModal from './components/EditHanVietModal';
import ExampleModal from './components/ExampleModal';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import WordTable from './components/WordTable';
import { User } from './types/user';
import { WordRow } from './types/word';

const App = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<WordRow[]>([]);
  const [editingRow, setEditingRow] = useState<WordRow | null>(null);
  const [hanVietInput, setHanVietInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [translateLoading, setTranslateLoading] = useState<{ [key: string]: boolean }>({});
  const [exampleModal, setExampleModal] = useState<{ open: boolean, example: string }>({ open: false, example: '' });
  const [examples, setExamples] = useState<{ [key: string]: string }>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [deleteRow, setDeleteRow] = useState<WordRow | null>(null);
  const [editingChineseRow, setEditingChineseRow] = useState<WordRow | null>(null);
  const [chineseInput, setChineseInput] = useState('');
  const [userChineseInputs, setUserChineseInputs] = useState<{ [key: string]: string }>({});
  const [userChineseStatus, setUserChineseStatus] = useState<{ [key: string]: 'correct' | 'incorrect' | undefined }>({});
  const [searchOrAdd, setSearchOrAdd] = useState('');
  const [filteredData, setFilteredData] = useState<WordRow[]>([]);
  const [editingVietnameseRow, setEditingVietnameseRow] = useState<WordRow | null>(null);
  const [vietnameseInput, setVietnameseInput] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');

  // Authentication states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Kiểm tra authentication khi component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Chỉ fetch data khi đã authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchWords();
    }
  }, [isAuthenticated, page, pageSize]);

  const fetchWords = async () => {
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
      toast.error('Không lấy được danh sách từ vựng!');
    }
  };

  const handleAuthSuccess = (token: string, user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setData([]);
    toast.success('Đăng xuất thành công!');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: `Xin chào, ${currentUser?.displayName}`,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  // Các useEffect khác
  useEffect(() => {
    const fetchExamples = async () => {
      const wordsOnPage = data.map(row => row.chinese);
      if (wordsOnPage.length === 0) return setExamples({});
      try {
        const res = await getExamples(wordsOnPage);
        const examplesObj = (res.data as any).examples || {};
        const newExamples: { [key: string]: string } = {};
        for (const row of data) {
          let example = examplesObj[row.chinese] || '';
          if (example && row.chinese) {
            const re = new RegExp(row.chinese, 'g');
            example = example.replace(re, `<span style='color: red; font-weight: bold;'>${row.chinese}</span>`);
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
      setFilteredData(
        data.filter(row => row.chinese.includes(searchOrAdd))
      );
    }
  }, [searchOrAdd, data]);

  // Lấy danh sách voice tiếng Trung khi component mount
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const zhVoices = allVoices.filter(v => v.lang && v.lang.startsWith('zh'));
      setVoices(zhVoices);
      if (zhVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(zhVoices[0].name);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Nếu chưa đăng nhập, hiển thị màn hình đăng nhập
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: 600,
          width: '100%',
          padding: '60px 40px',
          background: '#fff',
          borderRadius: 24,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: 64,
            color: '#1890ff',
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <BookOutlined />
          </div>

          <h1 style={{
            fontSize: 48,
            fontWeight: 800,
            marginBottom: 16,
            letterSpacing: 2,
            color: '#262626',
            margin: '0 0 16px 0'
          }}>
            Hỗ trợ học tiếng Trung
          </h1>

          <p style={{
            fontSize: 20,
            marginBottom: 48,
            color: '#666',
            lineHeight: 1.6
          }}>
            Học tiếng Trung hiệu quả với công cụ hỗ trợ thông minh
          </p>

          <div style={{ marginBottom: 40 }}>
            <Space size="large" direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                size="large"
                onClick={() => setShowLoginModal(true)}
                style={{
                  fontSize: 18,
                  height: 56,
                  padding: '0 48px',
                  borderRadius: 12,
                  fontWeight: 600,
                  width: '100%',
                  maxWidth: 300
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
                  padding: '0 48px',
                  borderRadius: 12,
                  fontWeight: 600,
                  width: '100%',
                  maxWidth: 300,
                  border: '2px solid #1890ff',
                  color: '#1890ff'
                }}
              >
                Đăng ký
              </Button>
            </Space>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 40,
            flexWrap: 'wrap'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }}>
                📚
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#262626' }}>
                Từ vựng phong phú
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }}>
                🎯
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#262626' }}>
                Học tập hiệu quả
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }}>
                🔄
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#262626' }}>
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

  const handleAdd = async (values: { chinese: string }) => {
    try {
      const res = await addWord(values.chinese);
      const word = res.data as any;
      setData(prev => [...prev, { ...word, key: word._id || word.key }]);
      form.resetFields();
      toast.success('Thêm từ thành công!');
      // Refresh data để đảm bảo hiển thị đúng
      fetchWords();
    } catch (e) {
      toast.error('Lỗi khi thêm từ!');
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
      setData(data.map(row => row.key === editingRow.key ? { ...row, hanViet: hanVietInput } : row));
      toast.success('Cập nhật nghĩa Hán Việt thành công!');
    } catch (e) {
      toast.error('Lỗi khi cập nhật nghĩa Hán Việt!');
    }
    setLoading(false);
    setEditingRow(null);
  };

  const confirmDelete = async () => {
    if (!deleteRow) return;
    try {
      await deleteWord(deleteRow.key);
      setData(data.filter(item => item.key !== deleteRow.key));
      toast.success('Xóa từ thành công!');
    } catch (e) {
      toast.error('Lỗi khi xóa từ!');
    }
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
      const res = await updateWord(editingChineseRow.key, { chinese: chineseInput });
      const updated = res.data as Partial<WordRow>;
      setData(data.map(row => row.key === editingChineseRow.key ? { ...row, ...updated, key: row.key } : row));
      toast.success('Cập nhật chữ Trung thành công!');
    } catch (e) {
      toast.error('Lỗi khi cập nhật chữ Trung!');
    }
    setLoading(false);
    setEditingChineseRow(null);
  };

  const handleUserChineseChange = (key: string, value: string, chinese: string) => {
    setUserChineseInputs(prev => ({ ...prev, [key]: value }));
    if (value === chinese) {
      setUserChineseStatus(prev => ({ ...prev, [key]: 'correct' }));
    } else if (value.length > 0) {
      setUserChineseStatus(prev => ({ ...prev, [key]: 'incorrect' }));
    } else {
      setUserChineseStatus(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const handleAddIfNotExist = async () => {
    if (!searchOrAdd) return;
    // Kiểm tra chỉ cho phép chữ Trung
    if (!/^[\u4e00-\u9fff]+$/.test(searchOrAdd)) {
      toast.error('Chỉ nhập chữ Trung!');
      return;
    }
    const exists = data.some(row => row.chinese === searchOrAdd);
    if (!exists) {
      await handleAdd({ chinese: searchOrAdd });
      setSearchOrAdd('');
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
      const res = await updateWord(editingVietnameseRow.key, { vietnamese: vietnameseInput });
      const updated = res.data as Partial<WordRow>;
      setData(data.map(row => row.key === editingVietnameseRow.key ? { ...row, ...updated, key: row.key } : row));
      toast.success('Cập nhật nghĩa tiếng Việt thành công!');
    } catch (e) {
      toast.error('Lỗi khi cập nhật nghĩa tiếng Việt!');
    }
    setLoading(false);
    setEditingVietnameseRow(null);
  };

  // Hàm dịch tự động nghĩa tiếng Việt
  const handleTranslateVietnamese = async (row: WordRow) => {
    setTranslateLoading(prev => ({ ...prev, [row.key]: true }));
    try {
      const res = await translateToVietnamese(row.chinese);
      const translatedText = (res.data as any).translated;

      // Cập nhật nghĩa tiếng Việt
      const updateRes = await updateWord(row.key, { vietnamese: translatedText });
      const updated = updateRes.data as Partial<WordRow>;
      setData(data.map(item => item.key === row.key ? { ...item, ...updated, key: item.key } : item));

      toast.success('Dịch nghĩa tiếng Việt thành công!');
    } catch (e) {
      toast.error('Lỗi khi dịch nghĩa tiếng Việt!');
    }
    setTranslateLoading(prev => ({ ...prev, [row.key]: false }));
  };

  // Hàm phát âm chữ Trung với voice đã chọn
  const speakChinese = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      if (selectedVoice) {
        utterance.voice = voices.find(v => v.name === selectedVoice) || null;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  function getDisplayVoiceName(voice: SpeechSynthesisVoice) {
    return `${voice.name} (${voice.lang})`;
  }

  const columns = [
    {
      title: 'STT',
      dataIndex: 'key',
      key: 'key',
      width: 80,
      render: (_: any, __: any, index: number) => (page - 1) * pageSize + index + 1,
    },
    {
      title: 'Chữ Trung',
      dataIndex: 'chinese',
      key: 'chinese',
      render: (text: string) => (
        <span>
          {text}
          <SoundOutlined
            style={{ marginLeft: 8, color: '#1890ff', cursor: 'pointer' }}
            onClick={() => speakChinese(text)}
            title="Phát âm"
          />
        </span>
      ),
    },
    {
      title: 'Hán Việt',
      dataIndex: 'hanViet',
      key: 'hanViet',
      render: (text: string, row: WordRow) => (
        <>
          {text}
          <Button style={{ marginLeft: 12 }} onClick={() => handleEditHanViet(row)}>
            Sửa
          </Button>
        </>
      ),
    },
    {
      title: 'Pinyin',
      dataIndex: 'pinyin',
      key: 'pinyin',
    },
    {
      title: 'Nghĩa tiếng Việt',
      dataIndex: 'vietnamese',
      key: 'vietnamese',
      render: (text: string, row: WordRow) => (
        <>
          {text}
          <Button style={{ marginLeft: 8 }} onClick={() => handleEditVietnamese(row)}>
            Sửa
          </Button>
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => handleTranslateVietnamese(row)}
            loading={translateLoading[row.key] || false}
            type="dashed"
          >
            Dịch
          </Button>
        </>
      ),
    },
    {
      title: 'Ví dụ',
      key: 'example',
      render: (_: any, row: WordRow) => (
        <span dangerouslySetInnerHTML={{ __html: (row.key in examples) ? (examples[row.key] || '') : 'loading...' }} />
      ),
    },
    {
      title: 'Nhập chữ Trung',
      key: 'userChinese',
      width: 180,
      render: (_: any, row: WordRow) => (
        <div>
          <Input
            value={userChineseInputs[String(row.key)] || ''}
            onChange={e => handleUserChineseChange(String(row.key), e.target.value, row.chinese)}
            style={{
              borderColor:
                userChineseStatus[String(row.key)] === 'correct'
                  ? 'green'
                  : userChineseStatus[String(row.key)] === 'incorrect'
                    ? 'red'
                    : undefined,
            }}
            onCopy={e => e.preventDefault()}
            onPaste={e => e.preventDefault()}
            onCut={e => e.preventDefault()}
          />
          {userChineseStatus[String(row.key)] === 'correct' && (
            <span style={{ color: 'green', marginLeft: 8 }}>Đúng</span>
          )}
          {userChineseStatus[String(row.key)] === 'incorrect' && (
            <span style={{ color: 'red', marginLeft: 8 }}>Không đúng</span>
          )}
        </div>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_: any, row: WordRow) => (
        <>
          <EditOutlined style={{ color: '#1890ff', fontSize: 20, marginRight: 16, cursor: 'pointer' }} onClick={() => handleEditChinese(row)} />
          <DeleteOutlined style={{ color: 'red', fontSize: 20, cursor: 'pointer' }} onClick={() => setDeleteRow(row)} />
        </>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1300, margin: '40px auto', padding: 48, background: '#fff', borderRadius: 18, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <h2 style={{ fontSize: 44, fontWeight: 800, letterSpacing: 2, margin: 0 }}>Hỗ trợ học tiếng Trung</h2>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Button type="text" style={{ height: 'auto', padding: 8 }}>
            <Space>
              <Avatar icon={<UserOutlined />} />
              <span>{currentUser?.displayName}</span>
            </Space>
          </Button>
        </Dropdown>
      </div>
      {/* Dropdown chọn voice */}
      <div style={{ marginBottom: 24, maxWidth: 400 }}>
        <span style={{ marginRight: 8, fontWeight: 500 }}>Chọn giọng đọc tiếng Trung:</span>
        <Select
          style={{ minWidth: 220 }}
          value={selectedVoice}
          onChange={setSelectedVoice}
          options={voices.map(v => ({ label: getDisplayVoiceName(v), value: v.name }))}
          placeholder="Chọn giọng đọc"
        />
      </div>
      <div className="search-add-row">
        <div className="search-input-wrap">
          <Input
            placeholder="Nhập hoặc tìm kiếm chữ Trung..."
            value={searchOrAdd}
            onChange={e => setSearchOrAdd(e.target.value)}
            onPressEnter={handleAddIfNotExist}
            style={{ width: '100%', fontSize: 18, minWidth: 0 }}
            allowClear
          />
        </div>
        {!data.some(row => row.chinese === searchOrAdd) && searchOrAdd && (
          <>
            <div style={{ height: 16 }} />
            <div className="search-btn-wrap">
              <Button type="primary" onClick={handleAddIfNotExist} className="add-word-btn">
                Thêm từ này
              </Button>
            </div>
          </>
        )}
      </div>
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
        }}
        examples={examples}
        onEditChinese={handleEditChinese}
        onEditHanViet={handleEditHanViet}
        onDelete={setDeleteRow}
      />
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
        onClose={() => setExampleModal({ open: false, example: '' })}
      />
      <DeleteConfirmModal
        open={!!deleteRow}
        onOk={confirmDelete}
        onCancel={() => setDeleteRow(null)}
        chinese={deleteRow?.chinese}
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
            toast.error('Không được để trống nghĩa tiếng Việt!');
            return;
          }
          handleSaveVietnamese();
        }}
        onCancel={() => setEditingVietnameseRow(null)}
        confirmLoading={loading}
      >
        <Input
          value={vietnameseInput}
          onChange={e => setVietnameseInput(e.target.value)}
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
    </div>
  );
};

export default App; 