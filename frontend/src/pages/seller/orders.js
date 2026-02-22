import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import api from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    Truck,
    Clock,
    CheckCircle,
    User,
    MapPin,
    Check,
    ShieldCheck,
    ExternalLink,
    Search,
    Eye,
    Star,
    Undo2,
    Info,
    FileVideo,
    X,
    ArrowLeft
} from 'lucide-react';

function ReceiptViewModal({ order, onClose, onVerify }) {
    const [verifying, setVerifying] = useState(false);

    const handleAction = async (isVerified) => {
        setVerifying(true);
        try {
            await api.put(`/orders/${order.id}/verify-payment`, { isVerified });
            onVerify();
        } catch (err) {
            alert('Failed to update payment status.');
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl flex flex-col md:flex-row gap-10"
            >
                <div className="flex-1">
                    <div className="space-y-6 mb-10">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Reference Number</p>
                            <p className="text-xl font-black text-gray-900">{order.referenceNumber}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Settlement Value</p>
                            <p className="text-xl font-black text-red-600">₱{order.totalAmount.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Client Ledger</p>
                            <p className="font-bold text-gray-700">{order.customer?.name}</p>
                        </div>
                    </div>

                    {!order.isPaymentVerified && (
                        <div className="flex gap-4">
                            <button
                                onClick={() => handleAction(false)}
                                disabled={verifying}
                                className="flex-1 py-4 rounded-2xl border border-gray-100 font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-gray-50"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleAction(true)}
                                disabled={verifying}
                                className="flex-1 py-4 rounded-2xl bg-black text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl"
                            >
                                {verifying ? 'Auditing...' : 'Confirm Payment'}
                            </button>
                        </div>
                    )}
                    <button onClick={onClose} className="w-full mt-4 text-[10px] font-black text-gray-300 uppercase underline">Close Vault</button>
                </div>

                <div className="w-full md:w-64 h-80 rounded-[2rem] bg-gray-50 border border-gray-100 overflow-hidden shadow-inner group relative">
                    <img src={order.receiptImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <a href={order.receiptImage} target="_blank" rel="noreferrer" className="p-4 bg-white rounded-full text-gray-900">
                            <ExternalLink size={20} />
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function OrderDetailModal({ order, onClose }) {
    if (!order) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[3rem] p-10 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar relative"
            >
                <button onClick={onClose} className="absolute right-8 top-8 p-3 rounded-full hover:bg-gray-100 transition-all text-gray-400">
                    <X size={24} />
                </button>

                <div className="mb-10">
                    <p className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] mb-2">Order Artifact</p>
                    <h3 className="text-4xl font-black text-gray-900 italic uppercase tracking-tighter">Order #{order.id?.toString().slice(-8).toUpperCase() || 'N/A'}</h3>
                    <p className="text-gray-500 font-medium italic">Filed on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-10">
                        <section>
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <User size={12} className="text-red-600" /> Client Ledger
                            </h4>
                            <div className="bg-gray-50/50 rounded-[2rem] p-8 border border-gray-100 shadow-inner">
                                <p className="text-xl font-black text-gray-900 mb-1 leading-none">{order.customer?.name}</p>
                                <p className="text-sm font-bold text-gray-400 mb-6 italic">{order.customer?.email}</p>
                                <div className="flex items-start gap-3 pt-6 border-t border-gray-100 text-gray-500">
                                    <MapPin size={16} className="mt-1 flex-shrink-0" />
                                    <p className="text-sm font-medium italic leading-relaxed">{order.shippingAddress || 'No registry address provided.'}</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <ShieldCheck size={12} className="text-red-600" /> Settlement Log
                            </h4>
                            <div className="bg-gray-50/50 rounded-[2rem] p-8 border border-gray-100 shadow-inner">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="px-4 py-1.5 bg-white border border-gray-200 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-500">{order.paymentMethod}</span>
                                    <span className="text-3xl font-black text-gray-900 tracking-tighter italic">₱{order.totalAmount.toLocaleString()}</span>
                                </div>

                                {order.paymentMethod === 'GCash' && order.receiptImage && (
                                    <div className="space-y-4 pt-6 border-t border-gray-100">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-gray-400 italic">Reference Trace</span>
                                            <span className="text-gray-900 font-mono text-xs">{order.referenceNumber}</span>
                                        </div>
                                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-200 group bg-white p-2">
                                            <img src={order.receiptImage} className="w-full h-full object-contain transition-transform group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <a href={order.receiptImage} target="_blank" rel="noreferrer" className="p-4 bg-white rounded-full text-gray-900 shadow-2xl">
                                                    <ExternalLink size={24} />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-8">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Package size={12} className="text-red-600" /> Order Artifacts
                        </h4>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 no-scrollbar">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex gap-6 p-6 rounded-[2rem] border border-gray-50 hover:bg-gray-50 transition-all group bg-white shadow-sm hover:shadow-md">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-inner">
                                        <img src={item.product?.images?.[0]?.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                    </div>
                                    <div className="flex-1 py-1">
                                        <h5 className="text-lg font-black text-gray-900 group-hover:text-red-600 transition-colors uppercase tracking-tight mb-1">{item.product?.name}</h5>
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4 italic">Artisan Registry: {item.product?.id?.toString().slice(-6).toUpperCase() || 'N/A'}</p>
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm font-black text-gray-900 italic">₱{item.price.toLocaleString()} <span className="text-gray-400 font-medium ml-2 text-xs italic">&times; {item.quantity}</span></p>
                                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Handcrafted</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function FeedbackViewModal({ order, onClose }) {
    if (!order) return null;

    const isReturnRequest = order.status === 'Return Requested';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl"
            >
                <div className="mb-8">
                    <p className={`font-black text-[10px] uppercase tracking-[0.4em] mb-2 ${isReturnRequest ? 'text-red-600' : 'text-green-600'}`}>
                        {isReturnRequest ? 'Return Request' : 'Client Review'}
                    </p>
                    <h3 className="text-4xl font-black text-gray-900 italic uppercase tracking-tighter mb-2">
                        {isReturnRequest ? 'Product Return' : 'Customer Feedback'}
                    </h3>
                    <p className="text-gray-500 font-medium italic">
                        Order #{order.id?.toString().slice(-8).toUpperCase() || 'N/A'}
                    </p>
                </div>

                {isReturnRequest ? (
                    <div className="space-y-6 mb-10">
                        <div className="bg-red-50/50 rounded-[2rem] p-8 border border-red-100">
                            <div className="flex items-center gap-3 mb-4">
                                <Undo2 size={20} className="text-red-600" />
                                <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest">Return Reason</h4>
                            </div>
                            <p className="text-gray-700 font-medium italic leading-relaxed">
                                {order.returnReason || 'No reason provided.'}
                            </p>
                        </div>

                        {order.returnProof && (
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <FileVideo size={12} /> Evidence Attachment
                                </h4>
                                <div className="relative rounded-2xl overflow-hidden border border-gray-200 group bg-white p-2">
                                    <img src={order.returnProof} className="w-full h-auto object-contain max-h-80 transition-transform group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <a href={order.returnProof} target="_blank" rel="noreferrer" className="p-4 bg-white rounded-full text-gray-900 shadow-2xl">
                                            <ExternalLink size={24} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-gray-50/50 rounded-[2rem] p-6 border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Info size={16} className="text-gray-400" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Action Required</p>
                            </div>
                            <p className="text-sm text-gray-600 font-medium italic">
                                Review the return request and contact the customer to arrange pickup or provide return instructions.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 mb-10">
                        <div className="bg-green-50/50 rounded-[2rem] p-8 border border-green-100">
                            <div className="flex items-center gap-3 mb-4">
                                {order.rating && (
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={20}
                                                className={i < order.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <p className="text-gray-700 font-medium italic leading-relaxed">
                                {order.review || 'Customer completed the order without leaving a review.'}
                            </p>
                        </div>

                        <div className="bg-gray-50/50 rounded-[2rem] p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Client</p>
                                    <p className="font-bold text-gray-900">{order.customer?.name}</p>
                                </div>
                                <CheckCircle size={24} className="text-green-600" />
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="w-full py-4 rounded-2xl bg-black text-white font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl"
                >
                    Close
                </button>
            </motion.div>
        </div>
    );
}

export default function SellerOrders() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [updatingId, setUpdatingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [auditOrder, setAuditOrder] = useState(null);
    const [viewFeedback, setViewFeedback] = useState(null);
    const [viewOrder, setViewOrder] = useState(null);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await api.get('/orders');
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifySuccess = () => {
        setAuditOrder(null);
        fetchOrders();
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            setUpdatingId(orderId);
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            await fetchOrders();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    if (authLoading || !user) return null;

    const filteredOrders = orders.filter(order => {
        const matchesFilter = filter === 'All' || order.status === filter;
        const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusCounts = () => {
        const counts = { All: orders.length };
        ['Pending', 'To Ship', 'Shipped', 'Delivered', 'Completed', 'Return Requested', 'Cancelled'].forEach(s => {
            counts[s] = orders.filter(o => o.status === s).length;
        });
        return counts;
    };

    const statusCounts = getStatusCounts();

    const orderStages = ['Pending', 'Processing', 'To Ship', 'Shipped', 'Delivered', 'Completed'];

    const OrderStatusStepper = ({ currentStatus }) => {
        const currentIndex = orderStages.indexOf(currentStatus);
        const isCancelled = currentStatus === 'Cancelled';
        const isReturned = currentStatus === 'Return Requested';

        return (
            <div className="flex items-center gap-1 mt-3">
                {orderStages.map((stage, idx) => {
                    const isCompleted = !isCancelled && !isReturned && idx <= currentIndex;
                    const isCurrent = stage === currentStatus;

                    return (
                        <div key={stage} className="flex items-center gap-1">
                            <div
                                className={`w-3 h-3 rounded-full border-2 ${isCurrent ? 'bg-red-600 border-red-600' :
                                    isCompleted ? 'bg-green-500 border-green-500' :
                                        'bg-white border-gray-200'
                                    }`}
                                title={stage}
                            />
                            {idx < orderStages.length - 1 && (
                                <div className={`w-4 h-0.5 ${idx < currentIndex ? 'bg-green-500' : 'bg-gray-100'}`} />
                            )}
                        </div>
                    );
                })}
                {(isCancelled || isReturned) && (
                    <div className="flex items-center gap-1 ml-1 px-2 py-0.5 bg-red-50 rounded-md">
                        <div className="w-2 h-2 rounded-full bg-red-600" />
                        <span className="text-[7px] font-black text-red-600 uppercase">{currentStatus}</span>
                    </div>
                )}
            </div>
        );
    };

    const StatusActionButtons = ({ order }) => {
        const status = order.status;

        if (status === 'Pending') {
            return (
                <div className="flex gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'Processing'); }}
                        className="px-4 py-2 bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg"
                    >
                        Accept Order
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'Cancelled'); }}
                        className="px-4 py-2 bg-white text-gray-400 border border-gray-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                    >
                        Reject
                    </button>
                </div>
            );
        }

        if (status === 'Processing') {
            return (
                <button
                    onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'To Ship'); }}
                    className="px-6 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-red-100"
                >
                    Ready for Courier
                </button>
            );
        }

        if (status === 'To Ship') {
            return (
                <button
                    onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'Shipped'); }}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-indigo-100"
                >
                    Mark as Shipped
                </button>
            );
        }

        if (status === 'Shipped') {
            return (
                <button
                    onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'Delivered'); }}
                    className="px-6 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-green-100"
                >
                    Confirm Delivery
                </button>
            );
        }

        if (status === 'Cancellation Requested') {
            return (
                <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'Cancelled'); }} className="px-4 py-2 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-red-100">Approve</button>
                    <button onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'Processing'); }} className="px-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all border border-gray-200">Deny</button>
                </div>
            );
        }

        return (
            <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${status === 'Completed' ? 'bg-green-50 text-green-600 border-green-100' :
                status === 'Cancelled' ? 'bg-gray-50 text-gray-400 border-gray-100' :
                    'bg-white text-gray-500 border-gray-100'
                }`}>
                {status}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#fdfbf7]">
            <Navbar />

            <main className="container mx-auto px-4 md:px-8 py-12">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="mb-8 flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-gray-100 hover:border-red-600 hover:bg-red-50 transition-all shadow-sm group"
                >
                    <ArrowLeft size={18} className="text-gray-400 group-hover:text-red-600 transition-colors" />
                    <span className="text-sm font-black text-gray-600 group-hover:text-red-600 uppercase tracking-widest transition-colors">Back</span>
                </button>

                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <p className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] mb-3">Artisan Ledger</p>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tighter italic uppercase">Order Registry</h1>
                        <p className="text-gray-500 mt-2 font-medium italic">Managing your handcrafted order and logistics.</p>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Filter by Order ID or Client..."
                            className="pl-12 pr-6 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm outline-none focus:border-red-600 transition-all font-bold text-sm min-w-[350px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                {auditOrder && <ReceiptViewModal order={auditOrder} onClose={() => setAuditOrder(null)} onVerify={handleVerifySuccess} />}
                {viewFeedback && <FeedbackViewModal order={viewFeedback} onClose={() => setViewFeedback(null)} />}
                {viewOrder && <OrderDetailModal order={viewOrder} onClose={() => setViewOrder(null)} />}

                {loading ? (
                    <div className="py-32 text-center">
                        <div className="w-16 h-16 border-4 border-red-600/10 border-t-red-600 rounded-full animate-spin mx-auto mb-6"></div>
                        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Accessing Orders Registry...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar">
                            {['All', 'Pending', 'To Ship', 'Shipped', 'Delivered', 'Completed', 'Return Requested', 'Cancelled'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`relative px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${filter === f ? 'bg-red-600 text-white border-red-600 shadow-xl shadow-red-100' : 'bg-white text-gray-400 border-gray-100 hover:border-red-600'}`}
                                >
                                    {f}
                                    {statusCounts[f] > 0 && (
                                        <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[8px] ${filter === f ? 'bg-white text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                                            {statusCounts[f]}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                        <th className="px-8 py-6">Order ID</th>
                                        <th className="px-8 py-6">Client Info</th>
                                        <th className="px-8 py-6">Status Management</th>
                                        <th className="px-8 py-6">Value / Settlement</th>
                                        <th className="px-8 py-6 text-right">order Log</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredOrders.map(order => (
                                        <tr key={order.id} className="group hover:bg-red-50/30 transition-all cursor-pointer" onClick={() => setViewOrder(order)}>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-black text-gray-900 mb-1 group-hover:text-red-600 transition-colors uppercase tracking-tight">#{order.id?.toString().slice(-8).toUpperCase() || 'N/A'}</p>
                                                <div className="flex items-center gap-1.5 opacity-50">
                                                    <Package size={12} />
                                                    <span className="text-[10px] font-bold">{order.items.length} Pieces Ordered</span>
                                                </div>
                                                <OrderStatusStepper currentStatus={order.status} />
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black group-hover:bg-red-600 group-hover:text-white transition-all shadow-inner">
                                                        {order.customer?.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 leading-none mb-1">{order.customer?.name}</p>
                                                        <div className="flex items-center gap-1 opacity-50">
                                                            <MapPin size={10} />
                                                            <span className="text-[9px] font-medium line-clamp-1 max-w-[150px] italic">{order.shippingAddress}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <StatusActionButtons order={order} />
                                                    {updatingId === order.id && <div className="w-4 h-4 border-2 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xl font-black text-gray-900 tracking-tighter mb-1">₱{order.totalAmount.toLocaleString()}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest opacity-60">{order.paymentMethod}</span>
                                                    {order.paymentMethod === 'GCash' && (
                                                        <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border ${order.isPaymentVerified ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                            {order.isPaymentVerified ? 'Settled' : 'Awaiting Audit'}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {order.paymentMethod === 'GCash' && order.receiptImage && (
                                                        <button
                                                            onClick={() => setAuditOrder(order)}
                                                            className={`p-3 rounded-2xl transition-all shadow-xl ${order.isPaymentVerified ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white shadow-amber-100'}`}
                                                            title={order.isPaymentVerified ? "View Receipt" : "Audit Payment Proof"}
                                                        >
                                                            <ShieldCheck size={18} />
                                                        </button>
                                                    )}
                                                    {(order.status === 'Completed' || order.status === 'Return Requested') && (
                                                        <button
                                                            onClick={() => setViewFeedback(order)}
                                                            className={`p-3 rounded-2xl transition-all shadow-xl ${order.status === 'Return Requested' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}
                                                            title={order.status === 'Return Requested' ? 'View Return Request' : 'View Client Review'}
                                                        >
                                                            {order.status === 'Return Requested' ? <Undo2 size={18} /> : <Star size={18} />}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setViewOrder(order);
                                                        }}
                                                        className="p-3 rounded-2xl bg-gray-50 text-gray-300 hover:bg-gray-900 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredOrders.length === 0 && (
                                <div className="py-24 text-center">
                                    <Package size={48} className="mx-auto text-gray-100 mb-4" />
                                    <h3 className="text-3xl font-black text-gray-900 mb-2 italic tracking-tighter">Registry Silent</h3>
                                    <p className="text-gray-400 font-medium italic">No orders match your current platform filter.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
