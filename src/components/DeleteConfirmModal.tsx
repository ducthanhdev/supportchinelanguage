import { Modal } from 'antd';

interface DeleteConfirmModalProps {
    open: boolean;
    onOk: () => void;
    onCancel: () => void;
    chinese?: string;
}

const DeleteConfirmModal = ({ open, onOk, onCancel, chinese }: DeleteConfirmModalProps) => (
    <Modal
        open={open}
        title="Xác nhận xóa từ"
        onOk={onOk}
        onCancel={onCancel}
        okText="Xóa"
        okButtonProps={{ danger: true }}
        cancelText="Hủy"
    >
        <div>Bạn có chắc chắn muốn xóa từ <b>{chinese}</b> không?</div>
    </Modal>
);

export default DeleteConfirmModal; 