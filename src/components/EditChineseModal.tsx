import { Input, Modal, message } from 'antd';

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
}: EditChineseModalProps) => {
    const handleOk = () => {
        if (!/^[\u4e00-\u9fff]+$/.test(value)) {
            message.error('Chỉ nhập chữ Trung!');
            return;
        }
        onOk();
    };
    return (
        <Modal
            open={open}
            title={`Sửa chữ Trung cho: ${oldChinese}`}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
        >
            <Input
                value={value}
                onChange={e => {
                    const val = e.target.value;
                    if (val === '' || /^[\u4e00-\u9fff]+$/.test(val)) onChange(val);
                }}
                placeholder="Nhập chữ Trung mới"
            />
        </Modal>
    );
};

export default EditChineseModal; 