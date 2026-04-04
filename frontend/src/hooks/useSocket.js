import { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:4000';

/**
 * Custom hook for managing WebSocket connection and real-time biometric updates
 * Connects to user-specific room and listens for health alerts
 */
export function useSocket(userId) {
  const [connected, setConnected] = useState(false);
  const [lastReading, setLastReading] = useState(null);
  const [alert, setAlert] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    socketRef.current = io(WS_URL, {
      path: process.env.REACT_APP_WS_PATH || '/ws',
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
      socketRef.current.emit('join', userId);
    });

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    socketRef.current.on('reading_processed', (data) => {
      console.log('Reading processed:', data);
      setLastReading(data);

      if (data.alert) {
        setAlert({
          message: `Alert: ${data.emergencies[0]?.message || 'Health threshold exceeded'}`,
          type: 'danger',
          timestamp: new Date(),
        });
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave', userId);
        socketRef.current.disconnect();
      }
    };
  }, [userId]);

  const clearAlert = useCallback(() => {
    setAlert(null);
  }, []);

  return {
    connected,
    lastReading,
    alert,
    clearAlert,
  };
}
