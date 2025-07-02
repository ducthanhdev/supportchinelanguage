import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { WordRow } from '../types/word';

interface WordTableProps {
    data: WordRow[];
    columns: ColumnsType<WordRow>;
    pagination: any;
    examples: { [key: string]: string };
    onEditChinese: (row: WordRow) => void;
    onEditHanViet: (row: WordRow) => void;
    onDelete: (row: WordRow) => void;
}

const WordTable = ({ data, columns, pagination, examples, onEditChinese, onEditHanViet, onDelete }: WordTableProps) => {
    // columns có thể cần custom render lại để truyền callback
    const enhancedColumns = columns.map(col => {
        if (col.key === 'hanViet') {
            return {
                ...col,
                render: (text: string, row: WordRow) => (
                    <>
                        {text}
                        <Button style={{ marginLeft: 12 }} onClick={() => onEditHanViet(row)}>
                            Sửa
                        </Button>
                    </>
                ),
            };
        }
        if (col.key === 'example') {
            return {
                ...col,
                render: (_: any, row: WordRow) => (
                    <span dangerouslySetInnerHTML={{ __html: (row.key in examples) ? (examples[row.key] || '') : 'loading...' }} />
                ),
            };
        }
        if (col.key === 'action') {
            return {
                ...col,
                render: (_: any, row: WordRow) => (
                    <>
                        <EditOutlined style={{ color: '#1890ff', fontSize: 20, marginRight: 16, cursor: 'pointer' }} onClick={() => onEditChinese(row)} />
                        <DeleteOutlined style={{ color: 'red', fontSize: 20, cursor: 'pointer' }} onClick={() => onDelete(row)} />
                    </>
                ),
            };
        }
        return col;
    });

    return (
        <Table
            columns={enhancedColumns}
            dataSource={data}
            pagination={pagination}
            style={{ marginTop: 32 }}
            rowKey="key"
            bordered
            scroll={{ x: 'max-content' }}
        />
    );
};

export default WordTable; 