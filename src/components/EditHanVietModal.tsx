import { Input, Modal } from 'antd';

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
}: EditHanVietModalProps) => (
    <Modal
        open={open}
        title={`Sửa nghĩa Hán Việt cho: ${oldChinese}`}
        onOk={onOk}
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

export default EditHanVietModal; 