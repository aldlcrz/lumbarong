import { useState, useEffect } from 'react';
import SellerLayout from '@/components/SellerLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import {
    Store,
    Facebook,
    Instagram,
    Twitter,
    Smartphone,
    FileText,
    Globe,
    Save,
    ArrowLeft,
    Share2,
    Video,
    Upload,
    X,
    User as UserIcon,
    Camera
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SellerProfile() {
    const { user, loading: authLoading, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        shopName: '',
        shopDescription: '',
        phone: '',
        facebook: '',
        instagram: '',
        tiktok: '',
        twitter: '',
        gcashNumber: '',
        profileImage: '',
        address: ''
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                shopName: user.shopName || '',
                shopDescription: user.shopDescription || '',
                phone: user.phone || '',
                facebook: user.facebook || '',
                instagram: user.instagram || '',
                tiktok: user.tiktok || '',
                twitter: user.twitter || '',
                gcashNumber: user.gcashNumber || '',
                profileImage: user.profileImage || '',
                address: user.address || ''
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put('/users/profile', formData);
            if (updateUser) {
                updateUser(res.data.user);
            }
            alert('Seller profile updated successfully');
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, profileImage: res.data.url }));
        } catch (err) {
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, profileImage: '' }));
    };

    if (authLoading) return null;
    if (user?.role !== 'seller') return null;

    return (
        <SellerLayout>
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
                    <div className="mb-12">
                        <Link href="/seller/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-gray-100 hover:bg-red-50 hover:border-red-100 text-gray-600 hover:text-red-600 font-bold text-sm transition-all shadow-sm mb-8">
                            <ArrowLeft size={18} />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter italic uppercase underline decoration-red-600/20 underline-offset-8">Shop Configuration</h1>
                        <p className="mt-4 text-gray-500 font-medium italic">Personalize your brand identity and connect your social platforms.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Public Shop Info */}
                        <div className="lg:col-span-2 space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[3rem] p-10 lg:p-14 border border-gray-100 shadow-sm"
                            >
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="p-4 rounded-3xl bg-red-50 text-red-600 shadow-inner">
                                        <Store size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight italic">Brand Identity</h2>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Public Information</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Artisan Shop Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.shopName}
                                            onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-red-600/20"
                                            placeholder="E.g., Heritage Threads"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Shop Bio / Mission</label>
                                        <textarea
                                            rows={5}
                                            value={formData.shopDescription}
                                            onChange={(e) => setFormData({ ...formData, shopDescription: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-3xl px-6 py-4 font-medium text-gray-700 focus:ring-2 focus:ring-red-600/20 resize-none italic"
                                            placeholder="Tell the story of your craftsmanship..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                                                <Smartphone size={12} className="text-red-600" /> Business Number
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-red-600/20"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                                                <FileText size={12} className="text-red-600" /> GCash Payout Number
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.gcashNumber}
                                                onChange={(e) => setFormData({ ...formData, gcashNumber: e.target.value })}
                                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-red-600/20"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Showroom / Shop Address</label>
                                        <textarea
                                            rows={2}
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-medium text-gray-700 focus:ring-2 focus:ring-red-600/20 resize-none italic"
                                            placeholder="E.g., 123 Heritage St., Lumban, Laguna"
                                        />
                                    </div>
                                </div>

                                {/* Profile Image Upload */}
                                <div className="space-y-4 mb-10 w-full">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Artisan Profile Picture</label>
                                    <div className="flex flex-col items-center">
                                        <div className="relative group">
                                            <div className="w-32 h-32 rounded-[2.5rem] bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center transition-all group-hover:border-red-200 group-hover:bg-red-50">
                                                {formData.profileImage ? (
                                                    <img src={formData.profileImage} className="w-full h-full object-cover" alt="Profile" />
                                                ) : (
                                                    <UserIcon size={40} className="text-gray-200 group-hover:text-red-200" />
                                                )}

                                                {uploading && (
                                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                        <div className="w-6 h-6 border-2 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
                                                    </div>
                                                )}
                                            </div>

                                            <label className="absolute -bottom-2 -right-2 p-3 bg-white rounded-2xl shadow-xl shadow-gray-200 border border-gray-100 text-gray-400 hover:text-red-600 hover:scale-110 transition-all cursor-pointer">
                                                <Camera size={18} />
                                                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                            </label>

                                            {formData.profileImage && (
                                                <button
                                                    type="button"
                                                    onClick={removeImage}
                                                    className="absolute -top-2 -right-2 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-gray-400 hover:text-red-600 hover:scale-110 transition-all"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="mt-4 text-[9px] font-bold text-gray-300 uppercase tracking-widest">Recommended: 1:1 Aspect Ratio (Square)</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Social Media & Actions */}
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm"
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                                        <Share2 size={20} />
                                    </div>
                                    <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight italic">Social Links</h2>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 mb-2 px-1">
                                            <Facebook size={14} className="text-[#1877F2]" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Facebook</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.facebook}
                                            onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-red-600/20"
                                            placeholder="fb.com/yourshop"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 mb-2 px-1">
                                            <Instagram size={14} className="text-[#E4405F]" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Instagram</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.instagram}
                                            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-red-600/20"
                                            placeholder="@yourshop"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 mb-2 px-1">
                                            <Video size={14} className="text-black" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TikTok</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.tiktok}
                                            onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-red-600/20"
                                            placeholder="@yourshop"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 mb-2 px-1">
                                            <Twitter size={14} className="text-[#1DA1F2]" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Twitter</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.twitter}
                                            onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-red-600/20"
                                            placeholder="@yourshop"
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gray-900 text-white rounded-[2rem] py-6 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-red-600 transition-all shadow-2xl shadow-gray-200"
                            >
                                <Save size={20} />
                                {loading ? 'Saving Shop Info...' : 'Save Configuration'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </SellerLayout>
    );
}
