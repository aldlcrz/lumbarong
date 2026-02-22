import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import {
    Users,
    Store,
    TrendingUp,
    Package,
    ChevronRight,
    LayoutDashboard,
    ShoppingBag,
    Settings,
    ShieldCheck,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { io } from 'socket.io-client';

export default function AdminDashboard() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [data, setData] = useState({
        totalUsers: 0,
        totalSellers: 0,
        revenue: 0,
        topProduct: 'Loading...',
        platformTrends: []
    });
    const [pendingSellers, setPendingSellers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDashboardData();
        fetchPendingSellers();

        const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:5000';
        const newSocket = io(socketUrl);
        newSocket.on('dashboard_update', () => {
            fetchDashboardData();
            fetchPendingSellers();
        });

        return () => newSocket.disconnect();
    }, []);

    const fetchDashboardData = async () => {
        api.get('/admin/dashboard')
            .then(res => setData(res.data))
            .catch(err => console.error(err));
    };

    const fetchPendingSellers = async () => {
        api.get('/auth/sellers?verified=false')
            .then(res => setPendingSellers(res.data))
            .catch(err => console.error(err));
    };

    const handleApprove = async (id) => {
        setLoading(true);
        try {
            await api.put(`/auth/approve-seller/${id}`);
            fetchPendingSellers();
            fetchDashboardData();
            alert('Seller approved successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to approve seller.');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || !user) return null;

    return (
        <div className="bg-[#fdfbf7] min-h-screen">
            <Navbar />

            <div className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-4">
                <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-gray-100 hover:bg-red-50 hover:border-red-100 text-gray-600 hover:text-red-600 font-bold text-sm transition-all">
                    <ArrowLeft size={18} />
                    Back to Home
                </Link>
            </div>
            <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-8 p-6 lg:p-12">

                {/* LEFT SIDEBAR: Navigation Ledger */}
                <aside className="lg:w-1/5 shrink-0">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm sticky top-32">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-8">Main Menu</p>
                        <nav className="space-y-2">
                            <SidebarLink href="/admin/dashboard" icon={LayoutDashboard} active>Dashboard</SidebarLink>
                            <SidebarLink href="/admin/sellers" icon={Users}>Manage Sellers</SidebarLink>
                            <SidebarLink href="/admin/products" icon={Store}>Manage Products</SidebarLink>
                            <SidebarLink href="/admin/settings" icon={Settings}>System Settings</SidebarLink>
                        </nav>

                        <div className="mt-12 pt-12 border-t border-gray-50">
                            <div className="flex items-center gap-3 bg-red-50 p-4 rounded-3xl border border-red-100/50">
                                <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white font-black text-sm">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-black text-gray-900 truncate">Admin Access</p>
                                    <p className="text-[10px] font-bold text-red-600/60 truncate">{user.name}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* MAIN AREA: System Overview */}
                <main className="lg:flex-1 min-w-0">


                    <header className="mb-10">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase">System Overview</h1>
                        <p className="text-gray-500 font-medium italic">Welcome back, Admin. Here is what's happening today.</p>
                    </header>

                    {/* Stats HUD */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <StatHUD title="Total Users" value={data.totalUsers} icon={Users} color="text-gray-900" />
                        <StatHUD title="Pending Sellers" value={pendingSellers.length} icon={ShieldCheck} badge="Awaiting" color="text-amber-600" />
                        <StatHUD title="Total Sales" value={`₱${data.revenue.toLocaleString()}`} icon={TrendingUp} color="text-green-600" />
                    </div>

                    {/* Central Registry: Applications */}
                    <section className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm mb-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight italic">Registry Applications</h2>
                                <p className="text-sm text-gray-400 font-medium mt-1">Pending verification for new artisans.</p>
                            </div>
                            <Link href="/admin/sellers">
                                <button className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-900 hover:text-white transition-all">
                                    <ChevronRight size={20} />
                                </button>
                            </Link>
                        </div>

                        {pendingSellers.length === 0 ? (
                            <div className="py-20 text-center border-2 border-dashed border-gray-50 rounded-[2rem]">
                                <ShieldCheck size={48} className="mx-auto text-gray-100 mb-4" />
                                <p className="text-gray-300 font-bold italic">No pending registries found.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pendingSellers.map(seller => (
                                    <div key={seller.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-gray-100 hover:border-red-600 transition-all group">
                                        <div className="flex items-center gap-4 mb-4 md:mb-0">
                                            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-lg font-black text-gray-300 group-hover:bg-red-600 group-hover:text-white transition-all">
                                                {seller.shopName?.charAt(0) || seller.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-gray-900 uppercase tracking-tight">{seller.shopName || seller.name}</h3>
                                                <p className="text-[10px] font-bold text-gray-400 italic">Requested on {new Date(seller.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleApprove(seller.id)}
                                            disabled={loading}
                                            className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-gray-200 disabled:opacity-50"
                                        >
                                            {loading ? 'Verifying...' : 'Verify Status'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
                        <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight italic">Platform Trends (Sales by Product)</h2>
                        <div className="h-64 mt-8">
                            {data.platformTrends && data.platformTrends.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.platformTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 700 }}
                                            tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val}
                                        />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 700 }} />
                                        <Tooltip
                                            cursor={{ fill: '#fef2f2' }}
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 900, fontSize: '12px' }}
                                        />
                                        <Bar dataKey="sales" fill="#dc2626" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-50 rounded-[2rem]">
                                    <p className="text-gray-300 font-bold italic">No sales data available yet.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </main>

                {/* RIGHT SIDEBAR: Sales Log */}
                <aside className="lg:w-1/5 shrink-0 flex flex-col gap-6">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-black text-gray-900 mb-6 uppercase tracking-widest border-l-4 border-red-600 pl-4">Store Sales</h3>
                        <div className="space-y-6">
                            <SalesUpdate title="Collection High" status="Active" price="₱12,500" />
                            <SalesUpdate title="Artisan Volume" status="Increasing" price="+12.5%" />
                            <SalesUpdate title="Registry Log" status="Secure" price="24/7" />
                        </div>
                        <button className="w-full mt-8 py-4 rounded-2xl border border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:bg-black hover:text-white transition-all">
                            Export Logs
                        </button>
                    </div>
                </aside>

            </div>
        </div>
    );
}

function SidebarLink({ href, icon: Icon, children, active }) {
    return (
        <Link href={href}>
            <div className={`flex items-center gap-3 p-4 rounded-2xl transition-all cursor-pointer group ${active ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50 hover:text-red-600'}`}>
                <Icon size={18} className={active ? 'text-red-500' : 'group-hover:scale-110 transition-transform'} />
                <span className="text-xs font-black uppercase tracking-widest">{children}</span>
            </div>
        </Link>
    );
}

function StatHUD({ title, value, icon: Icon, badge, color }) {
    return (
        <div className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all">
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <div className="flex items-center gap-2">
                    <p className={`text-2xl font-black ${color}`}>{value}</p>
                    {badge && <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-amber-100">{badge}</span>}
                </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl text-gray-300 group-hover:text-red-600 transition-colors">
                <Icon size={24} />
            </div>
        </div>
    );
}

function SalesUpdate({ title, status, price }) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-xs font-black text-gray-900 mb-1">{title}</p>
                <p className="text-[10px] font-bold text-gray-400 italic leading-none">{status}</p>
            </div>
            <p className="text-sm font-black text-red-600 italic">{price}</p>
        </div>
    );
}
