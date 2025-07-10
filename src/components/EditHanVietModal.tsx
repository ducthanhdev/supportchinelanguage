import { Input, Modal, message } from 'antd';

interface EditHanVietModalProps {
    open: boolean;
    value: string;
    onChange: (v: string) => void;
    onOk: () => void;
    onCancel: () => void;
    loading: boolean;
    oldChinese?: string;
}

const EditHanVietModal = ({
    open, value, onChange, onOk, onCancel, loading, oldChinese
}: EditHanVietModalProps) => {
    const handleOk = () => {
        if (!value.trim()) {
            message.error('Không được để trống nghĩa Hán Việt!');
            return;
        }
        onOk();
    };
    return (
        <Modal
            open={open}
            title={`Sửa nghĩa Hán Việt cho: ${oldChinese}`}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
        >
            <Input
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder="Nhập nghĩa Hán Việt mới"
            />
        </Modal>
    );
};

export default EditHanVietModal; 