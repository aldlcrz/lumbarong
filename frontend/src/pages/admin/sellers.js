import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import api from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Store,
    Search,
    ShieldCheck,
    ShieldAlert,
    MoreVertical,
    Mail,
    Calendar,
    Filter,
    Plus,
    X,
    Lock,
    User as UserIcon,
    ShoppingBag,
    Star,
    ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/router';

function CreateSellerModal({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        shopName: '',
        shopDescription: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/auth/create-seller', formData);
            onSuccess();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create seller');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[3rem] p-10 max-w-xl w-full shadow-2xl relative overflow-hidden"
            >
                {/* Decorative Pattern Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h3 className="text-3xl font-black text-gray-900 mb-2 italic uppercase tracking-tighter">Initiate Artisan</h3>
                            <p className="text-gray-500 font-medium italic">Registering a new master artisan to the registry.</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <X size={24} className="text-gray-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Artisan Name</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-red-600 outline-none transition-all font-bold text-sm"
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-red-600 outline-none transition-all font-bold text-sm"
                                        placeholder="artisan@lumbarong.ph"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Access Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-red-600 outline-none transition-all font-bold text-sm"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Shop Identity</label>
                            <div className="relative">
                                <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-red-600 outline-none transition-all font-bold text-sm"
                                    placeholder="Official Shop Name"
                                    value={formData.shopName}
                                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Heritage Narrative (Description)</label>
                            <textarea
                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-red-600 outline-none transition-all font-bold text-sm resize-none h-32"
                                placeholder="Describe the artisan's craft and history..."
                                value={formData.shopDescription}
                                onChange={(e) => setFormData({ ...formData, shopDescription: e.target.value })}
                            ></textarea>
                        </div>

                        <button
                            disabled={submitting}
                            className="w-full py-5 rounded-2xl bg-black text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-2xl shadow-gray-200 disabled:opacity-50"
                        >
                            {submitting ? 'Registering...' : 'Seal Registry'}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

export default function ManageSellers() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchSellers();
        }
    }, [user]);

    const fetchSellers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/auth/sellers'); // I'll assume this endpoint returns all sellers
            setSellers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSuccess = () => {
        setShowCreateModal(false);
        fetchSellers();
    };

    const toggleVerification = async (id, isVerified) => {
        try {
            const endpoint = isVerified ? `/auth/revoke-seller/${id}` : `/auth/approve-seller/${id}`;
            await api.put(endpoint);
            fetchSellers();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    if (authLoading || !user) return null;

    const filteredSellers = sellers.filter(s => {
        const matchesFilter = filter === 'All' ||
            (filter === 'Verified' && s.isVerified) ||
            (filter === 'Pending' && !s.isVerified);
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.shopName?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#fdfbf7]">
            <Navbar />
            <div className="container mx-auto px-4 md:px-8 pt-4">
                <Link href="/admin/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-gray-100 hover:bg-red-50 hover:border-red-100 text-gray-600 hover:text-red-600 font-bold text-sm transition-all">
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </Link>
            </div>

            <AnimatePresence>
                {showCreateModal && (
                    <CreateSellerModal
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={handleCreateSuccess}
                    />
                )}
            </AnimatePresence>

            <main className="container mx-auto px-4 md:px-8 py-12">


                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <p className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] mb-3">Artisan Governance</p>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tighter italic uppercase">Seller Directory</h1>
                        <p className="text-gray-500 mt-2 font-medium italic">Overseeing the master artisans of the LumBarong platform.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or shop..."
                                className="pl-12 pr-6 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm outline-none focus:border-red-600 transition-all font-bold text-sm min-w-[300px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-gray-200"
                        >
                            <Plus size={16} />
                            Initiate Artisan
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="py-32 text-center">
                        <div className="w-16 h-16 border-4 border-red-600/10 border-t-red-600 rounded-full animate-spin mx-auto mb-6"></div>
                        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Syncing Artisan Database...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                            {['All', 'Verified', 'Pending'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${filter === f ? 'bg-gray-900 text-white border-gray-900 shadow-xl' : 'bg-white text-gray-400 border-gray-100 hover:border-red-600'}`}
                                >
                                    {f} Registry
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {filteredSellers.map(seller => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={seller.id}
                                        className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-900/5 transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 flex items-center justify-center text-2xl font-black text-gray-300 group-hover:bg-red-600 group-hover:text-white transition-all shadow-inner">
                                                {seller.shopName?.charAt(0) || seller.name.charAt(0)}
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${seller.isVerified ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                {seller.isVerified ? 'Verified Artisan' : 'Verification Pending'}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-black text-gray-900 mb-1 group-hover:text-red-600 transition-colors uppercase tracking-tight">{seller.shopName || 'Independent Artisan'}</h3>
                                        <p className="text-sm font-bold text-gray-400 mb-6">{seller.name}</p>

                                        <div className="space-y-3 mb-8">
                                            <div className="flex items-center gap-3 text-gray-500">
                                                <Mail size={14} />
                                                <span className="text-xs font-medium">{seller.email}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-500">
                                                <Calendar size={14} />
                                                <span className="text-xs font-medium italic">Joined {new Date(seller.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded-2xl">
                                            <div>
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Pieces</p>
                                                <div className="flex items-center gap-2">
                                                    <ShoppingBag size={14} className="text-red-600" />
                                                    <span className="text-sm font-black text-gray-900">{seller.productCount || 0}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Artisan Rating</p>
                                                <div className="flex items-center gap-2">
                                                    <Star size={14} className="text-amber-400 fill-amber-400" />
                                                    <span className="text-sm font-black text-gray-900">{seller.averageRating || '0.0'}</span>
                                                    <span className="text-[8px] font-bold text-gray-400">({seller.totalReviews || 0})</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {!seller.isVerified ? (
                                                <button
                                                    onClick={() => toggleVerification(seller.id, seller.isVerified)}
                                                    className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-green-100"
                                                >
                                                    Grant Approval
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => toggleVerification(seller.id, seller.isVerified)}
                                                    className="flex-1 bg-gray-50 text-gray-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all"
                                                >
                                                    Revoke Status
                                                </button>
                                            )}
                                            <button className="p-4 rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-900 hover:text-white transition-all">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {filteredSellers.length === 0 && (
                            <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
                                <Users size={48} className="mx-auto text-gray-200 mb-6" />
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Registry Silent</h3>
                                <p className="text-gray-400 font-medium">No artisans match your current governance filter.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
