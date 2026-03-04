import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import api from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    CheckCheck,
    ShoppingBag,
    MessageSquare,
    Star,
    Info,
    ArrowLeft,
    Clock
} from 'lucide-react';

export default function NotificationsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            markAllAsRead();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/mark-read');
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order': return <ShoppingBag className="text-blue-600" size={20} />;
            case 'chat': return <MessageSquare className="text-green-600" size={20} />;
            case 'review': return <Star className="text-amber-600" size={20} />;
            default: return <Info className="text-gray-400" size={20} />;
        }
    };

    if (authLoading || !user) return null;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />

            <main className="container mx-auto px-4 md:px-8 py-10 max-w-3xl">
                <button
                    onClick={() => router.back()}
                    className="mb-8 flex items-center gap-2 text-gray-400 hover:text-red-600 transition-colors group"
                >
                    <ArrowLeft size={20} />
                    <span className="text-sm font-black uppercase tracking-widest">Back</span>
                </button>

                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <p className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] mb-2">Heritage Alerts</p>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tighter italic uppercase">Notifications</h1>
                    </div>
                </header>

                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="w-12 h-12 border-4 border-red-600/10 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Accessing Ledger...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="py-24 text-center">
                            <Bell size={48} className="mx-auto text-gray-100 mb-6" />
                            <h3 className="text-2xl font-black text-gray-900 mb-2 italic tracking-tighter uppercase">Quiet in the Shop</h3>
                            <p className="text-gray-400 font-medium italic">You have no matching system alerts at this time.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {notifications.map((n, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={n.id}
                                    className={`p-8 hover:bg-red-50/30 transition-all flex gap-6 items-start ${!n.isRead ? 'bg-red-50/10' : ''}`}
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center shrink-0">
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-900 font-bold leading-relaxed mb-2">{n.message}</p>
                                        <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                                            <Clock size={12} />
                                            {new Date(n.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                    {!n.isRead && (
                                        <div className="w-2 h-2 rounded-full bg-red-600 mt-2 shrink-0 animate-pulse"></div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
