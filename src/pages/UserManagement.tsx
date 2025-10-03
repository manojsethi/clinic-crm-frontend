import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Typography,
    Tag,
    Space,
    Button,
    Modal,
    Form,
    Input,
    Select,
    message,
    Popconfirm,
    Tooltip
} from 'antd';
import {
    UserOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    TeamOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { adminService } from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

interface User {
    id: string;
    username: string;
    role: 'admin' | 'staff';
    createdAt: string;
}

export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [form] = Form.useForm();

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getUsers();
            setUsers(data);
        } catch (error: any) {
            message.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async (values: any) => {
        try {
            await adminService.createUser(values);
            message.success('User created successfully');
            setModalVisible(false);
            form.resetFields();
            fetchUsers();
        } catch (error: any) {
            message.error(error.response?.data?.msg || 'Failed to create user');
        }
    };

    const handleDeleteUser = async (id: string) => {
        try {
            await adminService.deleteUser(id);
            message.success('User deleted successfully');
            fetchUsers();
        } catch (error: any) {
            message.error('Failed to delete user');
        }
    };

    const openModal = (user?: User) => {
        setEditingUser(user || null);
        setModalVisible(true);
        if (user) {
            form.setFieldsValue(user);
        } else {
            form.resetFields();
        }
    };

    const columns = [
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            render: (text: string) => (
                <Space>
                    <UserOutlined />
                    <Text strong>{text}</Text>
                </Space>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => (
                <Tag color={role === 'admin' ? 'red' : 'blue'}>
                    {role.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: User) => (
                <Space>
                    <Tooltip title="Edit User">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => openModal(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Are you sure you want to delete this user?"
                        onConfirm={() => handleDeleteUser(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete User">
                            <Button
                                icon={<DeleteOutlined />}
                                size="small"
                                danger
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <Title level={2} className="mb-2 text-gray-800">User Management</Title>
                    <Text type="secondary" className="text-gray-600">Manage staff and admin accounts</Text>
                </div>
                <Space>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchUsers}
                        loading={loading}
                        className="border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-500"
                    >
                        Refresh
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => openModal()}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 hover:from-blue-600 hover:to-purple-700"
                    >
                        Add User
                    </Button>
                </Space>
            </div>

            <Card>
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
                            `${range[0]}-${range[1]} of ${total} users`,
                    }}
                />
            </Card>

            <Modal
                title={editingUser ? 'Edit User' : 'Create New User'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={500}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateUser}
                >
                    <Form.Item
                        name="username"
                        label="Username"
                        rules={[
                            { required: true, message: 'Please input username!' },
                            { min: 3, message: 'Username must be at least 3 characters!' }
                        ]}
                    >
                        <Input placeholder="Enter username" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                            { required: true, message: 'Please input password!' },
                            { min: 6, message: 'Password must be at least 6 characters!' }
                        ]}
                    >
                        <Input.Password placeholder="Enter password" />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="Role"
                        rules={[{ required: true, message: 'Please select a role!' }]}
                    >
                        <Select placeholder="Select role">
                            <Option value="staff">Staff</Option>
                            <Option value="admin">Admin</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <Space className="w-full justify-end">
                            <Button onClick={() => setModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingUser ? 'Update' : 'Create'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
