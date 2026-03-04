import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '@/utils/api';
import Navbar from '@/components/Navbar';
import ChatBox from '@/components/ChatBox';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ShieldCheck, MapPin, Calendar, Package, MessageCircle, Phone, Smartphone, Facebook, Instagram, Video, Twitter, ChevronRight, Share2, Info, ShoppingBag } from 'lucide-react';

export default function ShopProfile() {
    const router = useRouter();
    const { id } = router.query;
    const { user: currentUser } = useAuth();
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [sortBy, setSortBy] = useState('popular');

    useEffect(() => {
        if (router.isReady && id) {
            fetchShopData();
        }
    }, [id, router.isReady]);

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

    const sortedProducts = useMemo(() => {
        const arr = [...products];
        if (sortBy === 'popular') {
            return arr.sort((a, b) => (b.ratings?.length || 0) - (a.ratings?.length || 0));
        } else if (sortBy === 'latest') {
            return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortBy === 'price') {
            return arr.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        }
        return arr;
    }, [products, sortBy]);

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                <div className="w-8 h-8 border-2 border-gray-100 border-t-gray-900 rounded-full animate-spin"></div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400">Loading Artisan Studio</p>
            </div>
        </div>
    );

    if (!shop) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-3xl p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-300">
                    <ShoppingBag size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Shop Not Found</h2>
                <p className="text-sm text-gray-500 mb-8 leading-relaxed">The artisan shop you're looking for might have moved or is temporarily unavailable.</p>
                <Link href="/" className="inline-flex items-center justify-center w-full px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all">
                    Back to Marketplace
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FAF7F2] font-['Inter']">
            <Navbar />

            <main className="container mx-auto px-4 sm:px-8 pt-32 pb-24 max-w-[1600px]">
                {/* Breadcrumbs - Easy Navigation */}
                <nav className="flex items-center gap-2 mb-8 text-[11px] font-bold uppercase tracking-widest text-[#A63A3A]/60">
                    <Link href="/" className="hover:text-[#A63A3A] transition-colors">Marketplace</Link>
                    <ChevronRight size={10} />
                    <span className="text-[#121212] italic">Artisan Profile</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-14 gap-8 xl:gap-12">
                    {/* Left Column: Shop Identity (Heritage Card) */}
                    <div className="lg:col-span-4 xl:col-span-4 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-[#E0D7CC]/50"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-3xl overflow-hidden bg-[#FAF7F2] mb-6 relative border border-[#E0D7CC]/30">
                                    {shop.profileImage ? (
                                        <img src={shop.profileImage} className="w-full h-full object-cover" alt={shop.shopName} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl font-black text-[#E0D7CC]">
                                            {shop.shopName?.charAt(0) || 'L'}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 mb-2">
                                    <h1 className="text-2xl font-black text-[#121212] tracking-tight italic uppercase">
                                        {shop.shopName || shop.name}
                                    </h1>
                                    {shop.isVerified && (
                                        <div className="text-[#D4AF37]" title="Artisan Verified">
                                            <ShieldCheck size={18} fill="currentColor" className="text-white" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] font-bold text-[#A63A3A]/50 uppercase tracking-widest mb-8">
                                    {shop.address || 'Lumban, Laguna • Philippines'}
                                </p>

                                <div className="grid grid-cols-2 gap-3 w-full mb-8">
                                    <button
                                        onClick={() => {
                                            if (!currentUser) {
                                                router.push('/login?redirect=' + router.asPath);
                                                return;
                                            }
                                            setShowChat(true);
                                        }}
                                        className="py-4 bg-[#121212] hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-[#E0D7CC]"
                                    >
                                        Message
                                    </button>
                                    <button className="py-4 border border-[#E0D7CC] hover:bg-[#FAF7F2] text-[#121212] text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all">
                                        Follow
                                    </button>
                                </div>

                                {/* Social Media Buttons */}
                                <div className="grid grid-cols-2 gap-3 w-full pt-8 border-t border-[#FAF7F2]">
                                    {shop.facebook && (
                                        <a
                                            href={shop.facebook.startsWith('http') ? shop.facebook : `https://${shop.facebook}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 py-4 bg-[#121212] hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-[#E0D7CC]"
                                        >
                                            <Facebook size={16} />
                                            <span>Facebook</span>
                                        </a>
                                    )}
                                    {shop.instagram && (
                                        <a
                                            href={shop.instagram.startsWith('http') ? shop.instagram : `https://instagram.com/${shop.instagram.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 py-4 bg-[#121212] hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-[#E0D7CC]"
                                        >
                                            <Instagram size={16} />
                                            <span>Instagram</span>
                                        </a>
                                    )}
                                    {shop.tiktok && (
                                        <a
                                            href={shop.tiktok.startsWith('http') ? shop.tiktok : `https://tiktok.com/@${shop.tiktok.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 py-4 bg-[#121212] hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-[#E0D7CC]"
                                        >
                                            <Video size={16} />
                                            <span>TikTok</span>
                                        </a>
                                    )}
                                    {shop.twitter && (
                                        <a
                                            href={shop.twitter.startsWith('http') ? shop.twitter : `https://twitter.com/${shop.twitter.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 py-4 bg-[#121212] hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-[#E0D7CC]"
                                        >
                                            <Twitter size={16} />
                                            <span>Twitter</span>
                                        </a>
                                    )}
                                    <button className="flex items-center justify-center gap-2 py-4 border border-[#E0D7CC] hover:bg-[#FAF7F2] text-[#121212] text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all col-span-2">
                                        <Share2 size={16} />
                                        Share Studio
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#E0D7CC]/50">
                            <h3 className="text-[10px] font-black text-[#A63A3A]/40 uppercase tracking-widest mb-6 px-2">Contact Details</h3>
                            <div className="space-y-4">
                                {shop.phone && (
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-transparent hover:border-[#E0D7CC]/30 transition-all group">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#E0D7CC] group-hover:text-[#A63A3A] shadow-sm transition-colors">
                                            <Phone size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-[#A63A3A]/50 uppercase tracking-widest leading-none mb-1">Business Line</p>
                                            <p className="text-sm font-bold text-[#121212]">{shop.phone}</p>
                                        </div>
                                    </div>
                                )}
                                {shop.gcashNumber && (
                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50/30 border border-transparent hover:border-blue-100 transition-all group">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-400 group-hover:text-blue-600 shadow-sm transition-colors">
                                            <Smartphone size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-blue-600/50 uppercase tracking-widest leading-none mb-1">GCash Master</p>
                                            <p className="text-sm font-bold text-[#121212]">{shop.gcashNumber}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-transparent hover:border-[#E0D7CC]/30 transition-all group">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#E0D7CC] group-hover:text-[#A63A3A] shadow-sm transition-colors">
                                        <MapPin size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-[#A63A3A]/50 uppercase tracking-widest leading-none mb-1">Showroom</p>
                                        <p className="text-sm font-bold text-[#121212]">Lumban, Laguna</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Narrative & Catalog */}
                    <div className="lg:col-span-8 xl:col-span-10 space-y-8">
                        {/* Stats & Narrative Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-sm border border-[#E0D7CC]/50"
                        >
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12 border-b border-[#FAF7F2] pb-12">
                                <div className="text-center md:text-left">
                                    <p className="text-[10px] font-black text-[#A63A3A]/50 uppercase tracking-widest mb-2">Pieces</p>
                                    <p className="text-3xl font-black text-[#121212] italic tracking-tighter uppercase">{shop.productCount || 0}</p>
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="text-[10px] font-black text-[#A63A3A]/50 uppercase tracking-widest mb-2">Rating</p>
                                    <div className="flex items-center justify-center md:justify-start gap-1">
                                        <p className="text-3xl font-black text-[#121212] italic tracking-tighter uppercase">{shop.averageRating || '4.9'}</p>
                                        <Star size={14} className="text-[#D4AF37] fill-[#D4AF37]" />
                                    </div>
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="text-[10px] font-black text-[#A63A3A]/50 uppercase tracking-widest mb-2">Heritage</p>
                                    <p className="text-3xl font-black text-[#121212] italic tracking-tighter uppercase whitespace-nowrap">
                                        {shop.createdAt ? (() => {
                                            const diff = Date.now() - new Date(shop.createdAt).getTime();
                                            const years = (diff / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1);
                                            return years < 1 ? 'New' : `${years}Y`;
                                        })() : '2.4Y'}
                                    </p>
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="text-[10px] font-black text-[#A63A3A]/50 uppercase tracking-widest mb-2">Category</p>
                                    <p className="text-xl font-black text-[#121212] italic tracking-tighter uppercase underline decoration-[#A63A3A]/20 decoration-2 underline-offset-4">Barong</p>
                                </div>
                            </div>

                            <div className="max-w-3xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <Info size={14} className="text-[#E0D7CC]" />
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#121212]">Artisan Narrative</h2>
                                </div>
                                <p className="text-lg text-[#121212]/70 leading-relaxed font-medium italic">
                                    "{shop.shopDescription || "Dedicated to preserving the embroidery traditions of Lumban, Laguna. Each handcrafted piece reflects a legacy of meticulous craftsmanship and timeless Filipino elegance."}"
                                </p>
                            </div>
                        </motion.div>

                        {/* Catalog Section */}
                        <div className="pt-4">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                                <h2 className="text-2xl font-black text-[#121212] tracking-tight italic uppercase">
                                    Collection <span className="text-[#E0D7CC] ml-1">({products.length})</span>
                                </h2>

                                <div className="flex gap-1 bg-[#E0D7CC]/20 p-1.5 rounded-2xl">
                                    {['popular', 'latest', 'price'].map(sort => (
                                        <button
                                            key={sort}
                                            onClick={() => setSortBy(sort)}
                                            className={`px-5 py-2 rounded-xl font-bold uppercase tracking-widest text-[9px] transition-all ${sortBy === sort ? 'bg-white text-[#121212] shadow-sm' : 'text-[#A63A3A]/60 hover:text-[#121212]'}`}
                                        >
                                            {sort === 'popular' ? 'Popular' : sort === 'latest' ? 'Recent' : 'Price'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 xl:gap-8">
                                <AnimatePresence mode="popLayout">
                                    {sortedProducts.map((product, idx) => (
                                        <motion.div
                                            key={product.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <Link href={`/products/${product.id}`}>
                                                <div className="group bg-white rounded-[2rem] overflow-hidden border border-[#E0D7CC]/30 hover:border-[#E0D7CC] hover:shadow-xl hover:shadow-[#E0D7CC]/20 transition-all">
                                                    <div className="aspect-[4/5] overflow-hidden bg-[#FAF7F2] relative">
                                                        <img
                                                            src={product.images?.[0]?.url || product.images?.[0] || 'https://via.placeholder.com/400x500?text=Lumban+Barong'}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                            alt={product.name}
                                                        />
                                                        <div className="absolute top-4 left-4">
                                                            <div className="px-3 py-1 bg-white/90 backdrop-blur shadow-sm rounded-full text-[9px] font-black uppercase tracking-widest text-[#121212]">
                                                                {product.category?.name || (typeof product.category === 'string' ? product.category : 'Handmade')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-6">
                                                        <h3 className="text-sm font-bold text-[#121212] line-clamp-2 h-10 leading-tight mb-4 group-hover:text-[#A63A3A] transition-colors uppercase tracking-tight">
                                                            {product.name}
                                                        </h3>
                                                        <div className="flex items-center justify-between pt-4 border-t border-[#FAF7F2]">
                                                            <p className="text-lg font-black text-[#121212] tracking-tighter">₱{parseFloat(product.price).toLocaleString()}</p>
                                                            <div className="flex items-center gap-1 opacity-40">
                                                                <Star size={10} className="fill-[#121212]" />
                                                                <span className="text-[10px] font-bold">{product.ratings?.length || 0}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {products.length === 0 && (
                                <div className="py-20 text-center bg-white rounded-[2.5rem] border border-[#E0D7CC]/30 border-dashed">
                                    <ShoppingBag className="mx-auto text-[#E0D7CC]/20 mb-4" size={48} />
                                    <p className="text-sm font-bold text-[#A63A3A]/40 italic">No pieces available currently.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {showChat && (
                    <ChatBox
                        receiver={shop}
                        onClose={() => setShowChat(false)}
                    />
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
}
