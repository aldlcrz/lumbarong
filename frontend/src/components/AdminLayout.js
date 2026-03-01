import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import { io } from 'socket.io-client';
import {
    LayoutDashboard,
    Users,
    Store,
    Settings,
    Search,
    Bell,
    ShoppingBag,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ children }) {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const menuItems = [
        { name: 'DASHBOARD', icon: LayoutDashboard, href: '/admin/dashboard' },
        { name: 'USERS', icon: Users, href: '/admin/users' },
        { name: 'MANAGE SELLERS', icon: Store, href: '/admin/sellers' },
        { name: 'MANAGE PRODUCTS', icon: ShoppingBag, href: '/admin/products' },
        { name: 'SYSTEM SETTINGS', icon: Settings, href: '/admin/settings' },
    ];
    const notifRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [notifRef]);

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchNotifications();

            const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:5000';
            const socket = io(socketUrl);

            socket.on('dashboard_update', () => {
                fetchNotifications();
            });

            return () => socket.disconnect();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/mark-read');
            fetchNotifications();
        } catch (err) {
            console.error('Error marking notifications as read:', err);
        }
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            if (query.includes('product') || query.includes('item')) {
                router.push(`/admin/products?search=${searchQuery}`);
            } else if (query.includes('seller') || query.includes('shop')) {
                router.push(`/admin/sellers?search=${searchQuery}`);
            } else {
                router.push(`/admin/products?search=${searchQuery}`);
            }
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#f4f7f9] flex font-sans selection:bg-red-600 selection:text-white">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex w-72 bg-white border-r border-gray-100 flex-col sticky top-0 h-screen shrink-0">
                <div className="p-8 pb-12">
                    <div className="flex items-center gap-3 cursor-default group">
                        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-200">
                            <span className="text-xl font-black italic">L</span>
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-gray-900 group-hover:text-red-600 transition-colors">Lumbarong</span>
                    </div>
                </div>

                <div className="px-4 flex-1">
                    <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Main Menu</p>
                    <nav className="space-y-1">
                        {menuItems.map((item) => {
                            const isActive = router.asPath === item.href || router.pathname === item.href;
                            return (
                                <Link href={item.href} key={item.name}>
                                    <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all cursor-pointer group ${isActive ? 'bg-red-50 text-red-600 shadow-sm border border-red-100/50' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                                        <item.icon size={20} className={isActive ? 'text-red-600' : 'group-hover:scale-110 transition-transform'} />
                                        <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'translate-x-1' : ''} transition-transform`}>{item.name}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Sidebar Bottom Profile */}
                <div className="p-6 mt-auto border-t border-gray-50">
                    <div className="flex items-center gap-3 bg-red-50 p-4 rounded-3xl border border-red-100/50 group relative">
                        <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-red-100 shrink-0">
                            {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-gray-900 truncate uppercase tracking-tighter">Admin Access</p>
                            <p className="text-[11px] font-bold text-red-600/60 truncate italic">{user.name}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 text-gray-300 hover:text-red-600 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        className="fixed inset-0 z-[100] lg:hidden bg-white w-72 flex flex-col shadow-2xl"
                    >
                        {/* Similar sidebar content for mobile */}
                        <div className="p-8 flex justify-between items-center">
                            <span className="text-2xl font-black italic tracking-tighter text-red-600">Lumbarong</span>
                            <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
                        </div>
                        <div className="px-4 flex-1 font-bold">
                            <nav className="space-y-1">
                                {menuItems.map((item) => (
                                    <Link href={item.href} key={item.name} onClick={() => setIsMobileMenuOpen(false)}>
                                        <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${router.pathname === item.href ? 'bg-red-50 text-red-600' : 'text-gray-500'}`}>
                                            <item.icon size={20} />
                                            <span className="text-xs font-black uppercase tracking-widest">{item.name}</span>
                                        </div>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                        <div className="p-6 mt-auto">
                            <button onClick={logout} className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-50 text-red-600 font-black text-xs uppercase tracking-widest">
                                <LogOut size={18} /> Logout
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content Area */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Header */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50">
                    <div className="flex items-center flex-1 max-w-xl">
                        <div className="relative w-full lg:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                                className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-red-100 rounded-2xl py-2.5 pl-12 pr-4 text-sm font-bold transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-900 border border-gray-100 rounded-xl">
                            <Menu size={20} />
                        </button>
                        <div className="relative" ref={notifRef}>
                            <div
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className={`p-2.5 rounded-xl border border-gray-100 text-gray-400 hover:bg-gray-50 hover:text-red-600 transition-all cursor-pointer ${isNotificationsOpen ? 'bg-red-50 text-red-600 border-red-100' : ''}`}
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
                                )}
                            </div>

                            {/* Notifications Dropdown */}
                            <AnimatePresence>
                                {isNotificationsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-4 w-80 bg-white rounded-[2rem] border border-gray-100 shadow-2xl p-4 z-[60]"
                                    >
                                        <div className="px-4 py-3 border-b border-gray-50">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Alerts</p>
                                        </div>
                                        <div className="py-4 space-y-1 max-h-96 overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.map(n => (
                                                    <div key={n.id} className="px-4 py-3 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group flex items-start gap-3">
                                                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.isRead ? 'bg-transparent' : 'bg-red-600'}`}></div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className={`text-xs font-black ${n.isRead ? 'text-gray-500' : 'text-gray-900'} group-hover:text-red-600 transition-colors uppercase tracking-tight`}>{n.message}</p>
                                                            <p className="text-[10px] font-bold text-gray-300 mt-0.5">{new Date(n.createdAt).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-8 text-center">
                                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">No alerts found</p>
                                                </div>
                                            )}
                                        </div>
                                        {unreadCount > 0 && (
                                            <div className="p-2 border-t border-gray-50">
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="w-full py-3 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all focus:outline-none"
                                                >
                                                    Mark all as read
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="w-px h-6 bg-gray-100 mx-2 hidden lg:block"></div>
                        <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-red-100 cursor-pointer hover:scale-105 transition-transform group overflow-hidden relative">
                            {user.name.charAt(0)}
                        </div>
                    </div>
                </header>

                {/* Main Viewport */}
                <main className="flex-1 p-6 lg:p-12 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
