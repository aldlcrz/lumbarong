import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import api from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    Truck,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Undo2,
    MapPin,
    Calendar,
    CreditCard,
    Camera,
    Upload,
    Check,
    Star,
    FileVideo,
    Info,
    ChevronRight,
    ArrowLeft
} from 'lucide-react';

function PaymentProofModal({ orderId, onClose, onSuccess }) {
    const [file, setFile] = useState(null);
    const [refNum, setRefNum] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !refNum) return alert('Please provide both the receipt image and reference number.');

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const uploadRes = await api.post('/upload', formData);

            await api.post(`/orders/${orderId}/payment-proof`, {
                referenceNumber: refNum,
                receiptImage: uploadRes.data.url
            });

            onSuccess();
        } catch (err) {
            alert('Failed to submit payment proof.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl"
            >
                <h3 className="text-3xl font-black text-gray-900 mb-2 italic uppercase tracking-tighter">GCash Settlement</h3>
                <p className="text-gray-500 font-medium mb-8 italic">Upload your transaction receipt to secure your Order.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 ml-1">Reference Number</label>
                        <input
                            type="text"
                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-red-600 outline-none transition-all font-bold"
                            placeholder="Enter 13-digit reference..."
                            value={refNum}
                            onChange={e => setRefNum(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 ml-1">Transaction Receipt</label>
                        <label className="w-full h-40 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-red-600 transition-all bg-gray-50/50 group overflow-hidden relative">
                            {file ? (
                                <div className="absolute inset-0 bg-green-50 flex items-center justify-center">
                                    <div className="text-center">
                                        <Check size={32} className="text-green-600 mx-auto mb-2" />
                                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">{file.name}</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Camera size={32} className="text-gray-300 group-hover:text-red-600 mb-2 transition-colors" />
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Image</p>
                                </>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={e => setFile(e.target.files[0])} />
                        </label>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 rounded-2xl border border-gray-100 font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="flex-1 py-4 rounded-2xl bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-gray-200"
                        >
                            {uploading ? 'Processing...' : 'Submit Proof'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

function ReviewModal({ orderId, onClose, onSuccess }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            let imageUrl = '';
            if (file) {
                const formData = new FormData();
                formData.append('image', file);
                const uploadRes = await api.post('/upload', formData);
                imageUrl = uploadRes.data.url;
            }

            await api.post(`/orders/${orderId}/review`, {
                rating,
                comment,
                images: imageUrl ? [imageUrl] : []
            });

            onSuccess();
        } catch (err) {
            alert('Failed to submit review.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl"
            >
                <h3 className="text-3xl font-black text-gray-900 mb-2 italic uppercase tracking-tighter">Rate Your Artwork</h3>
                <p className="text-gray-500 font-medium mb-8 italic">Share your thoughts on the artisan's craftsmanship.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center gap-2 mb-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`transition-all ${rating >= star ? 'text-amber-400 scale-110' : 'text-gray-200'}`}
                            >
                                <Star size={40} fill={rating >= star ? 'currentColor' : 'none'} />
                            </button>
                        ))}
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 ml-1">Your Feedback</label>
                        <textarea
                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-sm min-h-[100px] resize-none"
                            placeholder="Tell us about the quality and fit..."
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 ml-1">Attach Photo (Optional)</label>
                        <label className="w-full h-32 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-red-600 transition-all bg-gray-50/50 group overflow-hidden relative">
                            {file ? (
                                <div className="absolute inset-0 bg-green-50 flex items-center justify-center">
                                    <div className="text-center">
                                        <Check size={24} className="text-green-600 mx-auto mb-1" />
                                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">{file.name}</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Camera size={24} className="text-gray-300 group-hover:text-red-600 mb-1 transition-colors" />
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Add Masterpiece Photo</p>
                                </>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={e => setFile(e.target.files[0])} />
                        </label>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl border border-gray-100 font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-gray-50">Later</button>
                        <button type="submit" disabled={uploading} className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-red-100">
                            {uploading ? 'Processing...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

function ReturnModal({ orderId, onClose, onSuccess }) {
    const [reason, setReason] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !reason) return alert('Please provide a reason and photographic proof for the return.');

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const uploadRes = await api.post('/upload', formData);

            await api.post(`/orders/${orderId}/return-request`, {
                reason,
                proofImages: [uploadRes.data.url]
            });

            onSuccess();
        } catch (err) {
            alert('Failed to submit return request.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                        <AlertCircle size={24} />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 italic uppercase tracking-tighter">Return Registry</h3>
                </div>
                <p className="text-gray-500 font-medium mb-8 italic text-sm">Please provide proof of damage or incorrect craftsmanship.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 ml-1">Detailed Reason</label>
                        <textarea
                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-sm min-h-[120px] resize-none"
                            placeholder="Explain the issue with the design..."
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3 ml-1">Photo/Video Proof (Mandatory)</label>
                        <label className="w-full h-32 rounded-3xl border-2 border-dashed border-red-100 flex flex-col items-center justify-center cursor-pointer hover:border-red-600 transition-all bg-red-50/20 group overflow-hidden relative">
                            {file ? (
                                <div className="absolute inset-0 bg-red-50 flex items-center justify-center">
                                    <div className="text-center">
                                        <FileVideo size={24} className="text-red-600 mx-auto mb-1" />
                                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">{file.name}</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Camera size={24} className="text-gray-300 group-hover:text-red-600 mb-1 transition-colors" />
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Upload Evidence</p>
                                </>
                            )}
                            <input type="file" className="hidden" onChange={e => setFile(e.target.files[0])} required />
                        </label>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl border border-gray-100 font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-gray-50">Back</button>
                        <button type="submit" disabled={uploading} className="flex-1 py-4 rounded-2xl bg-black text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-gray-200">
                            {uploading ? 'Registering...' : 'File Return Request'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default function MyOrders() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const [filter, setFilter] = useState('All');
    const [showPaymentModal, setShowPaymentModal] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(null);
    const [showReturnModal, setShowReturnModal] = useState(null);

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

    const handleActionSuccess = () => {
        setShowPaymentModal(null);
        setShowReviewModal(null);
        setShowReturnModal(null);
        fetchOrders();
    };

    const requestCancel = async (orderId) => {
        if (!confirm('Are you sure you want to request cancellation for this order?')) return;

        try {
            setCancellingId(orderId);
            await api.post(`/orders/${orderId}/cancel-request`);
            await fetchOrders();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to request cancellation');
        } finally {
            setCancellingId(null);
        }
    };

    const handleCompleteOrder = async (orderId) => {
        if (!confirm('Have you received your order and are you satisfied with the quality?')) return;
        try {
            await api.post(`/orders/${orderId}/complete`);
            await fetchOrders();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to complete order');
        }
    };

    if (authLoading || !user) return null;

    const filteredOrders = orders.filter(o => {
        if (filter === 'All') return true;
        if (filter === 'Processing') return o.status === 'Pending' || o.status === 'Processing';
        if (filter === 'Shipped') return ['Shipped', 'To Be Delivered', 'Delivered'].includes(o.status);
        return o.status === filter;
    });

    const statusMap = {
        'Pending': { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', step: 0 },
        'Processing': { icon: Package, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', step: 0 },
        'To Ship': { icon: Package, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100', step: 1 },
        'Shipped': { icon: Truck, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100', step: 2 },
        'To Be Delivered': { icon: Truck, color: 'text-cyan-500', bg: 'bg-cyan-50', border: 'border-cyan-100', step: 2 },
        'Delivered': { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-100', step: 2 },
        'Completed': { icon: CheckCircle2, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', step: 3 },
        'Cancellation Requested': { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', step: -1 },
        'Cancelled': { icon: XCircle, color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-100', step: -1 },
        'Return Requested': { icon: Undo2, color: 'text-red-800', bg: 'bg-red-50', border: 'border-red-200', step: -1 }
    };

    const orderSteps = ['Processing', 'To Ship', 'Shipped', 'Completed'];

    const OrderTracker = ({ currentStatus }) => {
        const S = statusMap[currentStatus] || statusMap['Pending'];
        const currentStep = S.step;

        if (currentStep === -1) return null;

        return (
            <div className="w-full py-8 border-b border-gray-50">
                <div className="flex justify-between relative max-w-3xl mx-auto px-4 md:px-0">
                    <div className="absolute top-[18px] left-0 w-full h-[2px] bg-gray-100 -z-0" />
                    <div
                        className="absolute top-[18px] left-0 h-[2px] bg-green-500 transition-all duration-1000 -z-0"
                        style={{ width: `${(currentStep / (orderSteps.length - 1)) * 100}%` }}
                    />
                    {orderSteps.map((step, idx) => {
                        const isCompleted = idx < currentStep;
                        const isCurrent = idx === currentStep;
                        return (
                            <div key={step} className="flex flex-col items-center relative z-10">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${isCurrent ? 'bg-white border-red-600 text-red-600 shadow-lg shadow-red-100' :
                                    isCompleted ? 'bg-green-500 border-green-500 text-white' :
                                        'bg-white border-gray-100 text-gray-300'
                                    } transition-all duration-500`}>
                                    {isCompleted ? <Check size={16} strokeWidth={3} /> : <span className="text-xs font-black">{idx + 1}</span>}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest mt-3 whitespace-nowrap hidden md:block ${isCurrent ? 'text-red-600' :
                                    isCompleted ? 'text-green-600' :
                                        'text-gray-300'
                                    }`}>
                                    {step}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#fdfbf7]">
            <Navbar />

            <main className="container mx-auto px-4 md:px-8 py-12 max-w-5xl">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="mb-8 flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-gray-100 hover:border-red-600 hover:bg-red-50 transition-all shadow-sm group"
                >
                    <ArrowLeft size={18} className="text-gray-400 group-hover:text-red-600 transition-colors" />
                    <span className="text-sm font-black text-gray-600 group-hover:text-red-600 uppercase tracking-widest transition-colors">Back</span>
                </button>

                <header className="mb-12">
                    <p className="text-red-600 font-black text-[10px] uppercase tracking-[0.3em] mb-3">Customer Registry</p>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter italic uppercase">My Heritage Collection</h1>
                    <p className="text-gray-500 mt-2 font-medium italic">Track your Ordered Barongs and Filipino designs.</p>
                </header>

                <div className="flex gap-2 overflow-x-auto pb-8 no-scrollbar">
                    {['All', 'Processing', 'To Ship', 'Shipped', 'Completed', 'Return Requested'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${filter === f ? 'bg-red-600 text-white border-red-600 shadow-xl shadow-red-100' : 'bg-white text-gray-400 border-gray-100 hover:border-red-600'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {showPaymentModal && <PaymentProofModal orderId={showPaymentModal} onClose={() => setShowPaymentModal(null)} onSuccess={handleActionSuccess} />}
                {showReviewModal && <ReviewModal orderId={showReviewModal} onClose={() => setShowReviewModal(null)} onSuccess={handleActionSuccess} />}
                {showReturnModal && <ReturnModal orderId={showReturnModal} onClose={() => setShowReturnModal(null)} onSuccess={handleActionSuccess} />}

                {loading ? (
                    <div className="py-24 text-center">
                        <div className="w-16 h-16 border-4 border-red-600/10 border-t-red-600 rounded-full animate-spin mx-auto mb-6"></div>
                        <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Accessing Private Registry...</p>
                    </div>
                ) : filteredOrders.length > 0 ? (
                    <div className="grid grid-cols-1 gap-10">
                        {filteredOrders.map((order, i) => {
                            const S = statusMap[order.status] || statusMap['Pending'];
                            return (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
                                >
                                    {/* Lazada Style Tracker */}
                                    <OrderTracker currentStatus={order.status} />

                                    <div className="p-8 md:p-12 relative">
                                        {/* Header: Status & ID */}
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-16 h-16 rounded-3xl ${S.bg} ${S.color} flex items-center justify-center border-2 ${S.border} shadow-sm`}>
                                                    <S.icon size={32} />
                                                </div>
                                                <div>
                                                    <p className={`text-xl font-black ${S.color}`}>
                                                        {order.status === 'Pending' ? 'Processing' :
                                                            order.status === 'Delivered' ? 'Completed' :
                                                                order.status}
                                                    </p>
                                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Order ID: #{order.id?.toString().slice(-8).toUpperCase() || 'N/A'}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                {/* GCash Upload Proof Button - Only for Pending orders before registry progression */}
                                                {order.paymentMethod === 'GCash' && !order.isPaymentVerified && order.status === 'Pending' && (
                                                    <button
                                                        onClick={() => setShowPaymentModal(order.id)}
                                                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-black text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-gray-200"
                                                    >
                                                        <Upload size={16} />
                                                        {order.referenceNumber ? 'Update Proof' : 'Upload Proof'}
                                                    </button>
                                                )}

                                                {/* Confirm Receipt & Return - For Delivered orders */}
                                                {order.status === 'Delivered' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleCompleteOrder(order.id)}
                                                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-green-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-green-100"
                                                        >
                                                            <CheckCircle2 size={16} />
                                                            Confirm Receipt
                                                        </button>
                                                        <button
                                                            onClick={() => setShowReturnModal(order.id)}
                                                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-red-100 text-red-600 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all shadow-sm"
                                                        >
                                                            <Undo2 size={16} />
                                                            Request Return
                                                        </button>
                                                    </>
                                                )}

                                                {/* Rate Button - Only for Completed orders that haven't been reviewed */}
                                                {order.status === 'Completed' && !order.reviewComment && (
                                                    <button
                                                        onClick={() => setShowReviewModal(order.id)}
                                                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-red-100"
                                                    >
                                                        <Star size={16} />
                                                        Rate Order
                                                    </button>
                                                )}

                                                {/* Cancel Request Button - Allowed until Shipped */}
                                                {!['Shipped', 'Completed', 'Cancelled', 'Cancellation Requested', 'Return Requested'].includes(order.status) && (
                                                    <button
                                                        onClick={() => requestCancel(order.id)}
                                                        disabled={cancellingId === order.id}
                                                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-red-100 text-red-600 font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Undo2 size={16} />
                                                        {cancellingId === order.id ? 'Processing...' : 'Request Cancel'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                            {/* Left: Items */}
                                            <div className="lg:col-span-7">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Ordered Pieces</h4>
                                                <div className="space-y-6">
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx} className="flex gap-6 group">
                                                            <div className="w-24 h-32 rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                                                <img src={item.product?.images?.[0]?.url} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="flex-1 py-2">
                                                                <p className="text-lg font-black text-gray-900 group-hover:text-red-600 transition-colors uppercase tracking-tight">{item.product?.name || 'Handcrafted Piece'}</p>
                                                                <p className="text-sm text-gray-500 font-medium mb-4 italic">₱{(item.price || 0).toLocaleString()} &times; {item.quantity || 1}</p>
                                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full text-[8px] font-black text-gray-400 uppercase tracking-[0.1em]">
                                                                    Master Artisan Handcrafted
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Right: Summary */}
                                            <div className="lg:col-span-5">
                                                <div className="bg-gray-50 rounded-[2.5rem] p-10 border border-gray-50 h-full">
                                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Registry Summary</h4>
                                                    <div className="space-y-6">
                                                        <div className="flex items-center gap-4">
                                                            <MapPin size={18} className="text-gray-300" />
                                                            <div>
                                                                <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Delivery Registry</p>
                                                                <p className="text-xs font-bold text-gray-600 line-clamp-2">{order.shippingAddress}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <Calendar size={18} className="text-gray-300" />
                                                            <div>
                                                                <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Filed On</p>
                                                                <p className="text-xs font-bold text-gray-600">{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <CreditCard size={18} className="text-gray-300" />
                                                            <div>
                                                                <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Payment Settlement</p>
                                                                <p className="text-xs font-bold text-gray-600">
                                                                    {order.paymentMethod} (₱{(order.totalAmount || 0).toLocaleString()})
                                                                </p>
                                                                {order.paymentMethod === 'GCash' && order.referenceNumber && (
                                                                    <div className="mt-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">GCash Reference</p>
                                                                        <p className="text-sm font-black text-gray-900 mb-3">{order.referenceNumber}</p>
                                                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${order.isPaymentVerified ? 'bg-green-50 text-green-600 border border-green-100 shadow-sm shadow-green-100/50' : 'bg-amber-50 text-amber-600 border border-amber-100 shadow-sm shadow-amber-100/50'}`}>
                                                                            {order.isPaymentVerified ? (
                                                                                <><Check size={10} strokeWidth={3} /> Verified Registry</>
                                                                            ) : (
                                                                                <><Clock size={10} strokeWidth={3} /> Awaiting Confirmation</>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="pt-8 border-t border-gray-200 mt-8">
                                                            <div className="flex justify-between items-end">
                                                                <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em]">Total Invested</p>
                                                                <p className="text-4xl font-black text-gray-900 tracking-tighter">₱{order.totalAmount.toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-40 bg-white rounded-[4rem] border-4 border-dashed border-gray-50">
                        <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-10">
                            <Package size={48} className="text-gray-200" />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 mb-4 italic tracking-tight">Your Registry is Empty</h3>
                        <p className="text-gray-400 font-medium max-w-sm mx-auto mb-12">Start your heritage journey by ordering your first handcrafted Filipino masterpiece.</p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="bg-red-600 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-red-100"
                        >
                            Browse Masterpieces
                        </button>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
