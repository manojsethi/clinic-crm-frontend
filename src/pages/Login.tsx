import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginRequest } from '../types';

const { Title, Text } = Typography;

export const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/dashboard';

    const onFinish = async (values: LoginRequest) => {
        try {
            setLoading(true);
            await login(values);
            message.success('Login successful!');
            navigate(from, { replace: true });
        } catch (error: any) {
            message.error(error.response?.data?.msg || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl">
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🏥</div>
                    <Title level={2} className="mb-2">Clinic CRM</Title>
                    <Text type="secondary">Staff & Admin Login</Text>
                </div>

                <Form
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="username"
                        label="Username"
                        rules={[
                            { required: true, message: 'Please input your username!' }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined className="text-gray-400" />}
                            placeholder="Enter your username"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                            { required: true, message: 'Please input your password!' }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="Enter your password"
                        />
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="w-full h-12 text-lg"
                            loading={loading}
                        >
                            {loading ? <Spin size="small" /> : 'Login'}
                        </Button>
                    </Form.Item>
                </Form>

                <div className="text-center mt-6">
                    <Text type="secondary" className="text-sm">
                        Access the clinic management system
                    </Text>
                </div>
            </Card>
        </div>
    );
};
