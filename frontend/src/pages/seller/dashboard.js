import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ShoppingBag, Package, TrendingUp, AlertCircle, Star, PlusCircle, Store, User, Clock, ShieldCheck } from 'lucide-react';

export default function SellerDashboard() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchAnalytics();
        }
    }, [user]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const res = await api.get('/analytics/seller');
            setStats(res.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || !user) return null;

    return (
        <div className="min-h-screen bg-[#fdfbf7]">
            <Navbar />
            <div className="p-6 md:p-8 md:px-12">


                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase">
                            {user.shopName || 'My Artisan Shop'}
                        </h1>
                        <p className="text-gray-500 font-medium italic">Crafting heritage, managing orders.</p>
                    </div>
                    {loading && <div className="animate-spin text-red-600"><TrendingUp /></div>}
                </header>

                {!user.isVerified && (
                    <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] mb-8 flex items-start gap-4 animate-in fade-in zoom-in duration-500">
                        <div className="bg-amber-400 p-2 rounded-full text-white">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-amber-900 text-lg">Shop Verification Pending</h3>
                            <p className="text-amber-800 opacity-80 max-w-2xl">
                                Mabuhay! Your artisan shop is currently being reviewed by our heritage experts.
                                You'll be able to post your designs and receive orders once verified.
                            </p>
                        </div>
                    </div>
                )}

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatBox
                        title="Artisan Revenue"
                        value={stats ? `₱${stats.revenue.toLocaleString()}` : '₱0'}
                        icon={<TrendingUp />}
                        color="text-green-600"
                        loading={loading}
                    />
                    <StatBox
                        title="Completed Order"
                        value={stats ? stats.totalOrders : '0'}
                        icon={<ShoppingBag />}
                        color="text-blue-600"
                        loading={loading}
                    />
                    <StatBox
                        title="Pending Workshop Queue"
                        value={stats ? (stats.orderStatusDistribution?.pending || 0) : '0'}
                        icon={<Clock />}
                        color="text-amber-600"
                        loading={loading}
                    />
                    <StatBox
                        title="Heritage Trust Score"
                        value="4.9"
                        icon={<ShieldCheck className="text-red-600" />}
                        color="text-gray-900"
                    />
                </div>

                {/* Analytics Detail Section */}
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Best Sellers */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100/50">
                        <h2 className="text-2xl font-black mb-6 text-gray-900 flex items-center gap-2">
                            <TrendingUp className="text-red-600" />
                            Best Selling Collections
                        </h2>
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-50 animate-pulse rounded-xl"></div>)}
                            </div>
                        ) : stats?.bestSellers.length > 0 ? (
                            <div className="space-y-4">
                                {stats.bestSellers.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-red-50 transition-all border border-transparent hover:border-red-100 group">
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-black text-gray-400 group-hover:text-red-600">#{idx + 1}</span>
                                            <div>
                                                <p className="font-bold text-gray-900">{item.name}</p>
                                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{item.qty} units sold</p>
                                            </div>
                                        </div>
                                        <p className="font-black text-red-600 italic">₱{item.revenue.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 italic text-sm">No sales data recorded yet.</p>
                        )}
                    </div>

                    {/* Order Distribution */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100/50">
                        <h2 className="text-2xl font-black mb-6 text-gray-900 flex items-center gap-2">
                            <Package className="text-red-600" />
                            Order Status
                        </h2>
                        {stats ? (
                            <div className="grid grid-cols-2 gap-4">
                                <StatusCard label="Active Work" count={stats?.orderStatusDistribution?.processing || stats?.orderStatusDistribution?.['To Ship'] || 0} color="bg-blue-500" />
                                <StatusCard label="In Transit" count={stats?.orderStatusDistribution?.shipped || 0} color="bg-amber-500" />
                                <StatusCard label="Handed Over" count={stats?.orderStatusDistribution?.completed || stats?.orderStatusDistribution?.delivered || 0} color="bg-green-500" />
                                <StatusCard label="Cancelled" count={stats?.orderStatusDistribution?.cancelled || 0} color="bg-red-500" />
                            </div>
                        ) : (
                            <div className="h-48 flex items-center justify-center">
                                <p className="text-gray-400 italic text-sm">Waiting for Order registry...</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12">
                    <h2 className="text-2xl font-black mb-8 text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-8 bg-red-600 rounded-full"></span>
                        Artisan Workshop Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ActionCard
                            href="/seller/add-product"
                            label="Post New Design"
                            description="Showcase a new handcrafted masterpiece."
                            icon={<PlusCircle size={32} />}
                            disabled={!user.isVerified}
                        />
                        <ActionCard
                            href="/seller/products"
                            label="Manage Catalog"
                            description="Update stock levels and heritage details."
                            icon={<Store size={32} />}
                        />
                        <ActionCard
                            href="/seller/orders"
                            label="View Orders"
                            description="Track and fulfillment your active orders."
                            icon={<ShoppingBag size={32} />}
                        />
                    </div>
                </div>

                {/* Sales Funnel Section */}
                <div className="mt-12">
                    <section className="bg-white rounded-[3.5rem] p-10 lg:p-14 border border-gray-100 shadow-sm relative overflow-hidden group">
                        {/* Decorative Background for Funnel */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-red-50 rounded-full -mr-48 -mt-48 opacity-30 blur-3xl group-hover:bg-red-100 transition-all duration-700"></div>

                        <div className="relative z-10">
                            <h2 className="text-3xl font-black mb-2 text-gray-900 italic uppercase tracking-tighter">Sales Funnel Support</h2>
                            <p className="text-gray-500 font-medium italic mb-12">Tracking the journey from inquiry to sealed heritage.</p>

                            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                                {/* The Visual Funnel */}
                                <div className="flex-1 w-full max-w-2xl space-y-4">
                                    <FunnelStep
                                        label="Heritage Inquiries"
                                        count={stats?.inquiryCount || 0}
                                        width="100%"
                                        className="bg-gray-900 text-white"
                                        subtext="Customers interested in your craft"
                                    />
                                    <FunnelStep
                                        label="Registry Orders"
                                        count={stats?.totalOrders || 0}
                                        width="75%"
                                        className="bg-red-600 text-white"
                                        subtext="Total orders received across the platform"
                                    />
                                    <FunnelStep
                                        label="Sealed Heritage"
                                        count={stats?.deliveredOrders || 0}
                                        width="50%"
                                        className="bg-green-600 text-white"
                                        subtext="Completed and delivered masterpieces"
                                    />
                                </div>

                                {/* Conversions & Insights */}
                                <div className="lg:w-1/3 grid grid-cols-1 gap-6 w-full">
                                    <ConversionMetric
                                        label="Inquiry to Order"
                                        rate={stats?.inquiryCount > 0 ? Math.round((stats.totalOrders / stats.inquiryCount) * 100) : 0}
                                    />
                                    <ConversionMetric
                                        label="Order Completion"
                                        rate={stats?.totalOrders > 0 ? Math.round((stats.deliveredOrders / stats.totalOrders) * 100) : 0}
                                    />
                                    <div className="p-6 bg-red-50/50 rounded-3xl border border-red-100 italic">
                                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Growth Insight</p>
                                        <p className="text-xs text-red-900/70 font-bold leading-relaxed">
                                            {stats?.inquiryCount > stats?.totalOrders ?
                                                "You have many inquiries! Try following up with customers to convert them into orders." :
                                                "Excellent conversion rate! Your heritage items are resonating well with the community."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function FunnelStep({ label, count, width, className, subtext }) {
    return (
        <div className="relative group/step">
            <div
                className={`p-6 rounded-3xl flex items-center justify-between shadow-lg transition-all hover:scale-[1.02] ${className}`}
                style={{ width }}
            >
                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">{label}</h3>
                    <p className="text-2xl font-black italic">{count}</p>
                </div>
                <div className="opacity-20 group-hover/step:opacity-100 transition-opacity">
                    <TrendingUp size={24} />
                </div>
            </div>
            <p className="text-[10px] text-gray-400 font-bold mt-2 ml-4 italic group-hover/step:text-red-500 transition-colors">{subtext}</p>
        </div>
    );
}

function ConversionMetric({ label, rate }) {
    return (
        <div className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</p>
            <div className="flex items-end gap-2">
                <p className="text-4xl font-black text-gray-900 italic tracking-tighter">{rate}%</p>
                <div className="flex-1 h-3 bg-gray-200 rounded-full mb-2 overflow-hidden">
                    <div className="h-full bg-red-600 rounded-full transition-all duration-1000" style={{ width: `${rate}%` }}></div>
                </div>
            </div>
        </div>
    );
}

function StatusCard({ label, count, color }) {
    return (
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${color}`}></span>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
            </div>
            <p className="text-2xl font-black text-gray-900">{count}</p>
        </div>
    );
}

function StatBox({ title, value, icon, color, loading }) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-xl transition-all h-full">
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                {loading ? (
                    <div className="h-8 w-24 bg-gray-50 animate-pulse rounded-lg"></div>
                ) : (
                    <p className={`text-3xl font-black ${color}`}>{value}</p>
                )}
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl text-gray-300 group-hover:text-red-600 transition-colors">{icon}</div>
        </div>
    );
}

function ActionCard({ href, label, description, icon, disabled }) {
    if (disabled) {
        return (
            <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 opacity-60 cursor-not-allowed">
                <div className="text-gray-300 mb-6">{icon}</div>
                <h3 className="text-lg font-black text-gray-400 mb-1 uppercase tracking-tight">{label}</h3>
                <p className="text-xs text-gray-400 font-medium italic">Verification in progress...</p>
            </div>
        );
    }
    return (
        <Link href={href}>
            <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 hover:border-red-600 hover:shadow-2xl hover:shadow-red-900/5 group transition-all cursor-pointer">
                <div className="text-red-600 mb-6 group-hover:scale-110 transition-transform origin-left">{icon}</div>
                <h3 className="text-lg font-black text-gray-900 mb-1 group-hover:text-red-600 transition-colors uppercase tracking-tight">{label}</h3>
                <p className="text-sm text-gray-500 font-medium italic opacity-70">{description}</p>
            </div>
        </Link>
    );
}
