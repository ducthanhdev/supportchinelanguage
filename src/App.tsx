import { DeleteOutlined, EditOutlined, SoundOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Select } from 'antd';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { addWord, deleteWord, getExamples, getWords, updateHanViet, updateWord } from './api/wordApi';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import EditChineseModal from './components/EditChineseModal';
import EditHanVietModal from './components/EditHanVietModal';
import ExampleModal from './components/ExampleModal';
import WordTable from './components/WordTable';
import { WordRow } from './types/word';

const App = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<WordRow[]>([]);
  const [editingRow, setEditingRow] = useState<WordRow | null>(null);
  const [hanVietInput, setHanVietInput] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleAdd = async (values: { chinese: string }) => {
    try {
      const res = await addWord(values.chinese);
      const word = res.data as any;
      setData(prev => [...prev, { ...word, key: word._id || word.key }]);
      form.resetFields();
      toast.success('Thêm từ thành công!');
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
    fetchExamples();
  }, [data]);

  useEffect(() => {
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
    fetchWords();
  }, [page, pageSize]);

  useEffect(() => {
    if (!searchOrAdd) {
      setFilteredData(data);
    } else {
      setFilteredData(
        data.filter(row => row.chinese.includes(searchOrAdd))
      );
    }
  }, [searchOrAdd, data]);

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

  // Hàm phát âm chữ Trung với voice đã chọn
  const speakChinese = (text: string) => {
    if ('speechSynthesis' in window) {
      const utter = new window.SpeechSynthesisUtterance(text);
      const zhVoice = voices.find(v => v.name === selectedVoice);
      if (zhVoice) utter.voice = zhVoice;
      utter.lang = 'zh-CN';
      window.speechSynthesis.speak(utter);
    } else {
      toast.error('Trình duyệt không hỗ trợ phát âm!');
    }
  };

  // Thêm hàm rút gọn tên voice
  function getDisplayVoiceName(voice: SpeechSynthesisVoice) {
    const match = voice.name.match(/Microsoft\s+([A-Za-z]+)\s/);
    const shortName = match ? match[1] : voice.name;
    let region = '';
    if (voice.lang.includes('HK')) region = ' (Hồng Kông)';
    else if (voice.lang.includes('TW')) region = ' (Đài Loan)';
    else if (voice.lang.includes('CN')) region = ' (Trung Quốc đại lục)';
    return shortName + region;
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
          <Button style={{ marginLeft: 12 }} onClick={() => handleEditVietnamese(row)}>
            Sửa
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
      <h2 style={{ fontSize: 44, fontWeight: 800, textAlign: 'center', marginBottom: 40, letterSpacing: 2 }}>Hỗ trợ học tiếng Trung</h2>
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
    </div>
  );
};

export default App; 