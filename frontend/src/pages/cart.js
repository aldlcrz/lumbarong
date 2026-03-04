import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft, Eye, X, User, MapPin, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Cart() {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
    const { user } = useAuth();
    const [previewImage, setPreviewImage] = useState(null);

    // Calculate maximum shipping days for the order
    const maxShippingDays = Math.max(...cartItems.map(item => item.product.shippingDays || 7));

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-[#fdfbf7]">
                <Navbar />
                <main className="container mx-auto px-4 py-20 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag size={40} className="text-gray-300" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter italic">Your collection is empty</h1>
                        <p className="text-gray-500 mb-8 font-medium">It seems you haven't discovered any heritage masterpieces yet.</p>
                        <Link href="/">
                            <button className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-red-100">
                                Explore Collection
                            </button>
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fdfbf7]">
            <Navbar />

            <main className="container mx-auto px-4 md:px-8 py-12 max-w-6xl">
                <button
                    onClick={() => window.history.back()}
                    className="mb-8 flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-gray-100 hover:border-red-600 hover:bg-red-50 transition-all shadow-sm group"
                >
                    <ArrowLeft size={18} className="text-gray-400 group-hover:text-red-600 transition-colors" />
                    <span className="text-sm font-black text-gray-600 group-hover:text-red-600 uppercase tracking-widest transition-colors">Back</span>
                </button>

                <header className="mb-12">
                    <p className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] mb-3">Your Selection</p>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter italic">Artisan Cart</h1>
                </header>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="flex-1 space-y-4">
                        {cartItems.map((item, idx) => {
                            const mainImg = item.product.images?.find(img => img.designName === item.options?.design)?.url
                                || item.product.images?.[0]?.url
                                || item.product.images?.[0]
                                || 'https://via.placeholder.com/100x130';

                            return (
                                <div key={`${item.product.id}-${idx}`} className="bg-white p-4 md:p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex gap-6 items-center group relative overflow-hidden transition-all hover:shadow-xl hover:shadow-gray-200/50">
                                    {/* Product Image with View Action */}
                                    <div
                                        onClick={() => setPreviewImage(mainImg)}
                                        className="w-24 h-32 md:w-32 md:h-44 rounded-[1.5rem] overflow-hidden bg-gray-50 shrink-0 relative cursor-zoom-in border border-gray-100"
                                    >
                                        <img
                                            src={mainImg}
                                            alt={item.product.name}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <div className="bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg">
                                                <Eye size={16} className="text-gray-900" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0 py-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-red-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-sm tracking-widest">Artisan Piece</span>
                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest truncate">
                                                {item.product.category?.name || 'Barong'}
                                            </p>
                                        </div>

                                        <h3 className="text-xl font-black text-gray-900 mb-1 tracking-tight truncate">
                                            {item.product.name}
                                        </h3>

                                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4 italic">
                                            By {item.product.seller?.shopName || 'Heritage Artisan'}
                                        </p>

                                        {/* Simplified Variant Pills */}
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {item.options?.color && (
                                                <span className="bg-red-50 text-red-600 text-[9px] font-black px-3 py-1 rounded-full border border-red-100 uppercase tracking-widest italic">
                                                    {item.options.color}
                                                </span>
                                            )}
                                            {item.options?.design && (
                                                <span className="bg-white text-gray-500 text-[9px] font-black px-3 py-1 rounded-full border border-gray-100 uppercase tracking-widest italic shadow-sm">
                                                    Design: {item.options.design}
                                                </span>
                                            )}
                                            {item.options?.size && (
                                                <span className="bg-white text-gray-400 text-[9px] font-black px-3 py-1 rounded-full border border-gray-100 uppercase tracking-widest shadow-sm">
                                                    Size: {item.options.size}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <p className="text-2xl font-black text-gray-900 tracking-tighter italic">₱{(item.product.price * item.quantity).toLocaleString()}</p>

                                            <div className="flex items-center border border-gray-100 rounded-2xl overflow-hidden bg-gray-50 shadow-inner">
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.options)}
                                                    className="w-10 h-10 flex items-center justify-center hover:bg-white hover:text-red-600 transition-all font-bold"
                                                ><Minus size={14} /></button>
                                                <span className="w-10 h-10 flex items-center justify-center font-black text-sm text-gray-900 border-x border-gray-100">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.options)}
                                                    className="w-10 h-10 flex items-center justify-center hover:bg-white hover:text-red-600 transition-all font-bold"
                                                ><Plus size={14} /></button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => removeFromCart(item.product.id, item.options)}
                                        className="absolute top-6 right-6 w-10 h-10 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary Sidebar */}
                    <div className="w-full lg:w-[380px] shrink-0 sticky bottom-4 lg:top-24">
                        <div className="bg-[#141414] text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                            {/* Decorative Background Element */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/20 rounded-full blur-[100px]" />

                            <h2 className="text-2xl font-black mb-8 tracking-tighter italic relative">Artisan Summary</h2>

                            {/* User & Delivery Info */}
                            <div className="mb-8 space-y-4 relative border-b border-white/20 pb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                                        <User size={14} className="text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest mb-0.5">Registry For</p>
                                        <p className="text-sm font-black text-white tracking-tight">{user?.name || 'Guest Artisan'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                                        <MapPin size={14} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest mb-0.5">Designated Delivery</p>
                                        <p className="text-sm font-black text-white tracking-tight leading-relaxed line-clamp-2">
                                            {user?.address || 'Profile address not synchronized'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                                        <Truck size={14} className="text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest mb-0.5">Heritage Arrival</p>
                                        <p className="text-sm font-black text-green-400 tracking-tight italic">Estimated ~{maxShippingDays} Days Artisan Crafting</p>
                                    </div>
                                </div>
                            </div>

                            {/* Item List Detail */}
                            <div className="mb-10 relative">
                                <p className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                                    Masterpiece Registry
                                </p>
                                <div className="space-y-8 max-h-[220px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-red-600/60 scrollbar-track-white/10">
                                    {cartItems.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start gap-4 group/item">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <p className="text-sm font-black text-white uppercase tracking-tight truncate group-hover/item:text-red-500 transition-colors">
                                                        {item.product.name}
                                                    </p>
                                                    <span className="text-xs font-black text-white italic">x{item.quantity}</span>
                                                </div>
                                                <div className="space-y-2 pt-1 border-l border-white/10 pl-4 mt-2">
                                                    {item.options?.color && (
                                                        <p className="text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-3">
                                                            <span className="text-red-500 text-[9px]">COLOR</span>
                                                            {item.options.color}
                                                        </p>
                                                    )}
                                                    {item.options?.size && (
                                                        <p className="text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-3">
                                                            <span className="text-gray-500 text-[9px]">SIZE</span>
                                                            {item.options.size}
                                                        </p>
                                                    )}
                                                    {item.options?.design && (
                                                        <p className="text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-3">
                                                            <span className="text-blue-500 text-[9px]">TYPE OF DESIGN</span>
                                                            {item.options.design}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-base font-black text-white tracking-tighter">
                                                    ₱{(item.product.price * item.quantity).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Fade bottom for scroll */}
                                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#141414] via-[#141414]/95 to-transparent pointer-events-none" />
                            </div>

                            <div className="space-y-4 mb-10 relative">
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-white">
                                    <span>Subtotal ({cartCount})</span>
                                    <span className="text-white">₱{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-white">
                                    <span>Shipping</span>
                                    <span className="text-green-400 font-black italic">COMPLIMENTARY</span>
                                </div>
                                <div className="pt-6 border-t border-white/20 flex justify-between items-end">
                                    <span className="text-[12px] font-black uppercase tracking-[0.2em] text-white">Grand Total</span>
                                    <div className="text-right">
                                        <p className="text-5xl font-black text-red-500 tracking-tighter italic leading-none shadow-red-500/20 shadow-xl">₱{cartTotal.toLocaleString()}</p>
                                        <p className="text-[11px] text-white font-black uppercase tracking-widest mt-2">{cartCount} Artifacts Included</p>
                                    </div>
                                </div>
                            </div>

                            <Link href="/checkout">
                                <button className="w-full bg-red-600 hover:bg-black text-white h-20 rounded-[2rem] font-black text-base flex items-center justify-center gap-4 transition-all shadow-2xl shadow-red-900/40 group">
                                    Checkout Now
                                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                                </button>
                            </Link>

                            <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-8 leading-relaxed italic opacity-60 px-4">
                                Handcrafted by Filipino masters. Every order supports heritage preservation.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Image Preview Modal */}
            <AnimatePresence>
                {previewImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setPreviewImage(null)}
                        className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-5xl w-full h-full flex items-center justify-center"
                        >
                            <img
                                src={previewImage}
                                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10"
                                alt="High Resolution Preview"
                            />
                            <button
                                onClick={() => setPreviewImage(null)}
                                className="absolute top-4 right-4 md:top-0 md:-right-12 text-white/50 hover:text-white transition-colors"
                            >
                                <X size={32} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
