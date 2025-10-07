import { Button, Form, Input, Select, Space } from "antd";
import { useForm } from "antd/es/form/Form";
import { User, UserManagementRequest } from "../../types";

const UserManagementForm = ({
  handleOnSubmit,
  handleOnCancel,
  loading,
  buttonTitle = "Submit",
  hidePassword,
  initialValues,
}: {
  handleOnSubmit: (val: UserManagementRequest) => void;
  handleOnCancel: () => void;
  loading?: boolean;
  buttonTitle: string;
  initialValues?: User;
  hidePassword?: boolean;
}) => {
  const [form] = useForm();

  return (
    <Form
      initialValues={initialValues}
      form={form}
      layout="vertical"
      onFinish={handleOnSubmit}
    >
      <Form.Item
        name="username"
        label="Username"
        rules={[
          { required: true, message: "Please input username!" },
          { min: 3, message: "Username must be at least 3 characters!" },
        ]}
      >
        <Input placeholder="Enter username" />
      </Form.Item>

      {!hidePassword && (
        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: "Please input password!" },
            { min: 6, message: "Password must be at least 6 characters!" },
          ]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>
      )}

      <Form.Item
        name="role"
        label="Role"
        rules={[{ required: true, message: "Please select a role!" }]}
      >
        <Select placeholder="Select role">
          <Select.Option value="staff">Staff</Select.Option>
          <Select.Option value="admin">Admin</Select.Option>
          <Select.Option value="doctor">Doctor</Select.Option>
        </Select>
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

export default UserManagementForm;
