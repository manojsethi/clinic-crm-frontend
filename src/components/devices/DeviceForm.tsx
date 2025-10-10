import { Button, Form, Input, Select, Space } from "antd";
import { useForm } from "antd/es/form/Form";
import { Device, DeviceRequest, User } from "../../types";
import { useEffect, useState } from "react";
import { adminService } from "../../services/api";

const DeviceForm = ({
  handleOnSubmit,
  handleOnCancel,
  loading,
  buttonTitle = "Submit",
  initialValues,
}: {
  handleOnSubmit: (val: DeviceRequest) => void;
  handleOnCancel: () => void;
  loading?: boolean;
  buttonTitle?: string;
  initialValues?: Partial<Device>;
}) => {
  const [form] = useForm();
  const [doctors, setDoctors] = useState<User[]>([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await adminService.getUsers({ role: "doctor" });
        setDoctors(data.users || []);
      } catch (e) {
        setDoctors([]);
      }
    };
    fetchDoctors();
  }, []);

  return (
    <Form
      initialValues={initialValues}
      form={form}
      layout="vertical"
      onFinish={handleOnSubmit}
    >
      <Form.Item
        name="deviceId"
        label="Device ID"
        rules={[
          { required: true, message: "Please input device ID!" },
          { min: 1, message: "Device ID cannot be empty!" },
          { max: 50, message: "Device ID cannot exceed 50 characters!" }
        ]}
      >
        <Input placeholder="Enter unique device ID" maxLength={50} />
      </Form.Item>

      <Form.Item
        name="deviceName"
        label="Device Name"
        rules={[{ required: true, message: "Please input device name!" }]}
      >
        <Input placeholder="Enter device name" />
      </Form.Item>

    
      <Form.Item className="mb-0">
        <Space className="w-full justify-end">
          <Button onClick={handleOnCancel}>Cancel</Button>
          <Button loading={loading} type="primary" htmlType="submit">
            {buttonTitle}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default DeviceForm;


