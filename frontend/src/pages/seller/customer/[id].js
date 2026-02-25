import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '@/utils/api';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { User, ShoppingBag, Package, ArrowLeft, Star, Clock } from 'lucide-react';

const STATUS_COLORS = {
    'Pending': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Processing': 'bg-blue-50 text-blue-700 border-blue-200',
    'To Ship': 'bg-blue-50 text-blue-700 border-blue-200',
    'Shipped': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Delivered': 'bg-green-50 text-green-700 border-green-200',
    'Completed': 'bg-green-50 text-green-700 border-green-200',
    'Cancelled': 'bg-red-50 text-red-700 border-red-200',
    'Cancellation Requested': 'bg-orange-50 text-orange-700 border-orange-200',
    'Return Requested': 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function CustomerProfilePage() {
    const router = useRouter();
    const { id } = router.query;
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (router.isReady && id && user) {
            fetchCustomerProfile();
        }
    }, [id, router.isReady, user]);

    const fetchCustomerProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/auth/customer/${id}`);
            setProfile(res.data);
        } catch (err) {
            console.error('Error fetching customer profile:', err);
            setError(err.response?.data?.message || 'Failed to load customer profile');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || !user) return null;
    if (user.role !== 'seller') {
        router.replace('/');
        return null;
    }

    if (loading) return (
        <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm text-gray-400 font-medium uppercase tracking-widest">Loading Customer Profile...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#fdfbf7]">
            <Navbar />
            <div className="container mx-auto px-4 pt-24 max-w-4xl text-center">
                <p className="text-red-600 font-bold">{error}</p>
                <button onClick={() => router.back()} className="mt-4 text-gray-500 underline text-sm">Go Back</button>
            </div>
        </div>
    );

    if (!profile) return null;

    const { customer, orders, totalOrders, totalSpent } = profile;

    return (
        <div className="min-h-screen bg-[#fdfbf7]">
            <Navbar />
            <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="mb-8 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-100 hover:border-red-600 hover:bg-red-50 transition-all shadow-sm group w-fit"
                >
                    <ArrowLeft size={16} className="text-gray-400 group-hover:text-red-600 transition-colors" />
                    <span className="text-xs font-black text-gray-600 group-hover:text-red-600 uppercase tracking-widest transition-colors">Back</span>
                </button>

                {/* Customer Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6"
                >
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {customer.profileImage ? (
                                <img src={customer.profileImage} className="w-full h-full object-cover" alt={customer.name} />
                            ) : (
                                <span className="text-2xl font-black text-red-500 italic">{customer.name?.charAt(0) || 'C'}</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{customer.name}</h1>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">
                                Customer since {new Date(customer.createdAt).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}
                            </p>
                            <div className="flex items-center gap-1 mt-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Privacy Note:</span>
                                <span className="text-[10px] text-gray-400 italic">Showing only purchases from your shop</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-100">
                        <div className="text-center">
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Orders in Your Shop</p>
                            <p className="text-3xl font-black text-gray-900">{totalOrders}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Total Spent</p>
                            <p className="text-3xl font-black text-red-600">₱{totalSpent.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Status</p>
                            <p className="text-xl font-black text-green-600">
                                {totalOrders > 3 ? 'Loyal Patron' : totalOrders > 0 ? 'Active Buyer' : 'New Customer'}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Orders List */}
                <div className="space-y-4">
                    <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                        <ShoppingBag size={20} className="text-red-600" />
                        Purchase History ({totalOrders} orders)
                    </h2>

                    {orders.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                            <Package className="mx-auto text-gray-200 mb-4" size={48} />
                            <p className="text-gray-400 font-medium italic">This customer hasn't ordered from your shop yet.</p>
                        </div>
                    ) : (
                        orders.map((order, idx) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium">Order ID</p>
                                        <p className="text-sm font-black text-gray-700 font-mono">{order.id.slice(0, 8).toUpperCase()}...</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${STATUS_COLORS[order.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="space-y-2 mb-4">
                                    {order.items.map((item, itemIdx) => (
                                        <div key={itemIdx} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                                            <div>
                                                <p className="font-medium text-gray-800">{item.productName}</p>
                                                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-bold text-gray-700">₱{(parseFloat(item.price) * item.quantity).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-400 pt-2">
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        {new Date(order.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </span>
                                    <span className="font-black text-gray-800 text-sm">
                                        Total: ₱{order.items.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0).toLocaleString()}
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
