import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const realTimeEnabled =
      import.meta.env.VITE_ENABLE_REAL_TIME_NOTIFICATIONS === 'true';

    if (!realTimeEnabled || !isAuthenticated || !user) {
      setConnected(false);
      setSocket((existingSocket) => {
        if (existingSocket) {
          existingSocket.disconnect();
        }
        return null;
      });
      return;
    }

    // Only connect for admin and editor roles
    if (user.role !== 'admin' && user.role !== 'editor') {
      setConnected(false);
      return;
    }

    const token = localStorage.getItem('token');
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://127.0.0.1:5001';

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.warn('Socket connection failed:', error.message);
      setConnected(false);
    });

    // Listen for real-time notifications
    newSocket.on('contact:new', (data) => {
      toast.success(`New contact from ${data.name}: ${data.subject}`, {
        duration: 6000,
      });
    });

    newSocket.on('project:created', (data) => {
      toast.success(`New project created: ${data.project} by ${data.author}`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setConnected(false);
      setSocket(null);
    };
  }, [isAuthenticated, user]);

  const emit = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  };

  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const value = {
    socket,
    connected,
    emit,
    on,
    off,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
