import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';

export default function Cart() {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
    const router = useRouter();

    if (cartCount === 0) {
        return (
            <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-4 barong-pattern">
                    <div className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-md w-full border border-gray-100">
                        <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag size={48} />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">Your Collection is Empty</h1>
                        <p className="text-gray-500 mb-8">Discover our fine Barongs and find something special to add.</p>
                        <Link href="/">
                            <button className="w-full bg-red-600 text-white py-4 rounded-2xl font-black hover:bg-red-700 transition-all shadow-lg shadow-red-200">
                                Start Exploring
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />


            <main className="container mx-auto px-4 py-8 lg:py-12">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="mb-8 flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-gray-100 hover:border-red-600 hover:bg-red-50 transition-all shadow-sm group"
                >
                    <ArrowLeft size={18} className="text-gray-400 group-hover:text-red-600 transition-colors" />
                    <span className="text-sm font-black text-gray-600 group-hover:text-red-600 uppercase tracking-widest transition-colors">Back</span>
                </button>

                <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
                    {/* Items List */}
                    <div className="flex-1 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.product.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center">
                                <div className="w-24 h-32 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                                    <img
                                        src={item.product.images?.[0]?.url || item.product.images?.[0] || 'https://via.placeholder.com/100x130'}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black uppercase text-red-600 tracking-widest">{item.product.category}</p>
                                    <h3 className="text-lg font-bold text-gray-900 truncate">{item.product.name}</h3>
                                    <p className="text-gray-500 text-sm mb-2">{item.product.seller?.shopName || 'Heritage Artisan'}</p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xl font-black text-gray-900">₱{(item.product.price * item.quantity).toLocaleString()}</p>

                                        <div className="flex items-center border border-gray-100 rounded-xl overflow-hidden bg-gray-50">
                                            <button
                                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                            ><Minus size={14} /></button>
                                            <span className="w-10 h-10 flex items-center justify-center font-bold">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                            ><Plus size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.product.id)}
                                    className="w-10 h-10 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full flex items-center justify-center transition-all shrink-0"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Summary Sidebar */}
                    <div className="w-full lg:w-[400px] sticky bottom-4 lg:top-24">
                        <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-2xl">
                            <h2 className="text-2xl font-black mb-8">Summary</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-gray-400">
                                    <span>Subtotal ({cartCount} items)</span>
                                    <span>₱{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Estimated Shipping</span>
                                    <span className="text-green-500 italic">Free for Artisan Month</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Service Fee</span>
                                    <span>₱0.00</span>
                                </div>
                                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                    <span className="text-lg font-bold">Total</span>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-red-500">₱{cartTotal.toLocaleString()}</p>
                                        <p className="text-[10px] text-gray-500 italic mt-1">VAT Included</p>
                                    </div>
                                </div>
                            </div>

                            <Link href="/checkout">
                                <button className="w-full bg-red-600 hover:bg-red-700 text-white h-16 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-red-900/40">
                                    Proceed to Checkout
                                    <ArrowRight size={20} />
                                </button>
                            </Link>

                            <p className="text-center text-xs text-gray-500 mt-6">
                                Artisan orders are processed with care. By checking out, you support local Filipino master embroiderers.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
