import { Input, Modal } from 'antd';

interface EditChineseModalProps {
    open: boolean;
    value: string;
    onChange: (v: string) => void;
    onOk: () => void;
    onCancel: () => void;
    loading: boolean;
    oldChinese?: string;
}

const EditChineseModal = ({
    open, value, onChange, onOk, onCancel, loading, oldChinese
}: EditChineseModalProps) => (
    <Modal
        open={open}
        title={`Sửa chữ Trung cho: ${oldChinese}`}
        onOk={onOk}
        onCancel={onCancel}
        confirmLoading={loading}
    >
        <Input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Nhập chữ Trung mới"
        />
    </Modal>
);

export default EditChineseModal; 