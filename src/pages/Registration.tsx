import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Select,
  DatePicker,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  MedicineBoxOutlined,
  MailOutlined,
  ContactsOutlined,
} from "@ant-design/icons";
import { useSearchParams, useNavigate } from "react-router-dom";
import { qrService, registrationService } from "../services/api";
import { RegistrationData } from "../types";
import useApp from "antd/es/app/useApp";
import { useSocket } from "../hooks/useSocket";
import { useRegistrationContext } from "../context/RegistrationContext";
import dayjs from "dayjs";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { isValidPhoneNumber } from "libphonenumber-js";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export const Registration: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [existingRegistration, setExistingRegistration] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState<any>("in");
  const [calculatedAge, setCalculatedAge] = useState<string>("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { notification } = useApp();
  const { socket, consumeQR: socketConsumeQR, joinRoom } = useSocket();
  const { clearRegistrationContext } = useRegistrationContext();
  const tokenId = searchParams.get("token");
  const [roomId, setRoomId] = useState<string | null>(null);

  // Function to calculate age from date of birth
  const calculateAge = (dob: dayjs.Dayjs | null) => {
    if (!dob) {
      setCalculatedAge("");
      return;
    }

    const today = dayjs();
    const days = today.diff(dob, "day");
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;
    const months = Math.floor(remainingDays / 30);
    const remainingDaysInMonth = remainingDays % 30;

    // Format age with years, months, and days
    if (years === 0) {
      if (months === 0) {
        if (days === 0) {
          setCalculatedAge("Less than 1 day old");
        } else if (days === 1) {
          setCalculatedAge("1 day old");
        } else {
          setCalculatedAge(`${days} days old`);
        }
      } else if (months === 1) {
        setCalculatedAge(remainingDaysInMonth === 0 ? "1 month old" : `1 month ${remainingDaysInMonth} days old`);
      } else {
        setCalculatedAge(remainingDaysInMonth === 0 ? `${months} months old` : `${months} months ${remainingDaysInMonth} days old`);
      }
    } else if (months === 0) {
      setCalculatedAge(remainingDaysInMonth === 0 ? `${years} years old` : `${years} years ${remainingDaysInMonth} days old`);
    } else {
      const parts = [`${years} years`];
      if (months > 0) parts.push(`${months} months`);
      if (remainingDaysInMonth > 0) parts.push(`${remainingDaysInMonth} days`);
      setCalculatedAge(`${parts.join(' ')} old`);
    }
  };

  // Validate token on page load
  useEffect(() => {
    const validateToken = async () => {
      if (!tokenId) {
        setValidatingToken(false);
        setTokenValid(false);
        return;
      }

      try {
        const tokenValidation = await qrService.validateToken(tokenId);
        setTokenValid(tokenValidation.token?.tokenInfo?.valid);
        
        // Extract roomId from token validation response
        const tokenRoomId = tokenValidation.token?.tokenInfo?.roomId;
        if (tokenRoomId) {
          setRoomId(tokenRoomId);
          console.log("🏠 RoomId extracted from token:", tokenRoomId);
        } else {
          console.log("⚠️ No roomId found in token");
        }

        // Always try to fetch existing registration data, regardless of token validity
        try {
          const registration = await registrationService.getRegistrationByToken(
            tokenId
          );
          setExistingRegistration(registration);
          console.log("Found existing registration:", registration);
        } catch (error) {
          console.log("No existing registration found for token");
          setExistingRegistration(null);
        }
      } catch (error) {
        console.error("Token validation error:", error);
        setTokenValid(false);

        // Even if token validation fails, try to fetch existing registration
        try {
          const registration = await registrationService.getRegistrationByToken(
            tokenId
          );
          setExistingRegistration(registration);
          console.log(
            "Found existing registration despite token validation failure:",
            registration
          );
        } catch (regError) {
          console.log("No existing registration found");
          setExistingRegistration(null);
        }
      } finally {
        setValidatingToken(false);
      }
    };

    validateToken();
  }, [tokenId]);

  // Join room when page loads (but don't consume QR yet)
  useEffect(() => {
    const joinRoomIfNeeded = async () => {
      if (!socket || !roomId) return;

      try {
        console.log("🏠 Joining room:", roomId);
        joinRoom(roomId);
        console.log("✅ Room joined successfully");
      } catch (error: any) {
        console.error("❌ Failed to join room:", error);
      }
    };

    // Join room when socket is connected and roomId is available
    if (socket && roomId) {
      joinRoomIfNeeded();
    }
  }, [socket, roomId, joinRoom]);

  // Calculate age when existing registration data is loaded
  useEffect(() => {
    if (existingRegistration && existingRegistration.dob) {
      calculateAge(dayjs(existingRegistration.dob));
    }
  }, [existingRegistration]);

  // Listen for device available event to clear registration context
  useEffect(() => {
    if (!socket) return;

    const handleDeviceAvailable = (data: { deviceId: string }) => {
      console.log(
        "📡 [REGISTRATION] Device available event received:",
        data.deviceId
      );
      // Clear the registration context when device becomes available
      clearRegistrationContext();
    };

    socket.on("DEVICE_AVAILABLE", handleDeviceAvailable);

    return () => {
      socket.off("DEVICE_AVAILABLE", handleDeviceAvailable);
    };
  }, [socket, clearRegistrationContext]);

  const onFinish = async (values: any) => {
    if (!tokenId) {
      message.error("Invalid registration link");
      return;
    }

    try {
      setLoading(true);

      // Transform form values to match the expected format
      const registrationData: RegistrationData = {
        // Patient Information
        name: values.name,
        age: values.dob ? dayjs().diff(values.dob, "day") : 0, // Store age in days for precision
        sex: values.sex,
        dob: values.dob ? values.dob.format("YYYY-MM-DD") : undefined,

        // Contact Information
        address: values.address,
        contactNumber: values.contactNumber,
        email: values.email,

        // Medical Information
        allergies: values.allergies,
        currentMedicalIllness: values.currentMedicalIllness,
        symptoms: values.symptoms,
      };

      // If token is valid, create new registration
      if (tokenValid) {
        const response = await registrationService.createRegistration(
          tokenId,
          registrationData
        );

        notification.success({
          message:
            response.msg ||
            "Registration successful! You will be called shortly.",
        });

        // Consume QR to generate new one for the room
        try {
          console.log(
            "🔄 Consuming QR after successful registration:",
            tokenId,
            "with roomId:",
            roomId
          );
          socketConsumeQR(tokenId, roomId || undefined);
          console.log("✅ QR consumption initiated after form submission");
        } catch (qrError: any) {
          console.error(
            "❌ QR consumption failed after registration:",
            qrError
          );
          // Don't show error to user as registration was successful
        }

        // Redirect to home page after successful registration
        navigate("/");
      } else if (existingRegistration) {
        // Token is consumed but registration exists, update the existing registration
        try {
          const response = await registrationService.updateRegistrationByToken(
            tokenId,
            registrationData
          );

          notification.success({
            message:
              response.msg || "Registration information updated successfully!",
          });

          // Redirect to home page
          navigate("/");
        } catch (error: any) {
          message.error(
            error.response?.data?.msg || "Failed to update registration"
          );
        }
      } else {
        // Token is invalid and no existing registration, still try to create registration
        try {
          await registrationService.createRegistration(
            tokenId,
            registrationData
          );

          notification.success({
            message: "Registration information submitted successfully!",
          });

          // Redirect to home page
          navigate("/");
        } catch (error: any) {
          // If registration creation fails due to invalid token, show a different message
          notification.warning({
            message:
              "Information submitted. Please contact the clinic for further assistance.",
          });

          // Redirect to home page
          navigate("/");
        }
      }
    } catch (error: any) {
      message.error(error.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while validating token
  if (validatingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl text-center">
          <div className="text-6xl mb-4">⏳</div>
          <Title level={3} className="mb-2">
            Validating Link
          </Title>
          <Text type="secondary">
            Please wait while we validate your registration link...
          </Text>
        </Card>
      </div>
    );
  }

  // Show error only if no token or no existing registration data
  if (!tokenId || (tokenValid === false && !existingRegistration)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl text-center">
          <div className="text-6xl mb-4">❌</div>
          <Title level={3} className="mb-2">
            Invalid Link
          </Title>
          <Text type="secondary">
            {!tokenId
              ? "This registration link is not valid."
              : "This registration link has expired or is invalid."}
          </Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <span className="text-2xl text-white">🏥</span>
          </div>
          <Title level={1} className="text-2xl font-bold text-gray-800 mb-2">
            {tokenValid ? "Patient Registration" : "Registration Information"}
          </Title>
          <Text className="text-gray-600">
            {tokenValid
              ? "Please provide your information to complete registration"
              : existingRegistration
              ? "Your registration has been completed. You can view and edit your information below."
              : "Please provide your information to complete registration"}
          </Text>
          {!tokenValid && existingRegistration && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
              <Text className="text-green-700 text-sm">
                ✅ Registration completed on{" "}
                {new Date(existingRegistration.createdAt).toLocaleDateString()}
              </Text>
            </div>
          )}
          {!tokenValid && !existingRegistration && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Text className="text-yellow-700 text-sm">
                ⚠️ This registration link has expired, but you can still provide
                your information
              </Text>
            </div>
          )}
        </div>

        <Card className="shadow-lg border border-gray-200 rounded-lg">
          <Form
            form={form}
            name="registration"
            onFinish={onFinish}
            layout="vertical"
            size="middle"
            scrollToFirstError
            className="p-4"
            initialValues={
              existingRegistration
                ? {
                    name: existingRegistration.name,
                    sex: existingRegistration.sex,
                    dob: existingRegistration.dob
                      ? dayjs(existingRegistration.dob)
                      : undefined,
                    address: existingRegistration.address,
                    contactNumber: existingRegistration.contactNumber,
                    email: existingRegistration.email,
                    allergies: existingRegistration.allergies,
                    currentMedicalIllness:
                      existingRegistration.currentMedicalIllness,
                    symptoms: existingRegistration.symptoms,
                  }
                : undefined
            }
            onValuesChange={(changedValues) => {
              if (changedValues.dob) {
                calculateAge(changedValues.dob);
              }
            }}
          >
            {/* Patient Information Section */}
            <div className="mb-4">
              <div className="flex items-center mb-3">
                <UserOutlined className="text-blue-600 mr-2" />
                <Title level={5} className="mb-0 text-gray-800">
                  Patient Information
                </Title>
              </div>

              <Row gutter={12}>
                <Col span={8}>
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[
                      {
                        required: true,
                        message: "Please input your full name!",
                      },
                      {
                        min: 2,
                        message: "Name must be at least 2 characters!",
                      },
                      { max: 50, message: "Name cannot exceed 50 characters!" },
                      {
                        pattern: /^[a-zA-Z\s]+$/,
                        message: "Name can only contain letters and spaces!",
                      },
                    ]}
                  >
                    <Input
                      size="large"
                      prefix={<UserOutlined className="text-gray-400" />}
                      placeholder="Enter your full name"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="dob"
                    label="Date of Birth"
                    rules={[
                      {
                        required: true,
                        message: "Please select your date of birth!",
                      },
                    ]}
                  >
                    <DatePicker
                      size="large"
                      className="w-full"
                      placeholder="Select date of birth"
                      format="YYYY-MM-DD"
                      disabledDate={(current) =>
                        current && current >= dayjs().startOf("day")
                      }
                      onChange={(date) => {
                        calculateAge(date);
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="sex"
                    label="Sex"
                    rules={[
                      { required: true, message: "Please select your sex!" },
                    ]}
                  >
                    <Select size="large" placeholder="Select sex">
                      <Option value="Male">Male</Option>
                      <Option value="Female">Female</Option>
                      <Option value="Other">Other</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Age (Calculated)">
                    <Input
                      size="large"
                      placeholder="Age will be calculated automatically"
                      disabled
                      value={calculatedAge}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Contact Information Section */}
            <div className="mb-4">
              <div className="flex items-center mb-3">
                <ContactsOutlined className="text-green-600 mr-2" />
                <Title level={5} className="mb-0 text-gray-800">
                  Contact Information
                </Title>
              </div>

              <Row gutter={12}>
                <Col span={8}>
                  <Form.Item
                    name="contactNumber"
                    label="Contact Number"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value) {
                            return Promise.reject(
                              new Error("Please enter your contact number!")
                            );
                          }

                          // Use libphonenumber-js for validation with selected country
                          if (
                            !isValidPhoneNumber(
                              value,
                              selectedCountry.toUpperCase()
                            )
                          ) {
                            return Promise.reject(
                              new Error("Please enter a valid phone number!")
                            );
                          }

                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <PhoneInput
                      country={selectedCountry}
                      placeholder="Enter your phone number"
                      inputStyle={{
                        width: "100%",
                        height: "39px",
                        border: "1px solid #d9d9d9",
                        borderRadius: "6px",
                        fontSize: "14px",
                      }}
                      buttonStyle={{
                        border: "1px solid #d9d9d9",
                        borderRadius: "6px 0 0 6px",
                        background: "#fafafa",
                        height: "39px",
                      }}
                      containerStyle={{
                        width: "100%",
                      }}
                      countryCodeEditable={false}
                      specialLabel=""
                      onChange={(_, country: any) => {
                        if (country && country.countryCode) {
                          setSelectedCountry(country.countryCode);
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your email address!",
                      },
                      {
                        type: "email",
                        message: "Please enter a valid email address!",
                      },
                      {
                        max: 100,
                        message: "Email cannot exceed 100 characters!",
                      },
                    ]}
                  >
                    <Input
                      size="large"
                      prefix={<MailOutlined className="text-gray-400" />}
                      placeholder="Enter your email address"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="address"
                    label="Address"
                    rules={[
                      { required: true, message: "Please enter your address!" },
                      {
                        min: 10,
                        message: "Address must be at least 10 characters!",
                      },
                      {
                        max: 200,
                        message: "Address cannot exceed 200 characters!",
                      },
                    ]}
                  >
                    <TextArea
                      rows={2}
                      placeholder="Enter your complete address"
                      showCount
                      maxLength={200}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Medical Information Section */}
            <div className="mb-4">
              <div className="flex items-center mb-3">
                <MedicineBoxOutlined className="text-red-600 mr-2" />
                <Title level={5} className="mb-0 text-gray-800">
                  Medical Information
                </Title>
              </div>

              <Row gutter={12}>
                <Col span={8}>
                  <Form.Item
                    name="allergies"
                    label="Allergies"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your allergies information!",
                      },
                      {
                        min: 5,
                        message:
                          "Please provide more details about your allergies!",
                      },
                      {
                        max: 300,
                        message:
                          "Allergies description cannot exceed 300 characters!",
                      },
                    ]}
                  >
                    <TextArea
                      rows={2}
                      placeholder="List any allergies (e.g., penicillin, nuts)"
                      showCount
                      maxLength={300}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="currentMedicalIllness"
                    label="Current Medical Conditions"
                    rules={[
                      {
                        required: true,
                        message:
                          "Please enter your current medical conditions!",
                      },
                      {
                        min: 5,
                        message:
                          "Please provide more details about your medical conditions!",
                      },
                      {
                        max: 300,
                        message:
                          "Medical conditions description cannot exceed 300 characters!",
                      },
                    ]}
                  >
                    <TextArea
                      rows={2}
                      placeholder="Current medical conditions or treatments"
                      showCount
                      maxLength={300}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col span={24}>
                  <Form.Item
                    name="symptoms"
                    label="Symptoms/Concerns"
                    rules={[
                      {
                        required: true,
                        message: "Please describe your symptoms or concerns!",
                      },
                      {
                        min: 10,
                        message:
                          "Please provide more details about your symptoms!",
                      },
                      {
                        max: 500,
                        message:
                          "Symptoms description cannot exceed 500 characters!",
                      },
                    ]}
                  >
                    <TextArea
                      rows={3}
                      placeholder="Describe your current symptoms or concerns for today's visit"
                      showCount
                      maxLength={500}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Agreement Statement */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
              <Text className="text-gray-700 text-xs">
                I hereby agree that the above medical information is true and
                accurate to the best of my knowledge. This information will be
                used for medical purposes only and will be kept confidential.
              </Text>
            </div>

            {/* Submit Button */}
            <Form.Item className="mb-0">
              <Button
                size="large"
                type="primary"
                htmlType="submit"
                className="w-full"
                loading={loading}
              >
                {loading
                  ? "Processing..."
                  : tokenValid
                  ? "Complete Registration"
                  : existingRegistration
                  ? "Update Information"
                  : "Submit Information"}
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <Text className="text-sm text-gray-500">
            Your information is securely stored for medical purposes only
          </Text>
        </div>
      </div>
    </div>
  );
};
