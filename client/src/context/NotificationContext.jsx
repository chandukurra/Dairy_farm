import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import api from '../services/api';

export const NotificationContext = createContext();

const socketUrl = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const NotificationProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!user || !token) {
            setNotifications([]);
            setUnreadCount(0);
            return undefined;
        }

        let active = true;
        const loadNotifications = async () => {
            try {
                const response = await api.get('/notifications');
                if (active) {
                    setNotifications(response.data.data);
                    setUnreadCount(response.data.unreadCount);
                }
            } catch (_) { /* The bell remains usable if notifications are temporarily unavailable. */ }
        };

        loadNotifications();
        const socket = io(socketUrl, { auth: { token }, transports: ['websocket', 'polling'] });
        socket.on('notification:new', (notification) => {
            if (!active) return;
            setNotifications((current) => [notification, ...current.filter((item) => item._id !== notification._id)].slice(0, 20));
            setUnreadCount((count) => count + 1);
        });

        return () => {
            active = false;
            socket.disconnect();
        };
    }, [user]);

    const value = useMemo(() => ({
        notifications,
        unreadCount,
        markRead: async (id) => {
            const current = notifications.find((item) => item._id === id);
            if (!current || current.isRead) return;
            setNotifications((items) => items.map((item) => item._id === id ? { ...item, isRead: true } : item));
            setUnreadCount((count) => Math.max(0, count - 1));
            try { await api.put(`/notifications/${id}/read`); } catch (_) { /* Optimistic update is adequate for the inbox. */ }
        },
        markAllRead: async () => {
            setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
            setUnreadCount(0);
            try { await api.put('/notifications/read-all'); } catch (_) { /* State refreshes on the next load. */ }
        }
    }), [notifications, unreadCount]);

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
