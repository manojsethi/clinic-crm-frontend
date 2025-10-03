import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Tag, Space, Button, DatePicker, Select, Input, message, Spin } from 'antd';
import { UserOutlined, SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { registrationService } from '../services/api';
import { Registration } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export const RegistrationManagement: React.FC = () => {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [filteredData, setFilteredData] = useState<Registration[]>([]);
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            const data = await registrationService.getRegistrations();
            setRegistrations(data);
            setFilteredData(data);
        } catch (error: any) {
            message.error('Failed to fetch registrations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const handleSearch = (value: string) => {
        setSearchText(value);
        filterData(value, dateRange);
    };

    const handleDateChange = (dates: [dayjs.Dayjs, dayjs.Dayjs] | null) => {
        setDateRange(dates);
        filterData(searchText, dates);
    };

    const filterData = (search: string, dates: [dayjs.Dayjs, dayjs.Dayjs] | null) => {
        let filtered = registrations;

        if (search) {
            filtered = filtered.filter(reg =>
                reg.name.toLowerCase().includes(search.toLowerCase()) ||
                reg.symptoms?.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (dates) {
            const [start, end] = dates;
            filtered = filtered.filter(reg => {
                const regDate = dayjs(reg.createdAt);
                return regDate.isAfter(start) && regDate.isBefore(end);
            });
        }

        setFilteredData(filtered);
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => (
                <Space>
                    <UserOutlined />
                    <Text strong>{text}</Text>
                </Space>
            ),
        },
        {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
            render: (age: number) => <Tag color="blue">{age} years</Tag>,
        },
        {
            title: 'Symptoms',
            dataIndex: 'symptoms',
            key: 'symptoms',
            render: (symptoms: string) => (
                <Text type="secondary">
                    {symptoms || 'No symptoms provided'}
                </Text>
            ),
        },
        {
            title: 'Registration Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => (
                <Space direction="vertical" size={0}>
                    <Text>{dayjs(date).format('MMM DD, YYYY')}</Text>
                    <Text type="secondary" className="text-xs">
                        {dayjs(date).format('h:mm A')}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record: Registration) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => handleViewDetails(record)}
                    >
                        View
                    </Button>
                </Space>
            ),
        },
    ];

    const handleViewDetails = (registration: Registration) => {
        // This would typically open a modal with detailed information
        message.info(`Viewing details for ${registration.name}`);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <Title level={2} className="mb-2 text-gray-800">Registration Management</Title>
                    <Text type="secondary" className="text-gray-600">View and manage patient registrations</Text>
                </div>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchRegistrations}
                    loading={loading}
                    className="border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-500"
                >
                    Refresh
                </Button>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Input
                                placeholder="Search by name or symptoms..."
                                prefix={<SearchOutlined className="text-gray-400" />}
                                value={searchText}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="h-10 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                        <div>
                            <RangePicker
                                placeholder={['Start Date', 'End Date']}
                                onChange={handleDateChange}
                                className="h-10 w-full border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                        <div>
                            <Select
                                placeholder="Filter by status"
                                className="h-10 w-full border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                allowClear
                            >
                                <Option value="today">Today</Option>
                                <Option value="week">This Week</Option>
                                <Option value="month">This Month</Option>
                            </Select>
                        </div>
                    </div>
                </div>

                <Table
                    columns={columns}
                    dataSource={[]}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} registrations`,
                    }}
                    scroll={{ x: 800 }}
                />
            </Card>
        </div>
    );
};
