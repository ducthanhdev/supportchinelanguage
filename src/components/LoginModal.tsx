import { BookOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Divider, Form, Input, message, Modal, Typography } from 'antd';
import { useState } from 'react';
import { login } from '../api/authApi';
import { LoginRequest } from '../types/user';

const { Title, Text } = Typography;

interface LoginModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (token: string, user: any) => void;
    onSwitchToRegister: () => void;
}

const LoginModal = ({ open, onClose, onSuccess, onSwitchToRegister }: LoginModalProps) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values: LoginRequest) => {
        setLoading(true);
        try {
            const response = await login(values);
            const { token, user } = response.data;

            if (token && user) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                message.success('Đăng nhập thành công!');
                onSuccess(token, user);
                form.resetFields();
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Lỗi đăng nhập';
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
            width={500}
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
                    Chào mừng trở lại!
                </Title>
                <Text type="secondary" style={{ fontSize: 16 }}>
                    Đăng nhập để tiếp tục học tiếng Trung
                </Text>
            </div>

            <Form
                form={form}
                onFinish={handleSubmit}
                layout="vertical"
                size="large"
                style={{ marginTop: 20 }}
            >
                <Form.Item
                    name="username"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên đăng nhập hoặc email!' }
                    ]}
                >
                    <Input
                        prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                        placeholder="Tên đăng nhập hoặc email"
                        style={{ height: 50, fontSize: 16 }}
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu!' }
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                        placeholder="Mật khẩu"
                        style={{ height: 50, fontSize: 16 }}
                    />
                </Form.Item>

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
                        Đăng nhập
                    </Button>
                </Form.Item>
            </Form>

            <Divider style={{ margin: '30px 0' }}>
                <Text type="secondary">hoặc</Text>
            </Divider>

            <div style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 16 }}>
                    Chưa có tài khoản?{' '}
                </Text>
                <Button
                    type="link"
                    onClick={onSwitchToRegister}
                    style={{
                        padding: 0,
                        fontSize: 16,
                        fontWeight: 600,
                        color: '#1890ff'
                    }}
                >
                    Đăng ký ngay
                </Button>
            </div>
        </Modal>
    );
};

export default LoginModal; 