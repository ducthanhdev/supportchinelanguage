import React from 'react';
import { Button, Input, Space } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { WordRow } from '../types/word';
import { DeleteOutlined, EditOutlined, SoundOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

// Định nghĩa props cho hook
interface useWordTableColumnsProps {
    page: number;
    pageSize: number;
    speakChinese: (text: string) => void;
    handleEditHanViet: (row: WordRow) => void;
    handleEditVietnamese: (row: WordRow) => void;
    handleTranslateVietnamese: (row: WordRow) => void;
    examples: { [key: string]: string };
    setExampleModal: (state: { open: boolean, example: string }) => void;
    userChineseInputs: { [key: string]: string };
    handleUserChineseChange: (key: string, value: string, chinese: string) => void;
    userChineseStatus: { [key: string]: 'correct' | 'incorrect' | undefined };
    handleEditChinese: (row: WordRow) => void;
    setDeleteRow: (row: WordRow | null) => void;
    translateLoading: { [key: string]: boolean };
}

const useWordTableColumns = ({
    page,
    pageSize,
    speakChinese,
    handleEditHanViet,
    handleEditVietnamese,
    handleTranslateVietnamese,
    examples,
    setExampleModal,
    userChineseInputs,
    handleUserChineseChange,
    userChineseStatus,
    handleEditChinese,
    setDeleteRow,
    translateLoading,
}: useWordTableColumnsProps): ColumnsType<WordRow> => {
    return [
        {
            title: 'STT',
            dataIndex: 'key',
            key: 'stt',
            width: 80,
            render: (_: any, __: any, index: number) => (page - 1) * pageSize + index + 1,
        },
        {
            title: 'Chữ Trung',
            dataIndex: 'chinese',
            key: 'chinese',
            render: (text: string) => (
                <Space>
                    {text}
                    <Tooltip title="Phát âm">
                        <Button type="text" icon={<SoundOutlined style={{ color: '#1890ff' }} />} onClick={() => speakChinese(text)} />
                    </Tooltip>
                </Space>
            ),
        },
        {
            title: 'Hán Việt',
            dataIndex: 'hanViet',
            key: 'hanViet',
            render: (text: string, row: WordRow) => (
                <Space>
                    <span>{text}</span>
                    <Tooltip title="Sửa Hán Việt">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEditHanViet(row)}
                        />
                    </Tooltip>
                </Space>
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
                <Space>
                    <span>{text}</span>
                    <Tooltip title="Sửa nghĩa tiếng Việt">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEditVietnamese(row)}
                        />
                    </Tooltip>
                    <Tooltip title="Dịch lại tự động">
                        <Button
                            type="text"
                            icon={<SoundOutlined />}
                            onClick={() => handleTranslateVietnamese(row)}
                            loading={translateLoading[row.key] || false}
                        />
                    </Tooltip>
                </Space>
            ),
        },
        {
            title: 'Ví dụ',
            key: 'example',
            render: (_: any, row: WordRow) => {
                const example = row.key in examples ? examples[row.key] : 'loading...';
                if (example && example !== 'loading...' && example.length > 10) {
                    return (
                        <Tooltip title="Xem đầy đủ ví dụ">
                            <span
                                dangerouslySetInnerHTML={{ __html: example.substring(0, 20) + '...' }}
                                style={{ cursor: 'pointer', color: '#1890ff' }}
                                onClick={() => setExampleModal({ open: true, example })}
                            />
                        </Tooltip>
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
                <Input
                    value={userChineseInputs[String(row.key)] || ''}
                    onChange={e => handleUserChineseChange(String(row.key), e.target.value, row.chinese)}
                    status={
                        userChineseStatus[String(row.key)] === 'incorrect'
                            ? 'error'
                            : undefined
                    }
                    style={{
                        borderColor: userChineseStatus[String(row.key)] === 'correct' ? '#52c41a' : undefined,
                    }}
                    onCopy={e => e.preventDefault()}
                    onPaste={e => e.preventDefault()}
                    onCut={e => e.preventDefault()}
                    allowClear
                />
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 120,
            render: (_: any, row: WordRow) => (
                <Space>
                    <Tooltip title="Sửa chữ Trung">
                        <Button
                            type="text"
                            icon={<EditOutlined style={{ color: '#1890ff' }} />}
                            onClick={() => handleEditChinese(row)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa từ">
                        <Button
                            type="text"
                            icon={<DeleteOutlined style={{ color: 'red' }} />}
                            onClick={() => setDeleteRow(row)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];
};

export default useWordTableColumns;
