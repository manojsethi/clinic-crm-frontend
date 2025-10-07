import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, InputNumber, Button, Card, Typography, message, Spin } from 'antd';
import { UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { qrService, registrationService } from '../services/api';
import { RegistrationData } from '../types';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const Registration: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const tokenId = searchParams.get('token');
    const deviceId = searchParams.get('deviceId');
    const doctorId = searchParams.get('doctorId');
    const roomId = searchParams.get('roomId');
    const consumedRef = useRef(false);

    useEffect(() => {
      if (!tokenId || consumedRef.current) return;
      consumedRef.current = true;
      qrService.consumeQr(tokenId, deviceId || undefined, doctorId || undefined, roomId || undefined);
    }, [tokenId, deviceId, doctorId, roomId]);

    const onFinish = async (values: RegistrationData) => {
        if (!tokenId) {
            message.error('Invalid registration link');
            return;
        }

        try {
            setLoading(true);
            await registrationService.createRegistration(tokenId, values);
            message.success('Registration successful! You will be called shortly.');

            // Reset form after successful submission
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error: any) {
            message.error(error.response?.data?.msg || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    if (!tokenId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-xl text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <Title level={3} className="mb-2">Invalid Link</Title>
                    <Text type="secondary">This registration link is not valid.</Text>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg shadow-xl">
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🏥</div>
                    <Title level={2} className="mb-2">Patient Registration</Title>
                    <Text type="secondary">Please fill in your details to register</Text>
                </div>

                <Form
                    name="registration"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="name"
                        label="Full Name"
                        rules={[
                            { required: true, message: 'Please input your full name!' },
                            { min: 2, message: 'Name must be at least 2 characters!' }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined className="text-gray-400" />}
                            placeholder="Enter your full name"
                        />
                    </Form.Item>

                    <Form.Item
                        name="age"
                        label="Age"
                        rules={[
                            { required: true, message: 'Please input your age!' },
                            { type: 'number', min: 1, max: 120, message: 'Age must be between 1 and 120!' }
                        ]}
                    >
                        <InputNumber
                            className="w-full"
                            prefix={<CalendarOutlined className="text-gray-400" />}
                            placeholder="Enter your age"
                            min={1}
                            max={120}
                        />
                    </Form.Item>

                    <Form.Item
                        name="symptoms"
                        label="Symptoms (Optional)"
                        rules={[
                            { max: 500, message: 'Symptoms description must be less than 500 characters!' }
                        ]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Describe your symptoms or concerns (optional)"
                            showCount
                            maxLength={500}
                        />
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="w-full h-12 text-lg"
                            loading={loading}
                        >
                            {loading ? <Spin size="small" /> : 'Register as Patient'}
                        </Button>
                    </Form.Item>
                </Form>

                <div className="text-center mt-6">
                    <Text type="secondary" className="text-sm">
                        Your information will be securely stored and used for medical purposes only
                    </Text>
                </div>
            </Card>
        </div>
    );
};
