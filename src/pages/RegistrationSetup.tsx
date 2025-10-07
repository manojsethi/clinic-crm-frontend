import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Steps, Tag, message, Space, Tooltip } from 'antd';
import { QrcodeOutlined, CameraOutlined, UserOutlined, CheckCircleOutlined, MedicineBoxOutlined, LaptopOutlined, ArrowLeftOutlined, CopyOutlined, ReloadOutlined, LinkOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { QRDisplay } from '../components/QRDisplay';
import { useSocket } from '../hooks/useSocket';
import { qrService } from '../services/api';
import { QRData } from '../types';
import { useRegistrationContext } from '../context/RegistrationContext';

const { Title, Text } = Typography;

export const RegistrationSetup: React.FC = () => {
    const navigate = useNavigate();
    const { deviceId, doctorId } = useRegistrationContext();
    const [qrData, setQrData] = useState<QRData | null>(null);
    const [loading, setLoading] = useState(true);
    const [composedQR, setComposedQR] = useState<string>("");
    const { qr: socketQr, isConnected } = useSocket();
    const [isCopying, setIsCopying] = useState(false);

    const fetchQR = async () => {
        try {
            setLoading(true);
            const data = await qrService.getCurrentQR();
            setQrData(data);
        } catch (error: any) {
            console.error('Failed to fetch QR code:', error);
        } finally {
            setLoading(false);
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

    // Compose QR with device and doctor information
    useEffect(() => {
        const currentToken = qrData?.token || socketQr || "";
        if (currentToken && deviceId && doctorId) {
            const url = `${window.location.origin}/register?token=${encodeURIComponent(currentToken)}&deviceId=${encodeURIComponent(deviceId)}&doctorId=${encodeURIComponent(doctorId)}`;
            setComposedQR(url);
        }
    }, [qrData, socketQr, deviceId, doctorId]);

    const handleManualEntry = () => {
        const token = prompt('Please enter your registration token:');
        if (token) {
            navigate(`/register?token=${token}`);
        }
    };

    const handleBack = () => {
        navigate('/scan');
    };

    const handleCopyLink = async () => {
        if (!composedQR) {
            message.warning('QR link not ready yet');
            return;
        }
        try {
            setIsCopying(true);
            await navigator.clipboard.writeText(composedQR);
            message.success('Registration link copied');
        } catch (e) {
            message.error('Failed to copy link');
        } finally {
            setIsCopying(false);
        }
    };

    const handleRefreshQR = async () => {
        try {
            setLoading(true);
            const fresh = await qrService.getQR();
            setQrData(fresh);
            message.success('QR refreshed');
        } catch (e) {
            message.error('Failed to refresh QR');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        {
            title: 'Open Camera',
            description: 'Open your phone camera or QR scanner app',
            icon: <CameraOutlined />
        },
        {
            title: 'Scan QR Code',
            description: 'Point your camera at the QR code displayed at the clinic',
            icon: <QrcodeOutlined />
        },
        {
            title: 'Register',
            description: 'You will be redirected to the registration form',
            icon: <CheckCircleOutlined />
        }
    ];

    if (!deviceId || !doctorId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-xl text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <Title level={3} className="mb-2">Invalid Setup</Title>
                    <Text type="secondary">Device and doctor information is missing.</Text>
                    <Button type="primary" onClick={handleBack} className="mt-4">
                        Go Back
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Modern Header */}
            <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center space-x-4">
                            <Button 
                                type="text" 
                                icon={<ArrowLeftOutlined />} 
                                onClick={handleBack}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                Back
                            </Button>
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                🏥
                            </div>
                            <div>
                                <Title level={3} className="mb-0 text-gray-800">Patient Registration</Title>
                                <Text type="secondary" className="text-sm text-gray-600">Registration Session Active</Text>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                            <Text className="text-sm font-medium text-gray-700">
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </Text>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-10">
                {/* Heading & Context */}
                <div className="mb-8">
                    <Title level={2} className="mb-1 text-gray-900">Patient Registration Setup</Title>
                    <Text type="secondary" className="text-base text-gray-600">Scan the QR to open the registration form on the patient device.</Text>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* QR Code Section */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-md">
                            <QRDisplay
                                qrCode={composedQR || qrData?.token || socketQr || ''}
                                isLoading={loading}
                                title="Registration QR Code"
                                description="Scan this QR code with your phone camera"
                            />
                            <div className="mt-4 flex items-center justify-between">
                                <Space>
                                    <Tooltip title="Copy registration link">
                                        <Button icon={<CopyOutlined />} onClick={handleCopyLink} loading={isCopying}>
                                            Copy Link
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="Open link in new tab">
                                        <Button icon={<LinkOutlined />} disabled={!composedQR} onClick={() => composedQR && window.open(composedQR, '_blank')}>Open Link</Button>
                                    </Tooltip>
                                </Space>
                                <Tooltip title="Refresh QR">
                                    <Button icon={<ReloadOutlined />} onClick={handleRefreshQR} loading={loading}>
                                        Refresh
                                    </Button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>

                    {/* Instructions Section */}
                    <div className="space-y-6">
                        <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                            <div className="p-6">
                                <div className="flex items-center mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white mr-3">
                                        📱
                                    </div>
                                    <Title level={3} className="mb-0 text-gray-800">How to Register</Title>
                                </div>

                                <Steps
                                    direction="vertical"
                                    size="default"
                                    items={steps}
                                    className="mb-8"
                                />

                                <Button
                                    size="large"
                                    icon={<UserOutlined />}
                                    className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white hover:from-blue-600 hover:to-purple-700 text-base font-medium"
                                    onClick={handleManualEntry}
                                >
                                    Enter Token Manually
                                </Button>

                                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                                    <Text type="secondary" className="text-sm text-center block text-gray-600">
                                        <strong className="text-gray-800">Need help?</strong> Ask the clinic staff for assistance.
                                    </Text>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Modern Footer */}
            <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 mt-16">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="text-center">
                        <Text className="text-sm text-gray-600">
                            © 2024 Clinic Registration System. All rights reserved.
                        </Text>
                    </div>
                </div>
            </div>
        </div>
    );
};
