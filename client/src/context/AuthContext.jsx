import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is already logged in on mount
    useEffect(() => {
        const checkUserLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    const u = res.data.data;
                    setUser(u ? { ...u, id: u._id, _id: u._id } : null);
                } catch (err) {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkUserLoggedIn();
    }, []);

    // Login Action
    const login = async (email, password) => {
        try {
            setError(null);
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            const u = res.data.user;
            setUser(u ? { ...u, id: u.id || u._id, _id: u._id || u.id } : null);
            return res.data.user.role; // Return role for routing
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            throw err;
        }
    };

    // Register Action
    const register = async (userData) => {
        try {
            setError(null);
            const res = await api.post('/auth/register', userData);
            localStorage.setItem('token', res.data.token);
            const u = res.data.user;
            setUser(u ? { ...u, id: u.id || u._id, _id: u._id || u.id } : null);
            return res.data.user.role;
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            throw err;
        }
    };

    // Logout Action
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};