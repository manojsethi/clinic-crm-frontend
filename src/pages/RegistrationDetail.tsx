import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Card, 
    Typography, 
    Tag, 
    Space, 
    Button, 
    Spin, 
    Descriptions, 
    Row, 
    Col,
    message
} from 'antd';
import { 
    UserOutlined, 
    CalendarOutlined, 
    MedicineBoxOutlined, 
    DesktopOutlined, 
    ClockCircleOutlined,
    ArrowLeftOutlined,
    ReloadOutlined,
    IdcardOutlined,
    ContactsOutlined
} from '@ant-design/icons';
import { registrationService } from '../services/api';
import { PopulatedRegistration } from '../types';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;



export const RegistrationDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [registration, setRegistration] = useState<PopulatedRegistration | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const {user}=useAuth()

    const fetchRegistrationDetails = async () => {
        if (!id) {
            setError('Invalid registration ID');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await registrationService.getRegistrationById(id);
            setRegistration(response as unknown as PopulatedRegistration);
        } catch (error: any) {
            console.error('Error fetching registration details:', error);
            setError(error.response?.data?.msg || 'Failed to fetch registration details');
            message.error('Failed to fetch registration details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistrationDetails();
    }, [id]);

    const handleGoBack = () => {
        navigate('/registrations');
    };

    const handleRefresh = () => {
        fetchRegistrationDetails();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <Card className="w-full max-w-2xl shadow-xl text-center">
                    <Spin size="large" />
                    <div className="mt-4">
                        <Text type="secondary">Loading registration details...</Text>
                    </div>
                </Card>
            </div>
        );
    }

    if (error || !registration) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-2xl shadow-xl">
                    <div className="text-center">
                        <div className="text-6xl mb-4">❌</div>
                        <Title level={3} className="mb-4">Registration Not Found</Title>
                        <Text type="secondary" className="mb-6 block">
                            {error || 'The registration you are looking for does not exist or has been removed.'}
                        </Text>
                        <Space>
                            <Button 
                                icon={<ArrowLeftOutlined />} 
                                onClick={handleGoBack}
                                type="primary"
                            >
                                Go Back
                            </Button>
                            <Button 
                                icon={<ReloadOutlined />} 
                                onClick={handleRefresh}
                            >
                                Retry
                            </Button>
                        </Space>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <Title level={2} className="mb-2 text-gray-800">
                            Registration Details
                        </Title>
                        <Text type="secondary" className="text-gray-600">
                            Complete patient registration information
                        </Text>
                    </div>
                    <Space>
                        <Button 
                            icon={<ReloadOutlined />} 
                            onClick={handleRefresh}
                            loading={loading}
                            className="border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-500"
                        >
                            Refresh
                        </Button>
                        <Button 
                            icon={<ArrowLeftOutlined />} 
                            onClick={handleGoBack}
                            type="primary"
                        >
                            Back to List
                        </Button>
                    </Space>
                </div>

                {/* Main Content */}
                <Row gutter={[24, 24]}>
                    {/* Patient Information */}
                    <Col xs={24} lg={12}>
                        <Card 
                            title={
                                <Space>
                                    <UserOutlined className="text-blue-500" />
                                    <span>Patient Information</span>
                                </Space>
                            }
                            className="shadow-xl border-0"
                        >
                            <Descriptions column={1} >
                                <Descriptions.Item 
                                    label={
                                        <Space>
                                            <UserOutlined />
                                            <span> Name</span>
                                        </Space>
                                    }
                                >
                                    <Text strong className="text-lg">
                                        {registration.name}
                                    </Text>
                                </Descriptions.Item>
                                
                                <Descriptions.Item 
                                    label={
                                        <Space>
                                            <CalendarOutlined />
                                            <span>Date of Birth</span>
                                        </Space>
                                    }
                                >
                                    <Text>{dayjs(registration.dob).format('MMMM DD, YYYY')}</Text>
                                </Descriptions.Item>
                                
                                <Descriptions.Item 
                                    label={
                                        <Space>
                                            <CalendarOutlined />
                                            <span>Age</span>
                                        </Space>
                                    }
                                >
                                    <Tag color="blue" className="text-base px-3 py-1">
                                        {registration.age} years old
                                    </Tag>
                                </Descriptions.Item>
                                
                                <Descriptions.Item 
                                    label={
                                        <Space>
                                            <UserOutlined />
                                            <span>Sex</span>
                                        </Space>
                                    }
                                >
                                    <Tag color="green">{registration.sex}</Tag>
                                </Descriptions.Item>
                                
                                
                                <Descriptions.Item 
                                    label={
                                        <Space>
                                            <ClockCircleOutlined />
                                            <span>Registration Time</span>
                                        </Space>
                                    }
                                >
                                    <Space direction="vertical" size={0}>
                                        <Text strong>{dayjs(registration.createdAt).format('MMMM DD, YYYY')}</Text>
                                        <Text type="secondary">
                                            {dayjs(registration.createdAt).format('h:mm A')}
                                        </Text>
                                    </Space>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>

                    {/* Contact Information */}
                    <Col xs={24} lg={12}>
                        <Card 
                            title={
                                <Space>
                                    <ContactsOutlined className="text-green-500" />
                                    <span>Contact Information</span>
                                </Space>
                            }
                            className="shadow-xl border-0 mb-6"
                        >
                            {registration.address && (
                                <div className="mb-4">
                                    <Text type="secondary" className="text-sm">Address</Text>
                                    <div>
                                        <Text>{registration.address}</Text>
                                    </div>
                                </div>
                            )}
                            
                            {registration.contactNumber && (
                                <div className="mb-4">
                                    <Text type="secondary" className="text-sm">Contact Number</Text>
                                    <div>
                                        <Text>{registration.contactNumber}</Text>
                                    </div>
                                </div>
                            )}
                            
                            {registration.email && (
                                <div className="mt-4">
                                    <Text type="secondary" className="text-sm">Email</Text>
                                    <div>
                                        <Text>{registration.email}</Text>
                                    </div>
                                </div>
                            )}
                        </Card>

                    </Col>
                </Row>

                {/* Medical Information Row */}
                <Row gutter={[24, 24]} className="mt-6">
                    {/* Medical Information */}
                    <Col xs={24} lg={16}>
                        <Card 
                            title={
                                <Space>
                                    <MedicineBoxOutlined className="text-red-500" />
                                    <span>Medical Information</span>
                                </Space>
                            }
                            className="shadow-xl border-0"
                        >
                            <Row gutter={[16, 16]}>
                                {registration.allergies && (
                                    <Col xs={24} sm={12}>
                                        <div>
                                            <Text type="secondary" className="text-sm">Allergies</Text>
                                            <div>
                                                <Text>{registration.allergies}</Text>
                                            </div>
                                        </div>
                                    </Col>
                                )}
                                {registration.currentMedicalIllness && (
                                    <Col xs={24} sm={12}>
                                        <div>
                                            <Text type="secondary" className="text-sm">Current Medical Illness</Text>
                                            <div>
                                                <Text>{registration.currentMedicalIllness}</Text>
                                            </div>
                                        </div>
                                    </Col>
                                )}
                            </Row>

                            {registration.symptoms && (
                                <div className="mt-4">
                                    <Text type="secondary" className="text-sm">Symptoms/Concerns</Text>
                                    <div>
                                        <Text>{registration.symptoms}</Text>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </Col>

                    {/* Device & Doctor Information */}
                    <Col xs={24} lg={8}>
                        <Space direction="vertical" size="large" className="w-full">
                            {/* Device Information */}
                            <Card 
                                title={
                                    <Space>
                                        <DesktopOutlined className="text-green-500" />
                                        <span>Device Information</span>
                                    </Space>
                                }
                                className="shadow-xl border-0"
                            >
                                {registration.deviceId ? (
                                    <Space direction="vertical" size="middle" className="w-full">
                                        <div>
                                            <Text type="secondary" className="text-sm">Device Name</Text>
                                            <div>
                                                <Text strong className="text-base">
                                                    {registration.deviceId.deviceName}
                                                </Text>
                                            </div>
                                        </div>
                                        {registration.deviceId.roomName && (
                                            <div>
                                                <Text type="secondary" className="text-sm">Room</Text>
                                                <div>
                                                    <Tag color="green">
                                                        {registration.deviceId.roomName}
                                                    </Tag>
                                                </div>
                                            </div>
                                        )}
                                    </Space>
                                ) : (
                                    <Text type="secondary" italic>
                                        No device information available
                                    </Text>
                                )}
                            </Card>

                          
                         {user?.role==="admin"&&   <Card 
                                title={
                                    <Space>
                                        <MedicineBoxOutlined className="text-purple-500" />
                                        <span>Assigned Doctor</span>
                                    </Space>
                                }
                                className="shadow-xl border-0"
                            >
                                {registration.doctorId ? (
                                    <Space direction="vertical" size="middle" className="w-full">
                                        <div>
                                            <Text type="secondary" className="text-sm">Doctor Name</Text>
                                            <div>
                                                <Text strong className="text-base">
                                                    Dr. {registration.doctorId.username}
                                                </Text>
                                            </div>
                                        </div>
                                       
                                    </Space>
                                ) : (
                                    <Text type="secondary" italic>
                                        No doctor assigned
                                    </Text>
                                )}
                            </Card>}
                        </Space>
                    </Col>
                </Row>

                {/* Token Information */}
                {registration.tokenId && (
                    <Card 
                        title={
                            <Space>
                                <IdcardOutlined className="text-orange-500" />
                                <span>Token Information</span>
                            </Space>
                        }
                        className="shadow-xl border-0"
                    >
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12}>
                                <div>
                                    <Text type="secondary" className="text-sm">Token ID</Text>
                                    <div>
                                        <Text code className="text-sm">
                                            {registration.tokenId.token}
                                        </Text>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} sm={12}>
                                <div>
                                    <Text type="secondary" className="text-sm">Token Created</Text>
                                    <div>
                                        <Text>
                                            {dayjs(registration.tokenId.createdAt).format('MMM DD, YYYY h:mm A')}
                                        </Text>
                                    </div>
                                </div>
                            </Col>
                            {registration.tokenId.consumedAt && (
                                <Col xs={24} sm={12}>
                                    <div>
                                        <Text type="secondary" className="text-sm">Token Consumed</Text>
                                        <div>
                                            <Text>
                                                {dayjs(registration.tokenId.consumedAt).format('MMM DD, YYYY h:mm A')}
                                            </Text>
                                        </div>
                                    </div>
                                </Col>
                            )}
                        </Row>
                    </Card>
                )}
                <br/>

                {/* Status Information */}
                <Card className="shadow-xl border-0">
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} sm={12}>
                            <Space>
                                <Text strong>Registration Status:</Text>
                                <Tag color="green" className="text-base px-3 py-1">
                                    Completed
                                </Tag>
                            </Space>
                        </Col>
                       
                    </Row>
                </Card>
            </div>
        </div>
    );
};
