import React, { useState, useEffect } from "react";
import { Table, Card, Typography, Space, Button, message, Popconfirm, Tooltip } from "antd";
import {
  HddOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { adminService } from "../services/api";
import useApp from "antd/es/app/useApp";
import { Device } from "../types";
import AddDeviceModal from "../components/devices/AddDevice.modal";
import UpdateDeviceModal from "../components/devices/UpdateDevice.modal";

const { Title, Text } = Typography;

 const Devices: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDevice, setIsAddDevice] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const { notification } = useApp();

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDevices();
      console.log(data,"heyoo")
      setDevices(data?.devices || []);
    } catch (error: any) {
      message.error("Failed to fetch devices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleDeleteDevice = async (id: string) => {
    try {
      await adminService.deleteDevice(id);
      notification.success({ message: "Device deleted successfully" });
      fetchDevices();
    } catch (error: any) {
      notification.error({ message: "Failed to delete device" });
    }
  };

  const columns = [
    {
      title: "Device ID",
      dataIndex: "deviceId",
      key: "deviceId",
      render: (text: string) => (
        <Space>
          <HddOutlined />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Device Name",
      dataIndex: "deviceName",
      key: "deviceName",
    },
   
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Device) => (
        <Space>
          <Tooltip title="Edit Device">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => setEditingDevice(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this device?"
            onConfirm={() => handleDeleteDevice(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Device">
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
           Devices
          </Title>
          <Text type="secondary" className="text-gray-600">
            Manage all devices
          </Text>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchDevices}
            loading={loading}
            className="border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-500"
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddDevice(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 hover:from-blue-600 hover:to-purple-700"
          >
            Add Device
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={devices}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} devices`,
          }}
        />
      </Card>
      {isAddDevice && (
        <AddDeviceModal
          isModalVisible={isAddDevice}
          handleOnCloseModal={() => setIsAddDevice(false)}
          refetch={fetchDevices}
        />
      )}

      {editingDevice && (
        <UpdateDeviceModal
          initialValues={editingDevice}
          isModalVisible={!!editingDevice}
          handleOnCloseModal={() => setEditingDevice(null)}
          refetch={fetchDevices}
        />
      )}
    </div>
  );
};

export default Devices;