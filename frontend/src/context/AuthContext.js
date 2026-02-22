import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/utils/api';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        const savedUser = sessionStorage.getItem('user');
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);

        // Listen for logout events from other tabs
        const channel = new BroadcastChannel('auth_channel');
        channel.onmessage = (event) => {
            if (event.data.type === 'LOGOUT') {
                const currentUserStr = sessionStorage.getItem('user');
                if (currentUserStr) {
                    const currentUser = JSON.parse(currentUserStr);
                    // Only logout if it's the same user account
                    if (currentUser.id === event.data.userId) {
                        performLogout(false); // false means don't emit event again
                    }
                }
            }
        };

        return () => {
            channel.close();
        };
    }, []);

    const performLogout = (emit = true) => {
        const currentUserStr = sessionStorage.getItem('user');
        let userId = null;
        if (currentUserStr) {
            userId = JSON.parse(currentUserStr).id;
        }

        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('cart'); // Clear cart as well
        setUser(null);
        router.push('/');

        if (emit && userId) {
            const channel = new BroadcastChannel('auth_channel');
            channel.postMessage({ type: 'LOGOUT', userId });
            channel.close();
        }
    };

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            const { token, user } = res.data;
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            const res = await api.post('/auth/register', userData);
            const { token, user, message } = res.data;
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return { success: true, message: message || 'Registration successful', user };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = () => {
        performLogout(true);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
