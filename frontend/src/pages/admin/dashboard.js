import { useEffect, useState, useMemo } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import AdminLayout from '@/components/AdminLayout';
import {
    Users,
    TrendingUp,
    Store,
    ShieldCheck,
    ChevronRight,
    Search,
    ShoppingBag,
    ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const [data, setData] = useState({
        totalUsers: 0,
        totalSellers: 0,
        verifiedSellersCount: 0,
        pendingSellersCount: 0,
        totalOrders: 0,
        revenue: 0,
        recentPendingSellers: [],
        platformTrends: []
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDashboardData();

        const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:5000';
        const newSocket = io(socketUrl);
        newSocket.on('dashboard_update', () => {
            fetchDashboardData();
        });

        // Refresh when window regains focus to ensure real-time accuracy
        const handleFocus = () => fetchDashboardData();
        window.addEventListener('focus', handleFocus);

        return () => {
            newSocket.disconnect();
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        api.get('/admin/dashboard')
            .then(res => setData(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    if (authLoading || !user) return null;

    return (
        <AdminLayout>
            <div className="flex flex-col xl:flex-row gap-8">
                {/* Left Side: Main Content */}
                <div className="flex-1 min-w-0">
                    <header className="mb-10 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-1">SYSTEM OVERVIEW</h1>
                            <p className="text-sm text-gray-400 font-bold">Welcome to Lumbarong ecommerce platform.</p>
                        </div>

                    </header>

                    {/* Stats HUD */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        <StatHUD title="TOTAL USERS" value={data.totalUsers} icon={Users} color="text-gray-900" />
                        <StatHUD title="PENDING SELLERS" value={data.pendingSellersCount} icon={ShieldCheck} badge="AWAITING" color="text-gray-900" />
                        <StatHUD title="TOTAL SALES" value={`₱${(data.revenue || 0).toLocaleString()}`} icon={TrendingUp} color="text-gray-900" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Registry Applications */}
                        <RegistryCard
                            title="Registry Applications"
                            items={(data.recentPendingSellers || []).map(s => ({
                                id: s.id,
                                title: s.shopName || s.name,
                                subtitle: `Joined ${new Date(s.createdAt).toLocaleDateString()}`,
                                icon: ShieldCheck
                            }))}
                            icon={ShieldCheck}
                            label="No pending registries found."
                            href="/admin/sellers"
                        />

                    </div>
                </div>

                {/* Right Side: Sales & Trends */}
                <div className="w-full xl:w-96 shrink-0 space-y-8">
                    {/* Store Sales */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-black text-gray-400 mb-8 uppercase tracking-[0.2em]">STORE SALES</h3>
                        <div className="space-y-8">
                            <SalesUpdate title="Total Orders" status={`${data.totalOrders} total`} price={data.totalOrders} />
                            <SalesUpdate title="Artisan Volume" status="Active Sellers" price={data.totalSellers} count={data.totalSellers} />
                            <SalesUpdate title="Registry Log" status="24/7" price="Secure" />
                        </div>
                    </div>

                    {/* Platform Trends Bar Chart */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-black text-gray-400 mb-2 uppercase tracking-[0.2em]">Platform Trends</h3>
                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-8 text-center">(Sales by Product)</p>

                        <div className="h-64">
                            {data.platformTrends && data.platformTrends.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.platformTrends} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <XAxis hide dataKey="name" />
                                        <YAxis hide />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 900, fontSize: '10px' }}
                                        />
                                        <Bar dataKey="sales" fill="#dc2626" radius={[4, 4, 0, 0]} maxBarSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <MockChart />
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            <div className="w-3 h-3 bg-red-600 rounded-sm"></div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</span>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function StatHUD({ title, value, icon: Icon, badge, color = "text-red-600" }) {
    return (
        <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-900/5 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 opacity-50 transition-all group-hover:bg-red-50"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-red-600 group-hover:text-white transition-all shadow-inner">
                        <Icon size={24} className="group-hover:scale-110 transition-transform" />
                    </div>
                    {badge && (
                        <span className="px-3 py-1 bg-gray-900 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">
                            {badge}
                        </span>
                    )}
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h2 className={`text-4xl font-black ${color} tracking-tighter italic`}>{value}</h2>
                    <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-lg">+12.5%</span>
                </div>
            </div>
        </section>
    );
}

function RegistryCard({ title, icon: Icon, label, href, items = [] }) {
    return (
        <section className="bg-white rounded-[3rem] border border-gray-100 shadow-sm flex flex-col min-h-[420px] group/card hover:shadow-2xl hover:shadow-gray-900/5 transition-all">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover/card:bg-red-600 group-hover/card:text-white transition-all">
                        <Icon size={22} className="group-hover/card:scale-110 transition-transform" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-tighter">{title}</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse"></span>
                            <span className="text-[10px] font-black text-red-600/60 uppercase tracking-widest">Live Registry</span>
                        </div>
                    </div>
                </div>
                <Link href={href}>
                    <button className="p-3 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-red-600 transition-all">
                        <TrendingUp size={18} />
                    </button>
                </Link>
            </div>

            <div className="flex-1 p-8">
                {items.length > 0 ? (
                    <div className="space-y-4">
                        {items.slice(0, 5).map((item, idx) => (
                            <div key={item.id || idx} className="flex items-center justify-between p-4 rounded-[2rem] bg-gray-50/50 border border-gray-100/50 hover:bg-white hover:border-red-100 hover:shadow-xl hover:shadow-red-900/5 transition-all group/item cursor-pointer">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-red-600 shadow-sm border border-gray-100 group-hover/item:bg-red-600 group-hover/item:text-white transition-all shrink-0">
                                        <item.icon size={20} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-black text-gray-900 uppercase tracking-tight truncate group-hover/item:text-red-600 transition-colors">{item.title}</p>
                                        <p className="text-[10px] font-bold text-gray-400 italic mt-0.5 truncate">{item.subtitle}</p>
                                    </div>
                                </div>
                                <button className="p-2 text-gray-300 group-hover/item:text-red-600 transform group-hover/item:translate-x-1 transition-all">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-8 relative">
                            <div className="w-48 h-48 rounded-full bg-gray-50/50 flex items-center justify-center relative overflow-hidden group-hover:bg-red-50/50 transition-all duration-700">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.05, 1],
                                        rotate: [0, 2, -2, 0]
                                    }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                    className="relative z-10"
                                >
                                    {title.includes('Applications') ? (
                                        <div className="relative">
                                            <div className="absolute -inset-4 bg-red-600/10 blur-xl rounded-full"></div>
                                            <ShieldCheck size={80} className="text-red-600 drop-shadow-2xl" />
                                            <div className="absolute -top-4 -right-10 w-20 h-24 bg-white border border-gray-100 rounded-xl p-3 shadow-2xl shadow-gray-200/50 flex flex-col gap-2 transform rotate-12">
                                                <div className="w-full h-2 bg-gray-100 rounded-full"></div>
                                                <div className="w-2/3 h-2 bg-gray-100 rounded-full"></div>
                                                <div className="w-full h-2 bg-gray-100 rounded-full"></div>
                                                <div className="w-1/2 h-2 bg-gray-100 rounded-full"></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <div className="absolute -inset-4 bg-red-600/10 blur-xl rounded-full"></div>
                                            <div className="w-24 h-24 bg-red-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl relative">
                                                <ShoppingBag size={48} />
                                            </div>
                                            <div className="absolute -bottom-4 -right-10 w-24 h-16 bg-amber-200 border border-amber-300 rounded-2xl shadow-2xl transform -rotate-6 flex items-center justify-center">
                                                <div className="w-12 h-1 bg-white/50 rounded-full"></div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full blur-3xl opacity-50"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gray-100 rounded-full blur-3xl opacity-50"></div>
                            </div>
                        </div>
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter mb-2 italic">Registry Quiet</h3>
                        <p className="text-[11px] font-bold text-gray-400 max-w-[200px] leading-relaxed italic">{label}</p>
                    </div>
                )}
            </div>
        </section>
    );
}

function SalesUpdate({ title, status, price, count }) {
    return (
        <div className="flex items-center justify-between p-5 rounded-[2.5rem] bg-gray-50/50 border border-transparent hover:bg-white hover:border-gray-100 hover:shadow-xl hover:shadow-gray-900/5 transition-all group cursor-pointer">
            <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl ${status === 'Active' || status === 'Verified' ? 'bg-black' : 'bg-red-600'} flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-110 transition-all`}>
                    {status ? status.charAt(0) : count || 'S'}
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{title}</p>
                    <p className="text-xl font-black text-gray-900 tracking-tighter italic">
                        {typeof price === 'number' && title.toLowerCase().includes('sales') ? `₱${price.toLocaleString()}` : price}
                    </p>
                </div>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${status === 'Active' || status === 'Verified' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                {status || `${count || 0} Items`}
            </div>
        </div>
    );
}

function MockChart() {
    return (
        <div className="h-full w-full flex items-end justify-center gap-4 px-4 pb-4">
            {[80, 40, 30, 10, 60, 20].map((h, i) => (
                <div key={i} className="w-10 bg-red-600 rounded-lg hover:bg-black transition-colors" style={{ height: `${h}%` }}></div>
            ))}
        </div>
    );
}
