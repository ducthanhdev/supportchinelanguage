import { Modal } from 'antd';

interface ExampleModalProps {
    open: boolean;
    example: string;
    onClose: () => void;
}

const ExampleModal = ({ open, example, onClose }: ExampleModalProps) => (
    <Modal
        open={open}
        title="Ví dụ câu tiếng Trung"
        onOk={onClose}
        onCancel={onClose}
        footer={null}
    >
        <div style={{ fontSize: 22 }}>{example}</div>
    </Modal>
);

export default ExampleModal; 