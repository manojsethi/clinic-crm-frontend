import React, { useState, useEffect } from "react";
import { Card, Typography, Button, Steps, message, Space, Tooltip } from "antd";
import {
  QrcodeOutlined,
  CameraOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { QRDisplay } from "../components/QRDisplay";
import { useSocket } from "../hooks/useSocket";
import { qrService, deviceDoctorMappingService } from "../services/api";
import { QRData } from "../types";
import { useRegistrationContext } from "../context/RegistrationContext";

const { Title, Text } = Typography;

export const RegistrationSetup: React.FC = () => {
  const navigate = useNavigate();
  const { deviceId, doctorId } = useRegistrationContext();
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [composedQR, setComposedQR] = useState<string>("");
  const {
    qr: socketQr,
    isConnected,
    joinDeviceDoctorRoom,
    currentRoom,
  } = useSocket();
  const [isCopying, setIsCopying] = useState(false);
  const [, setLastJoinAttemptAt] = useState<number | null>(null);

  const fetchQR = async () => {
    try {
      setLoading(true);
      if (!deviceId || !doctorId) {
        message.error("Device and Doctor information is required to generate QR code");
        return;
      }

      // First, try to get the existing QR token from localStorage (generated during device-doctor mapping)
      const existingToken = localStorage.getItem('currentQrToken');
      console.log("🔍 Checking for existing token:", existingToken);
      if (existingToken) {
        console.log("✅ Using existing QR token from device-doctor mapping:", existingToken);
        setQrData({
          token: existingToken,
          valid: true,
          createdAt: new Date().toISOString()
        });
        // Don't clear loading here - let the QR composition useEffect handle it
        return;
      }

      // If no existing token, generate a new one
      const data = await qrService.getQR(deviceId, doctorId);
      setQrData(data);
      // Don't clear loading here - let the QR composition useEffect handle it
    } catch (error: any) {
      console.error("Failed to fetch QR code:", error);
      message.error("Failed to generate QR code");
      setLoading(false); // Only clear loading on error
    }
  };

  // Initial setup when component loads
  useEffect(() => {
    if (deviceId && doctorId) {
      console.log("🚀 Starting QR setup process:", { deviceId, doctorId });
      fetchQR();
    } else {
      // If no device/doctor info, show error and stop loading
      setLoading(false);
    }
  }, [deviceId, doctorId]);

  // Auto-join room when connected and have device/doctor info
  useEffect(() => {
    if (isConnected && deviceId && doctorId && !currentRoom) {
      console.log("🔗 Auto-joining device-doctor room:", { deviceId, doctorId });
      joinDeviceDoctorRoom(deviceId, doctorId);
    }
  }, [isConnected, deviceId, doctorId, currentRoom, joinDeviceDoctorRoom]);

  // Fallback timeout to clear loading if QR setup takes too long
  useEffect(() => {
    if (loading && deviceId && doctorId) {
      const timeout = setTimeout(() => {
        console.log("⏰ QR setup timeout - clearing loading state");
        setLoading(false);
      }, 10000);
      
      return () => clearTimeout(timeout);
    }
  }, [loading, deviceId, doctorId]);

 


  // Retry room join if not connected after a delay
  useEffect(() => {
    if (!deviceId || !doctorId || !isConnected || currentRoom) return;
    
    const timer = setTimeout(() => {
      if (!currentRoom) {
        console.log("🔄 Retrying room join after delay");
        joinDeviceDoctorRoom(deviceId, doctorId);
        setLastJoinAttemptAt(Date.now());
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [deviceId, doctorId, isConnected, currentRoom, joinDeviceDoctorRoom]);

  // Update QR when socket receives new data
  useEffect(() => {
    if (socketQr) {
      setQrData((prev) => (prev ? { ...prev, token: socketQr } : null));
    }
  }, [socketQr]);

  // When room is joined, ensure QR is composed if we have a token
  useEffect(() => {
    if (currentRoom && (qrData?.token || socketQr)) {
      console.log("🏠 Room joined, ensuring QR is composed:", { currentRoom, hasToken: !!(qrData?.token || socketQr) });
      // The QR composition useEffect will handle this automatically
    }
  }, [currentRoom, qrData?.token, socketQr]);

  // Compose QR with device, doctor and this screen's unique room
  useEffect(() => {
    const currentToken = qrData?.token || socketQr || "";
    console.log("🔧 Composing QR with:", { currentToken: !!currentToken, deviceId, doctorId, currentRoom });
    
    if (currentToken && deviceId && doctorId && currentRoom) {
      // Prefer dev tunnel on localhost, else current origin
      
      // Use this screen's unique room so only this screen updates
      const url = `http://localhost:5173/register?token=${encodeURIComponent(
        currentToken
      )}&deviceId=${encodeURIComponent(deviceId)}&doctorId=${encodeURIComponent(
        doctorId
      )}&roomId=${encodeURIComponent(currentRoom)}`;
      
      console.log("✅ Setting composed QR URL:", url);
      setComposedQR(url);
      
      // Clear loading state when QR is composed
      if (loading) {
        console.log("🔄 Clearing loading state - QR composed");
        setLoading(false);
      }
    } else {
      console.log("❌ Cannot compose QR - missing data:", { currentToken: !!currentToken, deviceId, doctorId, currentRoom });
    }
  }, [qrData, socketQr, deviceId, doctorId, currentRoom, loading]);

  const handleManualEntry = () => {
    const token = prompt("Please enter your registration token:");
    if (token) {
      navigate(`/register?token=${token}`);
    }
  };

  const handleBack = async () => {
    // Clear the stored QR token when going back
    localStorage.removeItem('currentQrToken');
    // Clear device-doctor mapping when going back
    if (deviceId) {
      try {
        console.log('🧹 Clearing device-doctor mapping on back navigation for device:', deviceId);
        await deviceDoctorMappingService.endMapping(deviceId);
      } catch (error) {
        console.error('Error clearing device mapping on back navigation:', error);
      }
    }
    
    navigate("/scan");
  };

  const handleCopyLink = async () => {
    if (!composedQR) {
      message.warning("QR link not ready yet");
      return;
    }
    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(composedQR);
      message.success("Registration link copied");
    } catch (e) {
      message.error("Failed to copy link");
    } finally {
      setIsCopying(false);
    }
  };

  const steps = [
    {
      title: "Open Camera",
      description: "Open your phone camera or QR scanner app",
      icon: <CameraOutlined />,
    },
    {
      title: "Scan QR Code",
      description: "Point your camera at the QR code displayed at the clinic",
      icon: <QrcodeOutlined />,
    },
    {
      title: "Register",
      description: "You will be redirected to the registration form",
      icon: <CheckCircleOutlined />,
    },
  ];

  if (!deviceId || !doctorId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl text-center">
          <div className="text-6xl mb-4">❌</div>
          <Title level={3} className="mb-2">
            Invalid Setup
          </Title>
          <Text type="secondary">
            Device and doctor information is missing.
          </Text>
          <Button type="primary" onClick={handleBack} className="mt-4">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-800"
              >
                Back
              </Button>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                🏥
              </div>
              <div>
                <Title level={3} className="mb-0 text-gray-800">
                  Patient Registration
                </Title>
                <Text type="secondary" className="text-sm text-gray-600">
                  Registration Session Active
                </Text>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              ></div>
              <Text className="text-sm font-medium text-gray-700">
                {isConnected ? "Connected" : "Disconnected"}
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Heading & Context */}
        <div className="mb-8">
          <Title level={2} className="mb-1 text-gray-900">
            Patient Registration Setup
          </Title>
          <Text type="secondary" className="text-base text-gray-600">
            Scan the QR to open the registration form on the patient device.
          </Text>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* QR Code Section */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <QRDisplay
                qrCode={composedQR}
                isLoading={loading}
                title="Registration QR Code"
                description="Scan this QR code with your phone camera"
              />
              {!loading && !composedQR && (
                <div className="mt-3 text-center">
                  <Text type="secondary">
                    {!isConnected ? "Connecting to server…" : 
                     !currentRoom ? "Setting up secure room…" : 
                     "Preparing QR code…"}
                  </Text>
                  <div className="mt-2">
                    <Button
                      size="small"
                      onClick={() => {
                        if (deviceId && doctorId) {
                          setLoading(true);
                          if (!isConnected) {
                            // Just wait for connection
                            setLoading(false);
                          } else if (!currentRoom) {
                            joinDeviceDoctorRoom(deviceId, doctorId);
                            setLastJoinAttemptAt(Date.now());
                          } else {
                            fetchQR();
                          }
                        }
                      }}
                    >
                      {!isConnected ? "Retry connection" : 
                       !currentRoom ? "Retry room setup" : 
                       "Retry QR generation"}
                    </Button>
                  </div>
                </div>
              )}
              <div className="mt-4 flex items-center justify-between">
                <Space>
                  <Tooltip title="Copy registration link">
                    <Button
                      icon={<CopyOutlined />}
                      onClick={handleCopyLink}
                      loading={isCopying}
                    >
                      Copy Link
                    </Button>
                  </Tooltip>
                </Space>
              </div>
              <br />
            </div>
          </div>
          <div className="space-y-6">
            <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white mr-3">
                    📱
                  </div>
                  <Title level={3} className="mb-0 text-gray-800">
                    How to Register
                  </Title>
                </div>

                <Steps
                  direction="vertical"
                  size="default"
                  items={steps}
                  className="mb-8"
                />

                <Button
                  size="large"
                  icon={<UserOutlined />}
                  className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white hover:from-blue-600 hover:to-purple-700 text-base font-medium"
                  onClick={handleManualEntry}
                >
                  Enter Token Manually
                </Button>

                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <Text
                    type="secondary"
                    className="text-sm text-center block text-gray-600"
                  >
                    <strong className="text-gray-800">Need help?</strong> Ask
                    the clinic staff for assistance.
                  </Text>
                </div>
              </div>
            </Card>
          </div>
        </div>
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
