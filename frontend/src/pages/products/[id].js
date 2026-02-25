import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '@/utils/api';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import ChatBox from '@/components/ChatBox';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, ShieldCheck, Truck, ArrowLeft, X, ZoomIn, ChevronLeft, ChevronRight, Edit3, LayoutDashboard, MessageSquare, Heart, AlertCircle } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000');

export default function ProductDetails() {
    const router = useRouter();
    const { id } = router.query;
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeImg, setActiveImg] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [selectedColor, setSelectedColor] = useState('Classic White');
    const [selectedSize, setSelectedSize] = useState('M');
    const [showChat, setShowChat] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        category: '',
        embroideryStyle: '',
        fabric: '',
        description: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const { addToCart } = useCart();
    const { user, loading: authLoading } = useAuth();
    const isAdmin = user?.role === 'admin';
    const isSellerOwner = user?.role === 'seller' && user?.id === product?.sellerId;
    const isBuyer = user?.role === 'customer' || !user;

    useEffect(() => {
        if (id) {
            fetchProductData();

            // Join the real-time product room
            socket.emit('join_product', id);

            // Listen for real-time reviews
            socket.on('new_review', (review) => {
                setProduct(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        ratings: [review, ...(prev.ratings || [])]
                    };
                });
            });

            return () => {
                socket.off('new_review');
            };
        }
    }, [id]);

    const fetchProductData = async () => {
        try {
            const res = await api.get(`/products/${id}`);
            setProduct(res.data);
            setEditForm({
                category: res.data.category,
                embroideryStyle: res.data.embroideryStyle || 'Traditional Calado',
                fabric: res.data.fabric || 'Piña-Seda Silk',
                description: res.data.description
            });

            // Fetch related products from same category
            const relatedRes = await api.get(`/products?category=${res.data.category}`);
            setRelatedProducts(relatedRes.data.filter(p => p.id !== id).slice(0, 4));

            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id && user) {
            api.get('/wishlist')
                .then(res => {
                    const found = res.data.find(item => item.productId === id);
                    setIsWishlisted(!!found);
                })
                .catch(err => console.error('Wishlist check error:', err));
        }
    }, [id, user]);

    const toggleWishlist = async () => {
        if (!user) {
            router.push('/login?redirect=' + router.asPath);
            return;
        }

        try {
            if (isWishlisted) {
                await api.delete(`/wishlist/${id}`);
                setIsWishlisted(false);
            } else {
                await api.post('/wishlist', { productId: id });
                setIsWishlisted(true);
            }
        } catch (err) {
            console.error('Wishlist toggle error:', err);
        }
    };

    const handleSaveSpecs = async () => {
        setIsSaving(true);
        try {
            const res = await api.put(`/products/${id}`, editForm);
            setProduct(prev => ({ ...prev, ...res.data }));
            setIsEditing(false);
        } catch (err) {
            console.error('Save error:', err);
            alert('Failed to update heritage details.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || authLoading) return <div className="flex justify-center items-center min-h-screen text-red-600 font-bold uppercase tracking-widest text-xs">Authenticating Artisan Registry...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;

    const colors = ['Classic White', 'Ivory Cream', 'Midnight Black', 'Imperial Gold', 'Deep Emerald'];
    const sizes = ['S', 'M', 'L', 'XL', 'XXL', '3XL', 'Custom'];

    return (
        <div className="min-h-screen bg-[#f5f5f5]">
            <Navbar minimal={isAdmin} />

            <main className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
                {/* Breadcrumbs - Only for Buyers */}
                {isBuyer && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 px-2">
                        <Link href="/"><span className="hover:text-red-500 cursor-pointer">LumBarong</span></Link>
                        <ChevronRight size={10} />
                        <span className="hover:text-red-500 cursor-pointer">{product.category}</span>
                        <ChevronRight size={10} />
                        <span className="text-gray-900 truncate max-w-[200px]">{product.name}</span>
                    </div>
                )}

                <div className="bg-white rounded-sm shadow-sm flex flex-col lg:flex-row p-4 min-h-[600px] gap-8">
                    {/* Left: Image Section */}
                    <div className="lg:w-[450px] shrink-0">
                        <div
                            onClick={() => setIsZoomed(true)}
                            className="aspect-square overflow-hidden bg-gray-50 relative group cursor-zoom-in border border-gray-100"
                        >
                            <motion.img
                                key={activeImg}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                src={product.images?.[activeImg]?.url || product.images?.[activeImg] || 'https://via.placeholder.com/600x800?text=Barong'}
                                alt={product.name}
                                className="w-full h-full object-contain"
                            />
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-2 relative group-img">
                            {product.images?.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImg(idx)}
                                    className={`w-20 h-20 shrink-0 border-2 transition-all p-0.5 ${activeImg === idx ? 'border-red-500' : 'border-transparent hover:border-red-500'}`}
                                >
                                    <img src={img?.url || null} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>

                        {/* Engagement Section - Only for Buyers */}
                        {isBuyer && (
                            <div className="flex items-center justify-end mt-4 px-2">
                                <div
                                    onClick={toggleWishlist}
                                    className="flex items-center gap-2 text-gray-700 cursor-pointer hover:text-red-500 transition-colors group"
                                >
                                    <motion.div whileTap={{ scale: 1.5 }}>
                                        <Heart
                                            size={20}
                                            className={`${isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-300 group-hover:text-red-500'} transition-all`}
                                        />
                                    </motion.div>
                                    <span className={`text-sm ${isWishlisted ? 'text-red-500 font-bold' : ''}`}>
                                        {isWishlisted ? 'Heritage Saved' : 'Add to Wishlist'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Details Section */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <h1 className="text-2xl font-medium text-gray-900 leading-tight mb-2">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1 border-r border-gray-200 pr-4">
                                    <span className="text-red-500 underline font-medium">{product.averageRating || '4.9'}</span>
                                    <div className="flex text-red-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={12} fill={i < Math.round(product.averageRating || 5) ? "currentColor" : "none"} className={i < Math.round(product.averageRating || 5) ? "" : "text-gray-200"} />
                                        ))}
                                    </div>
                                </div>
                                <div className="border-r border-gray-200 pr-4">
                                    <span className="text-gray-900 underline font-medium">{product.ratingsCount || 0}</span>
                                    <span className="text-gray-500 ml-1">Ratings</span>
                                </div>
                                <div>
                                    <span className="text-gray-900 font-medium">{product.soldCount || 0}</span>
                                    <span className="text-gray-500 ml-1">Sold</span>
                                </div>
                            </div>
                        </div>

                        {/* Shopee Price Block */}
                        <div className="bg-[#fafafa] p-6 rounded-sm flex items-center gap-4">
                            {isBuyer ? (
                                <>
                                    <span className="text-sm text-gray-400 line-through">₱{(product.price * 1.5).toLocaleString()}</span>
                                    <span className="text-3xl font-medium text-red-500">
                                        ₱{product.price.toLocaleString()}
                                    </span>
                                    <span className="bg-red-500 text-white text-[10px] px-1 rounded-sm font-bold uppercase">50% OFF</span>
                                </>
                            ) : (
                                <span className="text-3xl font-medium text-gray-900">
                                    ₱{product.price.toLocaleString()}
                                </span>
                            )}
                        </div>

                        {/* Order Attributes */}
                        <div className="space-y-6 px-1">
                            {/* Shop Vouchers - Only for Buyers */}
                            {isBuyer && (
                                <div className="flex items-start gap-12">
                                    <span className="text-sm text-gray-500 w-24 pt-1">Shop Vouchers</span>
                                    <div className="flex gap-2">
                                        <span className="bg-red-50 text-red-500 text-[10px] px-2 py-0.5 border border-dashed border-red-500">₱100 OFF</span>
                                        <span className="bg-red-50 text-red-500 text-[10px] px-2 py-0.5 border border-dashed border-red-500">₱500 OFF</span>
                                    </div>
                                </div>
                            )}

                            {/* Shipping - Only for Buyers */}
                            {isBuyer && (
                                <div className="flex items-start gap-12">
                                    <span className="text-sm text-gray-500 w-24">Shipping</span>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <Truck size={16} className="text-green-600" />
                                            <span className="text-sm text-gray-800 font-medium italic">Guaranteed to get by 20 - 23 Feb</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 pl-7 italic">Get a ₱50 voucher if your order arrives late.</p>
                                    </div>
                                </div>
                            )}

                            {/* Options: Color */}
                            <div className="flex items-start gap-12">
                                <span className="text-sm text-gray-500 w-24 pt-2">Color</span>
                                <div className="flex flex-wrap gap-2">
                                    {colors.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`px-4 py-2 text-xs border rounded-sm transition-all ${selectedColor === color ? 'border-red-500 text-red-500 relative ring-1 ring-red-500' : 'border-gray-200 hover:border-red-500 hover:text-red-500'}`}
                                        >
                                            {color}
                                            {selectedColor === color && (
                                                <div className="absolute right-0 bottom-0 w-3 h-3 bg-red-500 text-white flex items-center justify-center">
                                                    <span className="text-[8px]">✓</span>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Options: Size */}
                            <div className="flex items-start gap-12">
                                <span className="text-sm text-gray-500 w-24 pt-2">Size</span>
                                <div className="flex flex-wrap gap-2">
                                    {sizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-4 py-2 text-xs border rounded-sm transition-all ${selectedSize === size ? 'border-red-500 text-red-500 relative ring-1 ring-red-500' : 'border-gray-200 hover:border-red-500 hover:text-red-500'}`}
                                        >
                                            {size}
                                            {selectedSize === size && (
                                                <div className="absolute right-0 bottom-0 w-3 h-3 bg-red-500 text-white flex items-center justify-center">
                                                    <span className="text-[8px]">✓</span>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="flex items-center gap-12">
                                <span className="text-sm text-gray-500 w-24">Quantity</span>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border border-gray-200 rounded-sm overflow-hidden h-8 bg-white">
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="w-8 h-full flex items-center justify-center hover:bg-gray-50 transition-colors border-r text-gray-500"
                                        >-</button>
                                        <span className="w-12 h-full flex items-center justify-center text-sm">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(q => q + 1)}
                                            className="w-8 h-full flex items-center justify-center hover:bg-gray-50 transition-colors border-l text-gray-500"
                                        >+</button>
                                    </div>
                                    <span className="text-xs text-gray-400">{product.stock} pieces available</span>
                                </div>
                            </div>
                        </div>

                        {/* CTA Row — Role Aware */}
                        {isAdmin || isSellerOwner ? (
                            <div className="pt-8 mt-4 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                    {isSellerOwner && (
                                        <Link href={`/seller/add-product?edit=${product.id}`}>
                                            <button className="flex items-center gap-2 px-8 py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-sm hover:bg-red-600 transition-all shadow-xl shadow-gray-200">
                                                <Edit3 size={16} /> Edit Product
                                            </button>
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => router.back()}
                                        className="flex items-center gap-2 px-8 py-4 bg-white border border-gray-200 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-sm hover:border-red-600 hover:text-red-600 transition-all"
                                    >
                                        <ArrowLeft size={16} /> Go Back
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-4 pt-8">
                                    <button
                                        onClick={async () => {
                                            setIsAdding(true);
                                            await addToCart(product, quantity);
                                            setIsAdding(false);
                                        }}
                                        disabled={isAdding}
                                        className="flex-1 lg:flex-none lg:w-[220px] h-14 bg-red-50 border-2 border-red-500 text-red-500 rounded-sm font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-100 transition-all active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {isAdding ? (
                                            <div className="w-5 h-5 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <ShoppingCart size={20} />
                                                Add To Cart
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={async () => {
                                            setIsAdding(true);
                                            await addToCart(product, quantity);
                                            router.push('/checkout');
                                        }}
                                        disabled={isAdding}
                                        className="flex-1 lg:flex-none lg:w-[150px] h-14 bg-red-500 text-white rounded-sm font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all active:scale-[0.98] shadow-xl shadow-red-100 disabled:opacity-50"
                                    >
                                        {isAdding ? 'Processing...' : 'Buy Now'}
                                    </button>
                                </div>
                                {/* Lumbarong Guarantee - Only for Buyers */}
                                {isBuyer && (
                                    <div className="pt-8 border-t border-gray-100 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                            <ShieldCheck size={20} className="text-red-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Lumbarong Guarantee</p>
                                            <p className="text-[10px] text-gray-400 font-medium italic">Get the items you ordered or get your money back.</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Seller Detail & Story Section - Only for Buyers */}
                {isBuyer && (
                    <div className="mt-6 bg-white rounded-sm shadow-sm p-8 flex flex-col md:flex-row gap-12 border-t border-gray-50">
                        <div className="md:w-1/3 flex items-center gap-6 border-r border-gray-100">
                            <div className="w-20 h-20 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 text-2xl font-bold italic overflow-hidden">
                                {product.seller?.profileImage ? (
                                    <img src={product.seller.profileImage} className="w-full h-full object-cover" />
                                ) : (
                                    <span>{product.seller?.shopName?.charAt(0) || product.seller?.name?.charAt(0) || 'L'}</span>
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-lg text-gray-900 mb-2">{product.seller?.shopName || 'Lumban Master Tailors'}</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            if (!user) {
                                                router.push('/login?redirect=' + router.asPath);
                                                return;
                                            }
                                            setShowChat(true);
                                        }}
                                        className="px-4 py-1.5 border border-red-500 text-red-500 text-xs rounded-sm hover:bg-red-50 transition-colors"
                                    >
                                        Chat Now
                                    </button>
                                    <button
                                        onClick={() => router.push(`/shop/${product.sellerId}`)}
                                        className="px-4 py-1.5 border border-gray-200 text-gray-600 text-xs rounded-sm hover:bg-gray-50 transition-colors"
                                    >
                                        View Shop
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 flex items-center justify-around text-center px-4">
                            <div className="space-y-1">
                                <p className="text-xs text-gray-400">Ratings</p>
                                <p className="text-red-500 font-medium">4.9 / 5.0</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-gray-400">Response Rate</p>
                                <p className="text-red-500 font-medium">99%</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-gray-400">Joined</p>
                                <p className="text-red-500 font-medium whitespace-nowrap">
                                    {product.seller?.createdAt ? (
                                        (() => {
                                            const diff = Date.now() - new Date(product.seller.createdAt).getTime();
                                            const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
                                            if (months < 1) return 'Just Joined';
                                            if (months < 12) return `${months} Months Ago`;
                                            return `${Math.floor(months / 12)} Years Ago`;
                                        })()
                                    ) : '24 Months Ago'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-gray-400">Verified</p>
                                <p className="text-red-500 font-medium">{product.seller?.isVerified ? 'Yes' : 'Pending'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Product Description */}
                <div className="mt-6 bg-white rounded-sm shadow-sm p-8">
                    <div className="flex items-center justify-between bg-[#fafafa] p-4 mb-6">
                        <h2 className="text-lg font-medium text-gray-900 uppercase tracking-wider">Product Specifications</h2>
                        {isSellerOwner && (
                            <div className="flex gap-2">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-1.5 border border-gray-200 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveSpecs}
                                            disabled={isSaving}
                                            className="px-4 py-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-black transition-colors disabled:opacity-50"
                                        >
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 px-4 py-1.5 border border-red-500 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-red-50 transition-colors"
                                    >
                                        <Edit3 size={14} /> Edit Details
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="space-y-4 text-sm px-4">
                        <div className="flex border-b border-gray-50 pb-2 items-center">
                            <span className="w-40 text-gray-400">Category</span>
                            {isEditing ? (
                                <select
                                    value={editForm.category}
                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                    className="flex-1 bg-white border border-gray-200 rounded-sm px-3 py-1 outline-none focus:border-red-500 transition-colors"
                                >
                                    <option>Barong Tagalog</option>
                                    <option>Filipiniana Dresses</option>
                                    <option>Accessories</option>
                                    <option>Others</option>
                                </select>
                            ) : (
                                <span className="text-gray-900">{product.category}</span>
                            )}
                        </div>
                        <div className="flex border-b border-gray-50 pb-2 items-center">
                            <span className="w-40 text-gray-400">Embroidery Style</span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editForm.embroideryStyle}
                                    onChange={(e) => setEditForm({ ...editForm, embroideryStyle: e.target.value })}
                                    className="flex-1 bg-white border border-gray-200 rounded-sm px-3 py-1 outline-none focus:border-red-500 transition-colors"
                                />
                            ) : (
                                <span className="text-gray-900">{product.embroideryStyle || 'Traditional Calado'}</span>
                            )}
                        </div>
                        <div className="flex border-b border-gray-50 pb-2 items-center">
                            <span className="w-40 text-gray-400">Fabric</span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editForm.fabric}
                                    onChange={(e) => setEditForm({ ...editForm, fabric: e.target.value })}
                                    className="flex-1 bg-white border border-gray-200 rounded-sm px-3 py-1 outline-none focus:border-red-500 transition-colors"
                                />
                            ) : (
                                <span className="text-gray-900">{product.fabric || 'Piña-Seda Silk'}</span>
                            )}
                        </div>
                    </div>

                    <h2 className="bg-[#fafafa] p-4 text-lg font-medium text-gray-900 my-8 uppercase tracking-wider">Product Description</h2>
                    <div className="px-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-12">
                        {isEditing ? (
                            <textarea
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                rows="6"
                                className="w-full bg-white border border-gray-200 rounded-sm p-4 outline-none focus:border-red-500 transition-colors resize-none"
                            />
                        ) : (
                            product.description
                        )}
                    </div>

                    {/* Product Reviews - Only for Buyers */}
                    {isBuyer && (
                        <>
                            <h2 id="reviews" className="bg-[#fafafa] p-4 text-lg font-medium text-gray-900 my-8 uppercase tracking-wider flex items-center gap-3">
                                <MessageSquare size={20} className="text-red-500" />
                                Product Reviews
                            </h2>
                            <div className="px-4 space-y-8">
                                {product.ratings?.length > 0 ? (
                                    product.ratings.map((rate, idx) => (
                                        <div key={rate.id || idx} className="border-b border-gray-100 pb-8 flex gap-6">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0 flex items-center justify-center text-gray-400 font-bold uppercase italic">
                                                {rate.reviewer?.name?.charAt(0) || 'A'}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-black text-gray-900 uppercase mb-1">{rate.reviewer?.name || 'Artisan Patrons'}</p>
                                                <div className="flex text-amber-500 mb-3">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={12} fill={i < rate.rating ? "currentColor" : "none"} className={i < rate.rating ? "" : "text-gray-200"} />
                                                    ))}
                                                </div>
                                                <p className="text-sm text-gray-700 leading-relaxed italic">"{rate.review}"</p>
                                                <p className="text-[10px] text-gray-400 mt-4 font-bold uppercase tracking-widest">{new Date(rate.createdAt).toLocaleDateString()} | Platinum Member</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <p className="text-gray-400 text-sm italic font-medium">No reviews yet. Be the first to rate this heritage piece!</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-12">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight italic uppercase">Recommended Pieces</h2>
                                <p className="text-sm text-gray-400 font-medium mt-1">Discover more heritage designs from this collection.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map(p => (
                                <Link key={p.id} href={`/products/${p.id}`}>
                                    <div className="bg-white rounded-2xl p-4 border border-gray-100 hover:border-red-600 transition-all group cursor-pointer shadow-sm">
                                        <div className="aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-gray-50">
                                            <img src={p.images?.[0]?.url || p.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 truncate uppercase tracking-tight text-sm mb-1">{p.name}</h3>
                                        <p className="text-red-600 font-black text-xs italic">₱{p.price.toLocaleString()}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Premium Zoom Overlay */}
            <AnimatePresence>
                {isZoomed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 md:p-12"
                    >
                        <button
                            onClick={() => setIsZoomed(false)}
                            className="absolute top-8 right-8 z-[110] p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all"
                        >
                            <X size={24} />
                        </button>

                        <div className="relative w-full h-full flex items-center justify-center">
                            {product.images?.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveImg(prev => (prev === 0 ? product.images.length - 1 : prev - 1));
                                        }}
                                        className="absolute left-4 md:left-8 p-4 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all"
                                    >
                                        <ChevronLeft size={32} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveImg(prev => (prev === product.images.length - 1 ? 0 : prev + 1));
                                        }}
                                        className="absolute right-4 md:right-8 p-4 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all"
                                    >
                                        <ChevronRight size={32} />
                                    </button>
                                </>
                            )}

                            <motion.img
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                src={product.images?.[activeImg]?.url || product.images?.[activeImg]}
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Artisan ChatBox */}
            <AnimatePresence>
                {showChat && (
                    <ChatBox
                        receiver={product.seller}
                        onClose={() => setShowChat(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
