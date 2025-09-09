import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            const storedUser = localStorage.getItem('user');
            if(storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        }
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await api.post('/api/auth/login', { email, password });
            if (response.data) {
                setToken(response.data.token);
                setUser(response.data.user);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        api, // Provide the configured axios instance
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
