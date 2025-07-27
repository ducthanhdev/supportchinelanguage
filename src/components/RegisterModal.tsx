import { BookOutlined, IdcardOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Divider, Form, Input, message, Modal, Typography } from 'antd';
import { useState } from 'react';
import { register } from '../api/authApi';
import { RegisterRequest } from '../types/user';

const { Title, Text } = Typography;

interface RegisterModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (token: string, user: any) => void;
    onSwitchToLogin: () => void;
}

const RegisterModal = ({ open, onClose, onSuccess, onSwitchToLogin }: RegisterModalProps) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values: RegisterRequest) => {
        setLoading(true);
        try {
            const response = await register(values);
            const { token, user } = response.data;

            if (token && user) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                message.success('Đăng ký thành công!');
                onSuccess(token, user);
                form.resetFields();
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Lỗi đăng ký';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onClose}
            footer={null}
            width={550}
            centered
            style={{ top: 20 }}
            bodyStyle={{ padding: '40px 50px' }}
        >
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <div style={{
                    fontSize: 48,
                    color: '#1890ff',
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <BookOutlined />
                </div>
                <Title level={2} style={{ margin: 0, color: '#262626' }}>
                    Tạo tài khoản mới
                </Title>
                <Text type="secondary" style={{ fontSize: 16 }}>
                    Đăng ký để bắt đầu học tiếng Trung
                </Text>
            </div>

            <Form
                form={form}
                onFinish={handleSubmit}
                layout="vertical"
                size="large"
                style={{ marginTop: 20 }}
            >
                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item
                        name="username"
                        style={{ flex: 1 }}
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                            { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' },
                            { max: 30, message: 'Tên đăng nhập không được quá 30 ký tự!' },
                            { pattern: /^[a-zA-Z0-9_]+$/, message: 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới!' }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Tên đăng nhập"
                            style={{ height: 50, fontSize: 16 }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="displayName"
                        style={{ flex: 1 }}
                        rules={[
                            { required: true, message: 'Vui lòng nhập họ tên!' },
                            { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự!' }
                        ]}
                    >
                        <Input
                            prefix={<IdcardOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Họ tên"
                            style={{ height: 50, fontSize: 16 }}
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: 'Vui lòng nhập email!' },
                        { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                >
                    <Input
                        prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                        placeholder="Email"
                        style={{ height: 50, fontSize: 16 }}
                    />
                </Form.Item>

                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item
                        name="password"
                        style={{ flex: 1 }}
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Mật khẩu"
                            style={{ height: 50, fontSize: 16 }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        style={{ flex: 1 }}
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Xác nhận mật khẩu"
                            style={{ height: 50, fontSize: 16 }}
                        />
                    </Form.Item>
                </div>

                <Form.Item style={{ marginTop: 30 }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        style={{
                            width: '100%',
                            height: 50,
                            fontSize: 16,
                            fontWeight: 600,
                            borderRadius: 8
                        }}
                    >
                        Đăng ký
                    </Button>
                </Form.Item>
            </Form>

            <Divider style={{ margin: '30px 0' }}>
                <Text type="secondary">hoặc</Text>
            </Divider>

            <div style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 16 }}>
                    Đã có tài khoản?{' '}
                </Text>
                <Button
                    type="link"
                    onClick={onSwitchToLogin}
                    style={{
                        padding: 0,
                        fontSize: 16,
                        fontWeight: 600,
                        color: '#1890ff'
                    }}
                >
                    Đăng nhập ngay
                </Button>
            </div>
        </Modal>
    );
};

export default RegisterModal; 