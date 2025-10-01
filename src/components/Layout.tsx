import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Button, Typography, Avatar, Dropdown } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    TeamOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = AntLayout;
const { Text } = Typography;

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/registrations',
            icon: <UserOutlined />,
            label: 'Registrations',
        },
        ...(user?.role === 'admin' ? [{
            key: '/users',
            icon: <TeamOutlined />,
            label: 'User Management',
        }] : []),
    ];

    const userMenuItems = [
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: handleLogout,
        },
    ];

    return (
        <AntLayout className="min-h-screen">
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                className="bg-white shadow-lg"
            >
                <div className="p-4 text-center border-b">
                    <Text strong className="text-lg">🏥 Clinic CRM</Text>
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                    className="border-0"
                />
            </Sider>

            <AntLayout>
                <Header className="bg-white shadow-sm flex items-center justify-between px-6">
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-lg"
                    />

                    <div className="flex items-center space-x-4">
                        <Text className="text-sm text-gray-600">
                            Welcome, {user?.username}
                        </Text>
                        <Dropdown
                            menu={{ items: userMenuItems }}
                            placement="bottomRight"
                            arrow
                        >
                            <Avatar
                                icon={<UserOutlined />}
                                className="cursor-pointer hover:bg-blue-100"
                            />
                        </Dropdown>
                    </div>
                </Header>

                <Content className="p-6 bg-gray-50 min-h-screen">
                    {children}
                </Content>
            </AntLayout>
        </AntLayout>
    );
};
