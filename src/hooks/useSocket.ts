import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketEventData {
    qr: string;
    timestamp?: string;
    roomId?: string;
    consumedToken?: string;
    manual?: boolean;
}

interface RoomEventData {
    roomId: string;
    message: string;
}

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [qr, setQr] = useState<string>('');
    const [isConnected, setIsConnected] = useState(false);
    const [currentRoom, setCurrentRoom] = useState<string | null>(null);
    const currentRoomRef = useRef<string | null>(null);

    useEffect(() => {
       
        const newSocket = io('http://localhost:8000', {
            transports: ['websocket'],
        });

        newSocket.on('connect', () => {
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
            setCurrentRoom(null);
        });

        newSocket.on('NEW_QR', (data: SocketEventData) => {
            console.log('📡 [FRONTEND] Received NEW_QR event:', { 
                roomId: data.roomId, 
                currentRoom: currentRoomRef.current,
                hasQR: !!data.qr 
            });
            
            // Update QR if:
            // 1. No roomId specified (broadcast to all)
            // 2. RoomId matches current room
            // 3. We're in a room and this is a room-specific update
            if (!data.roomId || data.roomId === currentRoomRef.current) {
                console.log('✅ [FRONTEND] Updating QR from socket event');
                setQr(data.qr);
            } else {
                console.log('❌ [FRONTEND] Ignoring QR update - room mismatch');
            }
        });

        newSocket.on('ROOM_JOINED', (data: RoomEventData) => {
            setCurrentRoom(data.roomId);
            currentRoomRef.current = data.roomId;
        });

        newSocket.on('ROOM_LEFT', (data: RoomEventData) => {
            if (currentRoomRef.current === data.roomId) {
                setCurrentRoom(null);
                currentRoomRef.current = null;
            }
        });

        newSocket.on('DEVICE_AVAILABLE', (data: { deviceId: string }) => {
            console.log('📡 [FRONTEND] Device available event received:', data.deviceId);
            // This event will be handled by components that need to clear device-doctor mapping
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    const joinRoom = useCallback((roomId: string) => {
        if (socket && isConnected) {
            socket.emit('JOIN_ROOM', { roomId });
        }
    }, [socket, isConnected]);

    const joinDeviceDoctorRoom = useCallback((deviceId: string, doctorId: string) => {
        if (socket && isConnected) {
            const uniqueId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const roomId = `device_${deviceId}_doctor_${doctorId}_screen_${uniqueId}`;
            socket.emit('JOIN_ROOM', { roomId });
        }
    }, [socket, isConnected]);

    const leaveRoom = useCallback((roomId: string) => {
        if (socket && isConnected) {
            socket.emit('LEAVE_ROOM', { roomId });
        }
    }, [socket, isConnected]);

    const generateQR = useCallback(() => {
        if (socket && isConnected) {
            socket.emit('GENERATE_QR', { roomId: currentRoom || undefined });
        }
    }, [socket, isConnected, currentRoom]);

    const consumeQR = useCallback((tokenId: string) => {
        if (socket && isConnected) {
            socket.emit('CONSUME_QR', { tokenId, roomId: currentRoom || undefined });
        }
    }, [socket, isConnected, currentRoom]);

    return { 
        socket, 
        qr, 
        isConnected, 
        currentRoom,
        joinRoom,
        joinDeviceDoctorRoom,
        leaveRoom,
        generateQR,
        consumeQR
    };
};
