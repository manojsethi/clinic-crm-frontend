import React, { useState } from "react";
import {
  Layout as AntLayout,
  Menu,
  Button,
  Typography,
  Avatar,
  Dropdown,
} from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  QrcodeOutlined,
  FileMarkdownFilled,
  FileMarkdownOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

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
    navigate("/login");
  };

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    ...(user?.role==="admin"?[{
            key: "/users",
            icon: <TeamOutlined />,
            label: "Staff Management",
          }]:[]),

    {
      key: "/registrations",
      icon: <UserOutlined />,
      label: "Patients",
    },
    ...(user?.role === "doctor"
      ? [
          {
            key: "/file-manager",
            icon: <FileMarkdownFilled />,
            label: "File Manager",
          },
        ]
      : []),
    ...(user?.role === "admin"
      ? [
         {
            key: "/devices",
            icon: <TeamOutlined />,
            label: "Clinic Devices",
          },
          
          {
            key: "/scan",
            icon: <QrcodeOutlined />,
            label: "Registration Setup",
          },
          {
            key: "/file-manager",
            icon: <FileMarkdownOutlined />,
            label: "File Manager",
          },
          
         
        ]
      : []),
  ];

  const userMenuItems = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={200}
        style={{
          background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
          boxShadow: "4px 0 24px rgba(0, 0, 0, 0.05)",
          borderRight: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            padding: "16px",
            textAlign: "center",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            🏥
          </div>
          {!collapsed && (
            <Text strong style={{ color: "#1e293b", fontSize: "16px" }}>
              Clinic CRM
            </Text>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: "transparent",
            border: "none",
            height: "calc(100vh - 80px)",
            overflowY: "auto",
          }}
        />
      </Sider>

      <AntLayout>
        <Header
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            borderBottom: "1px solid #e2e8f0",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            height: "64px",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              color: "#64748b",
              fontSize: "18px",
              background: "transparent",
              border: "none",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  background: "#10b981",
                  borderRadius: "50%",
                  animation: "pulse 2s infinite",
                }}
              ></div>
              <Text style={{ color: "#64748b", fontSize: "14px" }}>
                Welcome,{" "}
                <span style={{ fontWeight: "600", color: "#1e293b" }}>
                  {user?.username}
                </span>
              </Text>
            </div>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Avatar
                icon={<UserOutlined />}
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  cursor: "pointer",
                }}
              />
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            background: "#f8fafc",
            padding: "24px",
            minHeight: "calc(100vh - 64px)",
            overflowY: "auto",
          }}
        >
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};
