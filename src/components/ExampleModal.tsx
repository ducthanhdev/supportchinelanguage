import { Modal } from 'antd';

interface ExampleModalProps {
    open: boolean;
    example: string;
    onClose: () => void;
}

const ExampleModal = ({ open, example, onClose }: ExampleModalProps) => (
    <Modal
        open={open}
        title={
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 18,
                fontWeight: 600
            }}>
                📝 Ví dụ câu tiếng Trung
            </div>
        }
        onOk={onClose}
        onCancel={onClose}
        footer={[
            <button
                key="close"
                onClick={onClose}
                style={{
                    background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 500
                }}
            >
                Đóng
            </button>
        ]}
        width={600}
        centered
    >
        <div style={{
            fontSize: 18,
            lineHeight: 1.6,
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: 12,
            border: '1px solid #e9ecef',
            marginTop: 16,
            textAlign: 'center',
            fontFamily: '"Microsoft YaHei", "SimSun", sans-serif'
        }}>
            {example}
        </div>
        <div style={{
            marginTop: 16,
            fontSize: 14,
            color: '#666',
            textAlign: 'center'
        }}>
            💡 Click "Đóng" để quay lại danh sách từ vựng
        </div>
    </Modal>
);

export default ExampleModal; 