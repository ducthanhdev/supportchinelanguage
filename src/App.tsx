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
      render: (_: any, row: WordRow) => {
        const example = row.key in examples ? examples[row.key] : 'loading...';
        if (example && example !== 'loading...' && example.length > 10) {
          return (
            <div>
              <span
                dangerouslySetInnerHTML={{ __html: example.substring(0, 20) + '...' }}
                style={{ cursor: 'pointer', color: '#1890ff' }}
                onClick={() => setExampleModal({ open: true, example })}
                title="Click để xem đầy đủ"
              />
              <Button
                type="link"
                size="small"
                onClick={() => setExampleModal({ open: true, example })}
                style={{ padding: 0, marginLeft: 4 }}
              >
                Xem
              </Button>
            </div>
          );
        }
        return (
          <span dangerouslySetInnerHTML={{ __html: example }} />
        );
      },
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        background: '#fff',
        borderRadius: 24,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
          padding: '32px 40px',
          color: 'white',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                fontSize: 48,
                color: 'white',
                display: 'flex',
                alignItems: 'center'
              }}>
                <BookOutlined />
              </div>
              <div>
                <h1 style={{
                  fontSize: 36,
                  fontWeight: 800,
                  margin: 0,
                  color: 'white'
                }}>
                  Hỗ trợ học tiếng Trung
                </h1>
                <p style={{
                  fontSize: 16,
                  margin: '8px 0 0 0',
                  opacity: 0.9
                }}>
                  Học tiếng Trung hiệu quả với công cụ hỗ trợ thông minh
                </p>
              </div>
            </div>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button
                type="text"
                style={{
                  height: 'auto',
                  padding: '12px 20px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 12,
                  color: 'white'
                }}
              >
                <Space>
                  <Avatar
                    icon={<UserOutlined />}
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  />
                  <span style={{ fontWeight: 600 }}>{currentUser?.displayName}</span>
                </Space>
              </Button>
            </Dropdown>
          </div>

          {/* Voice Selection */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            background: 'rgba(255,255,255,0.1)',
            padding: '16px 20px',
            borderRadius: 12,
            backdropFilter: 'blur(10px)'
          }}>
            <span style={{ fontWeight: 600, fontSize: 16 }}>🎤 Giọng đọc:</span>
            <Select
              style={{
                minWidth: 300,
                background: 'rgba(255,255,255,0.9)',
                borderRadius: 8
              }}
              value={selectedVoice}
              onChange={setSelectedVoice}
              options={voices.map(v => ({ label: getDisplayVoiceName(v), value: v.name }))}
              placeholder="Chọn giọng đọc"
            />
          </div>
        </div>

        {/* Main Content */}
        <div style={{ padding: '40px' }}>
          {/* Search and Add Section */}
          <div style={{
            background: '#f8f9fa',
            padding: '24px',
            borderRadius: 16,
            marginBottom: 32,
            border: '1px solid #e9ecef'
          }}>
            <div style={{ marginBottom: 16 }}>
              <h3 style={{
                fontSize: 20,
                fontWeight: 600,
                margin: '0 0 8px 0',
                color: '#262626'
              }}>
                🔍 Tìm kiếm & Thêm từ mới
              </h3>
              <p style={{
                fontSize: 14,
                color: '#666',
                margin: 0
              }}>
                Nhập chữ Trung để tìm kiếm hoặc thêm từ mới vào danh sách học
              </p>
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Input
                  placeholder="Nhập hoặc tìm kiếm chữ Trung..."
                  value={searchOrAdd}
                  onChange={e => setSearchOrAdd(e.target.value)}
                  onPressEnter={handleAddIfNotExist}
                  style={{
                    height: 48,
                    fontSize: 16,
                    borderRadius: 12,
                    border: '2px solid #e9ecef'
                  }}
                  allowClear
                />
              </div>
              {!data.some(row => row.chinese === searchOrAdd) && searchOrAdd && (
                <Button
                  type="primary"
                  onClick={handleAddIfNotExist}
                  style={{
                    height: 48,
                    fontSize: 16,
                    fontWeight: 600,
                    borderRadius: 12,
                    padding: '0 24px',
                    background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                    border: 'none'
                  }}
                >
                  ➕ Thêm từ này
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 20,
            marginBottom: 32
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '24px',
              borderRadius: 16,
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📚</div>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{total}</div>
              <div style={{ fontSize: 14, opacity: 0.9 }}>Từ vựng đã học</div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              padding: '24px',
              borderRadius: 16,
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{page}</div>
              <div style={{ fontSize: 14, opacity: 0.9 }}>Trang hiện tại</div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              padding: '24px',
              borderRadius: 16,
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔄</div>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Auto</div>
              <div style={{ fontSize: 14, opacity: 0.9 }}>Dịch thuật tự động</div>
            </div>
          </div>

          {/* Table Section */}
          <div style={{
            background: 'white',
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid #e9ecef',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              padding: '20px 24px',
              background: '#f8f9fa',
              borderBottom: '1px solid #e9ecef'
            }}>
              <h3 style={{
                fontSize: 18,
                fontWeight: 600,
                margin: 0,
                color: '#262626'
              }}>
                📖 Danh sách từ vựng
              </h3>
            </div>

            <div style={{ padding: '0 24px 24px 24px' }}>
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
                  style: { marginTop: 16 }
                }}
                examples={examples}
                onEditChinese={handleEditChinese}
                onEditHanViet={handleEditHanViet}
                onDelete={setDeleteRow}
              />
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