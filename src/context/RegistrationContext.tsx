import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RegistrationContextType {
  deviceId: string | null;
  doctorId: string | null;
  deviceName: string | null;
  doctorName: string | null;
  roomId: string | null;
  setRegistrationContext: (data: {
    deviceId: string;
    doctorId: string;
    deviceName: string;
    doctorName: string;
    roomId?: string;
  }) => void;
  clearRegistrationContext: () => void;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export const useRegistrationContext = () => {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistrationContext must be used within a RegistrationProvider');
  }
  return context;
};

interface RegistrationProviderProps {
  children: ReactNode;
}

export const RegistrationProvider: React.FC<RegistrationProviderProps> = ({ children }) => {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [doctorName, setDoctorName] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  const setRegistrationContext = (data: {
    deviceId: string;
    doctorId: string;
    deviceName: string;
    doctorName: string;
    roomId?: string;
  }) => {
    setDeviceId(data.deviceId);
    setDoctorId(data.doctorId);
    setDeviceName(data.deviceName);
    setDoctorName(data.doctorName);
    setRoomId(data.roomId || null);
  };

  const clearRegistrationContext = () => {
    setDeviceId(null);
    setDoctorId(null);
    setDeviceName(null);
    setDoctorName(null);
    setRoomId(null);
  };

  return (
    <RegistrationContext.Provider
      value={{
        deviceId,
        doctorId,
        deviceName,
        doctorName,
        roomId,
        setRegistrationContext,
        clearRegistrationContext,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};
