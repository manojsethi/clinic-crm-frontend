import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, Statistic, Row, Col, message, Spin } from 'antd';
import { QrcodeOutlined, ReloadOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { QRDisplay } from '../components/QRDisplay';
import { useSocket } from '../hooks/useSocket';
import { qrService } from '../services/api';
import { QRData } from '../types';

const { Title, Text } = Typography;

export const Dashboard: React.FC = () => {
    const [qrData, setQrData] = useState<QRData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { qr: socketQr, isConnected } = useSocket();

    const fetchQR = async () => {
        try {
            setLoading(true);
            const data = await qrService.getCurrentQR();
            setQrData(data);
        } catch (error: any) {
            message.error('Failed to fetch QR code');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            await fetchQR();
            message.success('QR Code refreshed!');
        } catch (error) {
            message.error('Failed to refresh QR code');
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchQR();
    }, []);

    // Update QR when socket receives new data
    useEffect(() => {
        if (socketQr) {
            setQrData(prev => prev ? { ...prev, token: socketQr } : null);
        }
    }, [socketQr]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Title level={2} className="mb-2 text-gray-800">Clinic Dashboard</Title>
                    <Text type="secondary" className="text-gray-600">Manage patient registrations and QR codes</Text>
                </div>
                <Space>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={handleRefresh}
                        loading={refreshing}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white hover:from-blue-600 hover:to-purple-700"
                    >
                        Refresh QR
                    </Button>
                </Space>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card className="h-full">
                        <div className="text-center mb-6">
                            <Title level={3} className="mb-2">Current QR Code</Title>
                            <Text type="secondary">
                                {isConnected ? 'Connected to server' : 'Disconnected from server'}
                            </Text>
                        </div>

                        <QRDisplay
                            qrCode={qrData?.token || ''}
                            isLoading={loading}
                            title="Patient Registration QR"
                            description="Patients can scan this QR code to register"
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Space direction="vertical" size="large" className="w-full">
                        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                            <Statistic
                                title="Connection Status"
                                value={isConnected ? 'Connected' : 'Disconnected'}
                                valueStyle={{ color: isConnected ? '#10b981' : '#ef4444' }}
                                prefix={<div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>}
                            />
                        </Card>

                        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                            <Statistic
                                title="QR Status"
                                value={qrData?.valid ? 'Valid' : 'Invalid'}
                                valueStyle={{ color: qrData?.valid ? '#10b981' : '#ef4444' }}
                                prefix={<ClockCircleOutlined className="text-blue-500" />}
                            />
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <UserOutlined className="text-white text-xl" />
                                </div>
                                <Title level={4} className="mb-1 text-gray-800">Quick Actions</Title>
                                <Text type="secondary" className="block mb-4 text-gray-600">
                                    Manage your clinic operations
                                </Text>
                                <Button
                                    type="primary"
                                    block
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 border-0 hover:from-purple-600 hover:to-pink-600"
                                >
                                    View Registrations
                                </Button>
                            </div>
                        </Card>
                    </Space>
                </Col>
            </Row>
        </div>
    );
};
