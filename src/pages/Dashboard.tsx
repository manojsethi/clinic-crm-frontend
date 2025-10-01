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
            const data = await qrService.getQR();
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
            <div className="flex justify-between items-center">
                <div>
                    <Title level={2} className="mb-2">Clinic Dashboard</Title>
                    <Text type="secondary">Manage patient registrations and QR codes</Text>
                </div>
                <Space>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={handleRefresh}
                        loading={refreshing}
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
                        <Card>
                            <Statistic
                                title="Connection Status"
                                value={isConnected ? 'Connected' : 'Disconnected'}
                                valueStyle={{ color: isConnected ? '#3f8600' : '#cf1322' }}
                                prefix={isConnected ? <QrcodeOutlined /> : <QrcodeOutlined />}
                            />
                        </Card>

                        <Card>
                            <Statistic
                                title="QR Status"
                                value={qrData?.valid ? 'Valid' : 'Invalid'}
                                valueStyle={{ color: qrData?.valid ? '#3f8600' : '#cf1322' }}
                                prefix={<ClockCircleOutlined />}
                            />
                        </Card>

                        <Card>
                            <div className="text-center">
                                <UserOutlined className="text-4xl text-blue-500 mb-2" />
                                <Title level={4} className="mb-1">Quick Actions</Title>
                                <Text type="secondary" className="block mb-4">
                                    Manage your clinic operations
                                </Text>
                                <Button type="primary" block>
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
