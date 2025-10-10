import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Space,
  Button,
  message,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { adminService } from "../services/api";
import useApp from "antd/es/app/useApp";
import AddUserModal from "../components/userManagement/AddUser.modal";
import UpdateUserModal from "../components/userManagement/UpdateUser.modal";
import { User } from "../types";

const { Title, Text } = Typography;

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddUser, setIsAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { notification } = useApp();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers();
      setUsers(data.users);
    } catch (error: any) {
      message.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: string) => {
    try {
      await adminService.deleteUser(id);
      notification.success({ message: "User deleted successfully" });
      fetchUsers();
    } catch (error: any) {
      notification.error({ message: "Failed to delete user" });
    }
  };

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (text: string) => (
        <Space>
          <UserOutlined />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={role === "admin" ? "red" : "blue"}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: User) => (
        <Space>
          <Tooltip title="Edit User">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => setEditingUser(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDeleteUser(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete User">
              <Button icon={<DeleteOutlined />} size="small" danger />
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
          <Title level={2} className="mb-2 text-gray-800">
            User Management
          </Title>
          <Text type="secondary" className="text-gray-600">
            Manage staff and admin accounts
          </Text>
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
            onClick={() => setIsAddUser(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 hover:from-blue-600 hover:to-purple-700"
          >
            Add User
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={users}
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
      {isAddUser && (
        <AddUserModal
          isModalVisible={isAddUser}
          handleOnCloseModal={() => {
            setIsAddUser(false);
          }}
          refetch={fetchUsers}
        />
      )}

      {editingUser && (
        <UpdateUserModal
          initialValues={editingUser}
          isModalVisible={!!editingUser}
          handleOnCloseModal={() => {
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
};
