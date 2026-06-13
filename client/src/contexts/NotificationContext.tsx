import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';
export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  timestamp: string;
  read: boolean;
}
interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: AppNotification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}
const NotificationContext = createContext<NotificationContextType | null>(null);
let socket: Socket | null = null;
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  useEffect(() => {
    const token = localStorage.getItem('snakes_token');
    if (!token) return;
    const socketUrl = import.meta.env.DEV
      ? 'http://localhost:3001'
      : window.location.origin;
    socket = io(socketUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });
    socket.on('notification', (data: Omit<AppNotification, 'id' | 'read'>) => {
      const notification: AppNotification = {
        ...data,
        id: generateId(),
        read: false,
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
    });
    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const addNotification = useCallback((n: AppNotification) => {
    setNotifications((prev) => [n, ...prev].slice(0, 50));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {' '}
      {children}{' '}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      'useNotifications must be used within NotificationProvider',
    );
  return ctx;
}
