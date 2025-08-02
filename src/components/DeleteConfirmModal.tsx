import { Modal } from "antd";

// Định nghĩa kiểu dữ liệu cho props của component
interface DeleteConfirmModalProps {
  open: boolean;
  onOk: () => void;
  onCancel: () => void;
  chinese?: string;
  confirmLoading?: boolean; // Thêm prop này
}

const DeleteConfirmModal = ({
  open,
  onOk,
  onCancel,
  chinese,
  confirmLoading, // Nhận prop này
}: DeleteConfirmModalProps) => {
  return (
    <Modal
      title={`Xác nhận xóa`}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText="Xóa"
      cancelText="Hủy"
      okButtonProps={{ danger: true }}
      confirmLoading={confirmLoading} // Truyền prop vào Modal
    >
      <p>Bạn có chắc muốn xóa từ vựng "{chinese}" không? Hành động này không thể hoàn tác.</p>
    </Modal>
  );
};

export default DeleteConfirmModal;
