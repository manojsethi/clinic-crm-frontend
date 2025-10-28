import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Tag,
  Space,
  Button,
  Spin,
  Descriptions,
  Row,
  Col,
  message,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  ContactsOutlined,
  EditOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { registrationService } from "../services/api";
import { PopulatedRegistration } from "../types";
import dayjs from "dayjs";
import { useAuth } from "../context/AuthContext";
import MDEditor from "@uiw/react-md-editor";

const { Title, Text } = Typography;

export const RegistrationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [registration, setRegistration] =
    useState<PopulatedRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingAdvice, setIsEditingAdvice] = useState(false);
  const [adviceContent, setAdviceContent] = useState("");
  const [savingAdvice, setSavingAdvice] = useState(false);
  const { user } = useAuth();

  // Function to format age from days to years, months, and days
  const formatAge = (ageInDays: number): string => {
    const years = Math.floor(ageInDays / 365);
    const remainingDays = ageInDays % 365;
    const months = Math.floor(remainingDays / 30);
    const days = remainingDays % 30;

    if (years === 0) {
      if (months === 0) {
        if (days === 0) {
          return "Less than 1 day old";
        } else if (days === 1) {
          return "1 day old";
        } else {
          return `${days} days old`;
        }
      } else if (months === 1) {
        return days === 0 ? "1 month old" : `1 month ${days} days old`;
      } else {
        return days === 0 ? `${months} months old` : `${months} months ${days} days old`;
      }
    } else if (months === 0) {
      return days === 0 ? `${years} years old` : `${years} years ${days} days old`;
    } else {
      const parts = [`${years} years`];
      if (months > 0) parts.push(`${months} months`);
      if (days > 0) parts.push(`${days} days`);
      return `${parts.join(' ')} old`;
    }
  };

  const fetchRegistrationDetails = async () => {
    if (!id) {
      setError("Invalid registration ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await registrationService.getRegistrationById(id);
      setRegistration(response as unknown as PopulatedRegistration);
    } catch (error: any) {
      console.error("Error fetching registration details:", error);
      setError(
        error.response?.data?.msg || "Failed to fetch registration details"
      );
      message.error("Failed to fetch registration details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrationDetails();
  }, [id]);

  const handleGoBack = () => {
    navigate("/registrations");
  };

  const handleRefresh = () => {
    fetchRegistrationDetails();
  };

  const handleEditAdvice = () => {
    setAdviceContent(registration?.doctorAdvice || "");
    setIsEditingAdvice(true);
  };

  const handleCancelEdit = () => {
    setIsEditingAdvice(false);
    setAdviceContent("");
  };

  const handleSaveAdvice = async () => {
    if (!id) return;

    try {
      setSavingAdvice(true);
      const response = await registrationService.updateRegistrationAdvice(id, adviceContent);
      setRegistration(response.registration as PopulatedRegistration);
      setIsEditingAdvice(false);
      message.success("Doctor advice saved successfully");
    } catch (error: any) {
      message.error(error.response?.data?.msg || "Failed to save advice");
    } finally {
      setSavingAdvice(false);
    }
  };

  const canEditAdvice = () => {
    if (!user || !registration) return false;
    // Only doctors can edit advice, and only the assigned doctor for this registration
    return user.role === 'doctor' && registration.doctorId?._id === user.id;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-2xl shadow-xl text-center">
          <Spin size="large" />
          <div className="mt-4">
            <Text type="secondary">Loading registration details...</Text>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-xl">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <Title level={3} className="mb-4">
              Registration Not Found
            </Title>
            <Text type="secondary" className="mb-6 block">
              {error ||
                "The registration you are looking for does not exist or has been removed."}
            </Text>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={handleGoBack}
                type="primary"
              >
                Go Back
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                Retry
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[94vh] bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Title level={2} className="mb-2 text-gray-800">
              Registration Details
            </Title>
            <Text type="secondary" className="text-gray-600">
              Complete patient registration information
            </Text>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
              className="border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-500"
            >
              Refresh
            </Button>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleGoBack}
              type="primary"
            >
              Back to List
            </Button>
          </Space>
        </div>

        {/* Main Content */}
        <Row gutter={[24, 24]}>
          {/* Patient Information */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <UserOutlined className="text-blue-500" />
                  <span>Patient Information</span>
                </Space>
              }
              className="shadow-xl border-0"
            >
              <Descriptions column={1}>
                <Descriptions.Item
                  label={
                    <Space>
                      <UserOutlined />
                      <span> Name</span>
                    </Space>
                  }
                >
                  <Text strong className="text-lg">
                    {registration.name}
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <Space>
                      <CalendarOutlined />
                      <span>Date of Birth</span>
                    </Space>
                  }
                >
                  <Text>{dayjs(registration.dob).format("YYYY MMMM DD")}</Text>
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <Space>
                      <CalendarOutlined />
                      <span>Age</span>
                    </Space>
                  }
                >
                  <Tag color="blue" className="text-base px-3 py-1">
                    {formatAge(
                      registration.dob
                        ? dayjs().diff(dayjs(registration.dob), "day")
                        : registration.age
                    )}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <Space>
                      <UserOutlined />
                      <span>Sex</span>
                    </Space>
                  }
                >
                  <Tag color="green">{registration.sex}</Tag>
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <Space>
                      <ClockCircleOutlined />
                      <span>Registration Time</span>
                    </Space>
                  }
                >
                  <Space direction="vertical" size={0}>
                    <Text strong>
                      {dayjs(registration.createdAt).format("MMMM DD, YYYY")}
                    </Text>
                    <Text type="secondary">
                      {dayjs(registration.createdAt).format("h:mm A")}
                    </Text>
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Contact Information */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <ContactsOutlined className="text-green-500" />
                  <span>Contact Information</span>
                </Space>
              }
              className="shadow-xl border-0 mb-6"
            >
              {registration.address && (
                <div className="mb-4">
                  <Text type="secondary" className="text-sm">
                    Address
                  </Text>
                  <div>
                    <Text>{registration.address}</Text>
                  </div>
                </div>
              )}

              {registration.contactNumber && (
                <div className="mb-4">
                  <Text type="secondary" className="text-sm">
                    Contact Number
                  </Text>
                  <div>
                    <Text>{registration.contactNumber}</Text>
                  </div>
                </div>
              )}

              {registration.email && (
                <div className="mt-4">
                  <Text type="secondary" className="text-sm">
                    Email
                  </Text>
                  <div>
                    <Text>{registration.email}</Text>
                  </div>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Doctor Information Row */}
        {registration.doctorId && (
          <Row gutter={[24, 24]} className="mt-6">
            <Col xs={24}>
              <Card
                title={
                  <Space>
                    <UserOutlined className="text-purple-500" />
                    <span>Assigned Doctor</span>
                  </Space>
                }
                className="shadow-xl border-0"
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text type="secondary" className="text-sm">
                        Doctor Name
                      </Text>
                      <div>
                        <Text strong className="text-lg">
                          Dr. {registration.doctorId.username}
                        </Text>
                      </div>
                    </div>
                  </Col>
                
                </Row>
              </Card>
            </Col>
          </Row>
        )}

        {/* Medical Information Row */}
        <Row gutter={[24, 24]} className="mt-6">
          {/* Medical Information */}
          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  <MedicineBoxOutlined className="text-red-500" />
                  <span>Medical Information</span>
                </Space>
              }
              className="shadow-xl border-0"
            >
              <Row gutter={[16, 16]}>
                {registration.allergies && (
                  <Col xs={24} sm={12}>
                    <div>
                      <Text type="secondary" className="text-sm">
                        Allergies
                      </Text>
                      <div>
                        <Text>{registration.allergies}</Text>
                      </div>
                    </div>
                  </Col>
                )}
                {registration.currentMedicalIllness && (
                  <Col xs={24} sm={12}>
                    <div>
                      <Text type="secondary" className="text-sm">
                        Current Medical Illness
                      </Text>
                      <div>
                        <Text>{registration.currentMedicalIllness}</Text>
                      </div>
                    </div>
                  </Col>
                )}
              </Row>

              {registration.symptoms && (
                <div className="mt-4">
                  <Text type="secondary" className="text-sm">
                    Symptoms/Concerns
                  </Text>
                  <div>
                    <Text>{registration.symptoms}</Text>
                  </div>
                </div>
              )}
            </Card>
          </Col>

    
        </Row>

        {/* Doctor Advice Section */}
        <Card
          title={
            <Space>
              <MedicineBoxOutlined className="text-purple-500" />
              <span>Doctor's Advice</span>
            </Space>
          }
          className="shadow-xl border-0"
          extra={
            canEditAdvice() && !isEditingAdvice && (
              <Button
                icon={<EditOutlined />}
                onClick={handleEditAdvice}
                type="primary"
                ghost
              >
                Edit Advice
              </Button>
            )
          }
        >
          {isEditingAdvice ? (
            <div>
              <MDEditor
                value={adviceContent}
                onChange={(val) => setAdviceContent(val || "")}
                height={300}
                data-color-mode="light"
              />
              <div className="mt-4 flex justify-end space-x-2">
                <Button onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSaveAdvice}
                  loading={savingAdvice}
                >
                  Save Advice
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {registration?.doctorAdvice ? (
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: registration.doctorAdvice.replace(/\n/g, '<br>') 
                  }}
                />
              ) : (
                <div className="text-center pt-8 text-gray-500">
                  <MedicineBoxOutlined className="text-4xl mb-2" />
                  <Text type="secondary">
                    {canEditAdvice() 
                      ? "No advice provided yet. Click 'Edit Advice' to add your recommendations."
                      : "No advice provided for this patient. Only the assigned doctor can provide advice."
                    }
                  </Text>
                </div>
              )}
            </div>
          )}
        </Card>

    
   
      </div>
    </div>
  );
};
