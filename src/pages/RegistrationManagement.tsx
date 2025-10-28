import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Space,
  Button,
  DatePicker,
  Input,
  message,
} from "antd";
import {
  UserOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { registrationService } from "../services/api";
import { Registration } from "../types";
import { useAuth } from "../context/AuthContext";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export const RegistrationManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );

  const debounceRef = useRef<any | null>(null);

  // Function to format age from days to years, months, and days
  const formatAge = (ageInDays: number): string => {
    const years = Math.floor(ageInDays / 365);
    const remainingDays = ageInDays % 365;
    const months = Math.floor(remainingDays / 30);
    const days = remainingDays % 30;

    if (years === 0) {
      if (months === 0) {
        if (days === 0) {
          return "< 1 day";
        } else if (days === 1) {
          return "1 day";
        } else {
          return `${days} days`;
        }
      } else if (months === 1) {
        return days === 0 ? "1 month" : `1m ${days}d`;
      } else {
        return days === 0 ? `${months} months` : `${months}m ${days}d`;
      }
    } else if (months === 0) {
      return days === 0 ? `${years} years` : `${years}y ${days}d`;
    } else {
      const parts = [`${years}y`];
      if (months > 0) parts.push(`${months}m`);
      if (days > 0) parts.push(`${days}d`);
      return parts.join(' ');
    }
  };

  const fetchRegistrations = async (
    search = "",
    dates?: [dayjs.Dayjs, dayjs.Dayjs]
  ) => {
    try {
      setLoading(true);
      let response;
      const obj = {
        search,
        ...(dates &&
          dates?.length > 0 && {
            startDate: dates?.[0].toString() ?? "",
            endDate: dates?.[1].toString() ?? "",
          }),
      };

      if (user?.role === "doctor") {
        response = await registrationService.getRegistrationsByDoctor(
          user.id,
          obj
        );
      } else {
        response = await registrationService.getRegistrations(obj);
      }

      setRegistrations(response.registrations);
    } catch (error: any) {
      message.error("Failed to fetch registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchRegistrations();
  }, [user]);

  const handleSearch = (value: string) => {
    setSearchText(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchRegistrations(value, dateRange ?? undefined);
    }, 500);
  };

  const handleDateChange = (dates: any) => {
    setDateRange(dates);
    fetchRegistrations(searchText, dates ?? undefined);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <Space>
          <UserOutlined />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      render: (_: number, record: Registration) => (
        <Tag color="blue">
          {formatAge(
            record.dob ? dayjs().diff(dayjs(record.dob), "day") : record.age
          )}
        </Tag>
      ),
    },
    {
      title: "Doctor",
      dataIndex: "doctorId",
      key: "doctorId",
      render: (doctor: any) => (
        <Space>
          <UserOutlined className="text-green-500" />
          <Text>{doctor?.username || "Not assigned"}</Text>
        </Space>
      ),
    },
    {
      title: "Symptoms",
      dataIndex: "symptoms",
      key: "symptoms",
      render: (symptoms: string) => (
        <Text type="secondary">{symptoms || "No symptoms provided"}</Text>
      ),
    },
    {
      title: "Registration Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <Space direction="vertical" size={0}>
          <Text>{dayjs(date).format("MMM DD, YYYY")}</Text>
          <Text type="secondary" className="text-xs">
            {dayjs(date).format("h:mm A")}
          </Text>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Registration) => (
        <Button
          icon={<EyeOutlined />}
          size="small"
          onClick={() => navigate(`/registration-detail/${record._id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="mb-2 text-gray-800">
            {user?.role === "doctor"
              ? "My Patient Registrations"
              : "Registration Management"}
          </Title>
          <Text type="secondary">
            {user?.role === "doctor"
              ? "View your patient registrations"
              : "View and manage patient registrations"}
          </Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => fetchRegistrations(searchText, dateRange ?? undefined)}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Input
            placeholder="Search by name or symptoms..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <RangePicker onChange={handleDateChange} />
        </div>

        <Table
          columns={columns}
          dataSource={registrations}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showQuickJumper: true,
            showTotal: (total) => `${total} registrations`,
          }}
        />
      </Card>
    </div>
  );
};
