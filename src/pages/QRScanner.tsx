import React, { useState, useEffect } from "react";
import { Card, Typography, Button, Form, Select, message } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { adminService, deviceDoctorMappingService } from "../services/api";
import { useSocket } from "../hooks/useSocket";
import { Device, User } from "../types";
import { useRegistrationContext } from "../context/RegistrationContext";

const { Title, Text } = Typography;

export const QRScanner: React.FC = () => {
  const navigate = useNavigate();
  const { setRegistrationContext } = useRegistrationContext();
  const [devices, setDevices] = useState<Device[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [mappingLoading, setMappingLoading] = useState(false);
  const [form] = Form.useForm();
  const { socket, isConnected } = useSocket();

  const fetchDevicesAndDoctors = async () => {
    try {
      const [devicesResponse, doctorsResponse] = await Promise.all([
        adminService.getDevices({ }),
        adminService.getUsers({ role: "doctor" }),
      ]);

      setDevices(devicesResponse.devices);
      setDoctors(doctorsResponse.users);
    } catch (error: any) {
      console.error("Failed to fetch devices and doctors:", error);
      message.error("Failed to load devices and doctors");
    }
  };

  useEffect(() => {
    fetchDevicesAndDoctors();
  }, []);

  // Live refresh devices list based on socket availability events
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleInUse = async () => {
      try {
        const resp = await adminService.getDevices();
        setDevices(resp.devices);
      } catch (e) {
        // silent
      }
    };

    const handleAvailable = handleInUse;

    socket.on('DEVICE_IN_USE', handleInUse);
    socket.on('DEVICE_AVAILABLE', handleAvailable);

    return () => {
      socket.off('DEVICE_IN_USE', handleInUse);
      socket.off('DEVICE_AVAILABLE', handleAvailable);
    };
  }, [socket, isConnected]);

  const handleOpenRegistration = async (values: {
    deviceId: string;
    doctorId: string;
  }) => {
    try {
      setMappingLoading(true);

      // Create device-doctor mapping
      const mappingResult = await deviceDoctorMappingService.createMapping({
        deviceId: values.deviceId,
        doctorId: values.doctorId,
        notes: `Registration session started at ${new Date().toLocaleString()}`,
      });

       if (mappingResult.success) {
         message.success("Device-Doctor mapping created successfully!");

         // Set registration context with device and doctor info
         const selectedDevice = devices.find(
           (d) => d.deviceId === values.deviceId
         );
         const selectedDoctor = doctors.find((d) => d._id === values.doctorId);

         setRegistrationContext({
           deviceId: values.deviceId,
           doctorId: values.doctorId,
           deviceName: selectedDevice?.deviceName || "",
           doctorName: selectedDoctor?.username || "",
         });

         // Navigate to registration setup page
         navigate("/registration-setup");
       } else {
        message.error(mappingResult.message || "Failed to create mapping");
      }
    } catch (error: any) {
      console.error("Failed to create mapping:", error);
      message.error("Failed to create device-doctor mapping");
    } finally {
      setMappingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                🏥
              </div>
              <div>
                <Title level={3} className="mb-0 text-gray-800">
                  Clinic Registration
                </Title>
                <Text type="secondary" className="text-sm text-gray-600">
                  Patient Registration System
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl  mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Title level={1} className="mb-4 text-gray-800">
            Patient Registration Setup
          </Title>
          <Text type="secondary" className="text-lg text-gray-600">
            Select device and doctor to start patient registration
          </Text>
        </div>

        {/* Device & Doctor Selection */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl  mx-auto">
          <div className="">
            <Form
              form={form}
              onFinish={handleOpenRegistration}
              layout="inline"
              size="large"
              validateTrigger="onSubmit"
              className="flex  items-center gap-4 md:flex-nowrap"
            >
              <Form.Item
                name="deviceId"
                label="Device"
                className="w-[35%]"
                rules={[{ required: true, message: "Please select a device!" }]}
                style={{ marginBottom: 0 }}
              >
                <Select
                  className="w-full"
                  placeholder="Choose device"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {devices.map((device) => (
                    <Select.Option
                      key={device.deviceId}
                      value={device.deviceId}
                    >
                      {device.deviceId}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="doctorId"
                label="Doctor"
                className="w-[35%]"
                rules={[{ required: true, message: "Please select a doctor!" }]}
                style={{ marginBottom: 0 }}
              >
                <Select
                  className="w-full"
                  placeholder="Choose doctor"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {doctors.map((doctor) => (
                    <Select.Option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.username}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                className="w-[20%] flex justify-end"
                style={{ marginBottom: 0 }}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<PlayCircleOutlined />}
                  loading={mappingLoading}
                  className="h-12 px-8 bg-gradient-to-r from-green-500 to-blue-600 border-0 text-white hover:from-green-600 hover:to-blue-700 text-base font-medium"
                >
                  Open Registration
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Card>
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
