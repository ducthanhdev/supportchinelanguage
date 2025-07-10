import { Button, Form, Input } from 'antd';

interface WordFormProps {
    onAdd: (values: { chinese: string }) => void;
    form: any;
}

const WordForm = ({ onAdd, form }: WordFormProps) => (
    <Form form={form} layout="inline" onFinish={onAdd} style={{ justifyContent: 'center', marginBottom: 40 }}>
        <Form.Item
            name="chinese"
            rules={[
                { required: true, message: 'Nhập chữ Trung!' },
                { pattern: /^[\u4e00-\u9fff]+$/, message: 'Chỉ nhập chữ Trung!' }
            ]}
            style={{ marginRight: 24 }}
        >
            <Input placeholder="Nhập chữ Trung" style={{ fontSize: 32, height: 64, width: 340, padding: '0 24px' }} />
        </Form.Item>
        <Form.Item
            name="vietnamese"
            rules={[{ required: false }]}
            style={{ marginRight: 24 }}
        >
            <Input placeholder="Nhập nghĩa tiếng Việt (nếu có)" style={{ fontSize: 24, height: 64, width: 340, padding: '0 24px' }} />
        </Form.Item>
        <Form.Item>
            <Button type="primary" htmlType="submit" style={{ fontSize: 32, height: 64, padding: '0 48px' }}>
                Thêm
            </Button>
        </Form.Item>
    </Form>
);

export default WordForm; 