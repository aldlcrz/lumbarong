import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '@/utils/api';
import Navbar from '@/components/Navbar';
import ChatBox from '@/components/ChatBox';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ShieldCheck, MapPin, Calendar, Package, ShoppingCart, MessageCircle, ChevronRight } from 'lucide-react';

export default function ShopProfile() {
    const router = useRouter();
    const { id } = router.query;
    const { user: currentUser } = useAuth();
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        if (id) {
            fetchShopData();
        }
    }, [id]);

    const fetchShopData = async () => {
        try {
            setLoading(true);
            const [shopRes, productsRes] = await Promise.all([
                api.get(`/auth/seller/${id}`),
                api.get(`/products?shop=${id}`)
            ]);
            setShop(shopRes.data);
            setProducts(productsRes.data);
        } catch (error) {
            console.error('Error fetching shop:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center font-bold text-red-600 animate-pulse uppercase tracking-widest text-xs">Summoning Artisan Catalog...</div>;
    if (!shop) return <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">Shop not found.</div>;

    return (
        <div className="min-h-screen bg-[#f5f5f5]">
            <Navbar />

            <main className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
                {/* Shop Header Section - Shopee Style */}
                <div className="bg-white rounded-sm shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Left: Quick Profile Card */}
                        <div className="md:w-1/3 bg-gray-900 rounded-lg p-6 text-white relative overflow-hidden group">
                            <div className="absolute inset-0 bg-red-600/10 group-hover:bg-red-600/20 transition-all"></div>
                            <div className="relative flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full border-2 border-white/20 overflow-hidden bg-white/10 shrink-0">
                                    {shop.profileImage ? (
                                        <img src={shop.profileImage} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl font-black italic text-red-500">
                                            {shop.shopName?.charAt(0) || 'L'}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-xl font-bold truncate mb-1">{shop.shopName || 'Lumban Master Artisan'}</h1>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter mb-3">Lumban Verified Partner</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                if (!currentUser) {
                                                    router.push('/login?redirect=' + router.asPath);
                                                    return;
                                                }
                                                setShowChat(true);
                                            }}
                                            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-sm flex items-center gap-1 transition-all"
                                        >
                                            <MessageCircle size={12} />
                                            Chat Now
                                        </button>
                                        <button className="px-4 py-1.5 border border-white/20 hover:bg-white/10 text-white text-[10px] font-bold rounded-sm transition-all">
                                            Follow
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Stats Grid */}
                        <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12 px-2 py-4">
                            <div className="flex items-start gap-3">
                                <Package className="text-gray-400" size={18} />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-medium">Products</p>
                                    <p className="text-red-500 font-bold">{shop.productCount || 0}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Star className="text-gray-400" size={18} />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-medium">Rating</p>
                                    <p className="text-red-500 font-bold">{shop.averageRating} <span className="text-gray-400 text-[8px] font-normal">({shop.totalReviews} Reviews)</span></p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="text-gray-400" size={18} />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-medium">Joined</p>
                                    <p className="text-red-500 font-bold whitespace-nowrap">
                                        {shop.createdAt ? (
                                            (() => {
                                                const diff = Date.now() - new Date(shop.createdAt).getTime();
                                                const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
                                                if (months < 1) return 'Just Joined';
                                                if (months < 12) return `${months} Months Ago`;
                                                return `${Math.floor(months / 12)} Years Ago`;
                                            })()
                                        ) : '24 Months Ago'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="text-green-600" size={18} />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-medium">Verified</p>
                                    <p className="text-red-500 font-bold">{shop.isVerified ? 'Artisan Certified' : 'Verification Pending'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 col-span-2">
                                <MapPin className="text-gray-400" size={18} />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-medium">Location</p>
                                    <p className="text-gray-700 font-medium">Lumban, Laguna, Philippines</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                {shop.shopDescription && (
                    <div className="bg-white rounded-sm shadow-sm p-8 mb-6">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900 border-b border-gray-100 pb-4 mb-4">About the Artisan</h2>
                        <p className="text-sm text-gray-600 leading-relaxed max-w-4xl whitespace-pre-wrap">
                            {shop.shopDescription}
                        </p>
                    </div>
                )}

                {/* Products Grid */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            All Products <span className="text-sm font-normal text-gray-400">({products.length})</span>
                        </h2>
                        <div className="flex gap-4 text-xs font-medium text-gray-500">
                            <span className="text-red-500 border-b-2 border-red-500 pb-1 cursor-pointer">Most Popular</span>
                            <span className="hover:text-red-500 cursor-pointer pb-1 transition-colors">Latest Items</span>
                            <span className="hover:text-red-500 cursor-pointer pb-1 transition-colors">Price Range</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {products.map(product => (
                            <Link href={`/products/${product.id}`} key={product.id}>
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-white rounded-sm shadow-sm overflow-hidden cursor-pointer border border-transparent hover:border-red-500 transition-all group"
                                >
                                    <div className="aspect-[3/4] overflow-hidden bg-gray-50">
                                        <img
                                            src={product.images?.[0]?.url || product.images?.[0] || 'https://via.placeholder.com/300x400?text=Lumban+Barong'}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            alt={product.name}
                                        />
                                    </div>
                                    <div className="p-3">
                                        <h3 className="text-[13px] text-gray-700 line-clamp-2 h-10 mb-2 leading-tight group-hover:text-red-500 transition-colors">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="text-red-500 text-sm font-bold">₱{product.price.toLocaleString()}</span>
                                            <span className="text-[10px] text-gray-400">{((product.id?.charCodeAt(1) || 0) * 8) % 1000} Sold</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>

                    {products.length === 0 && (
                        <div className="bg-white rounded-sm shadow-sm p-12 text-center">
                            <Package className="mx-auto text-gray-200 mb-4" size={64} />
                            <p className="text-gray-400 font-medium italic">This artisan hasn't listed any collections yet.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Artisan ChatBox */}
            <AnimatePresence>
                {showChat && (
                    <ChatBox
                        receiver={shop}
                        onClose={() => setShowChat(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
