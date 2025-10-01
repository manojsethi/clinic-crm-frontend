import React from 'react';
import { Card, Typography, Spin } from 'antd';
import { QrcodeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface QRDisplayProps {
    qrCode: string;
    isLoading?: boolean;
    title?: string;
    description?: string;
}

export const QRDisplay: React.FC<QRDisplayProps> = ({
    qrCode,
    isLoading = false,
    title = 'Clinic QR Code',
    description = 'Scan this QR code to register as a patient'
}) => {
    return (
        <Card className="w-full max-w-md mx-auto text-center">
            <div className="mb-4">
                <QrcodeOutlined className="text-4xl text-blue-600 mb-2" />
                <Title level={3} className="mb-2">{title}</Title>
                <Text type="secondary" className="block mb-4">{description}</Text>
            </div>

            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 min-h-[200px] flex items-center justify-center">
                {isLoading ? (
                    <div className="text-center">
                        <Spin size="large" />
                        <Text className="block mt-2">Generating QR Code...</Text>
                    </div>
                ) : qrCode ? (
                    <div className="w-full">
                        <img
                            src={qrCode}
                            alt="QR Code"
                            className="w-full h-auto max-w-[200px] mx-auto"
                        />
                    </div>
                ) : (
                    <div className="text-center text-gray-500">
                        <QrcodeOutlined className="text-3xl mb-2" />
                        <Text>No QR Code Available</Text>
                    </div>
                )}
            </div>
        </Card>
    );
};
