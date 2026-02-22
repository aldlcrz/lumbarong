import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import api from '@/utils/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    MapPin,
    ChevronRight,
    Star,
    Minus,
    Plus,
    Tag,
    CreditCard,
    Truck,
    CheckCircle2,
    ShieldCheck,
    Smartphone,
    Wallet,
    Upload,
    Image as ImageIcon,
    Loader2
} from 'lucide-react';

export default function Checkout() {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [isOrdering, setIsOrdering] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [showPaymentSelection, setShowPaymentSelection] = useState(false);
    const [formData, setFormData] = useState({
        phone: '',
        address: '',
        paymentMethod: 'GCash',
        referenceNumber: ''
    });
    const [receiptImage, setReceiptImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirect=checkout');
        }
    }, [user, authLoading]);

    useEffect(() => {
        if (cartItems.length === 0 && !orderComplete) {
            router.push('/');
        }
    }, [cartItems]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.address || !formData.phone) {
            toast.error('Please fulfill heritage delivery details');
            return;
        }

        if (formData.paymentMethod === 'GCash' && (!formData.referenceNumber || !receiptImage)) {
            toast.error('Please provide GCash reference number and receipt');
            return;
        }

        try {
            setLoading(true);
            const orderData = {
                items: cartItems.map(item => ({
                    product: item.product.id,
                    quantity: item.quantity,
                    price: item.product.price
                })),
                totalAmount: cartTotal,
                paymentMethod: formData.paymentMethod,
                shippingAddress: `${formData.address} | Contact: ${formData.phone}`,
                referenceNumber: formData.paymentMethod === 'GCash' ? formData.referenceNumber : null,
                receiptImage: formData.paymentMethod === 'GCash' ? receiptImage : null
            };

            const res = await api.post('/orders', orderData);
            toast.success('Your masterpiece is ordered!');
            clearCart();
            router.push(`/orders/${res.data.id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Set local preview immediately
        const localUrl = URL.createObjectURL(file);
        setReceiptImage(localUrl);

        setIsUploading(true);
        const data = new FormData();
        data.append('image', file);

        try {
            const res = await api.post('/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setReceiptImage(res.data.url);
        } catch (err) {
            console.error(err);
            alert('Image upload failed: ' + (err.response?.data?.message || err.message));
            setReceiptImage(null);
        } finally {
            setIsUploading(false);
        }
    };

    if (authLoading || !user) return null;

    if (orderComplete) {
        return (
            <div className="min-h-screen flex flex-col bg-[#fdfbf7]">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-12 rounded-[3.5rem] shadow-2xl text-center max-w-md w-full border border-gray-100"
                    >
                        <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle2 size={56} />
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2 italic">Salamat Po!</h1>
                        <p className="text-gray-500 mb-10 text-lg font-medium italic">Your artisan commission has been registered.</p>
                        <div className="space-y-4">
                            <Link href="/orders">
                                <button className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-gray-200">
                                    View My Registry
                                </button>
                            </Link>
                            <Link href="/">
                                <button className="w-full text-gray-400 py-2 font-bold hover:text-red-600 transition-all text-[10px] uppercase tracking-widest">
                                    Continue Journey
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    const PaymentView = () => (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-0 z-50 bg-[#fdfbf7] flex flex-col"
        >
            <header className="bg-white border-b border-gray-100 px-6 py-8 flex items-center gap-4">
                <button onClick={() => setShowPaymentSelection(false)} className="p-2 -ml-2 text-gray-400 hover:text-red-600 transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-xl font-black text-gray-900 italic uppercase tracking-tight">Select Payment Method</h2>
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-8 max-w-2xl mx-auto w-full">
                <section>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Recommended methods</p>
                    <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                        <label className={`flex items-center justify-between p-6 cursor-pointer transition-all ${formData.paymentMethod === 'GCash' ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl italic tracking-tighter shadow-lg shadow-blue-100">G</div>
                                <div>
                                    <p className="font-black text-gray-900 uppercase text-xs tracking-tight">GCash / Maya</p>
                                    <p className="text-[10px] text-gray-400 font-bold italic">Fast & Secure E-Wallet</p>
                                </div>
                            </div>
                            <input
                                type="radio"
                                name="payment"
                                className="w-5 h-5 accent-red-600"
                                checked={formData.paymentMethod === 'GCash'}
                                onChange={() => setFormData({ ...formData, paymentMethod: 'GCash' })}
                            />
                        </label>
                    </div>
                </section>

                <section>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Other methods</p>
                    <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                        <label className={`flex items-center justify-between p-6 cursor-pointer border-b border-gray-50 transition-all ${formData.paymentMethod === 'COD' ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center text-white shadow-lg shadow-gray-100">
                                    <Truck size={20} />
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 uppercase text-xs tracking-tight">Cash on Delivery</p>
                                    <p className="text-[10px] text-gray-400 font-bold italic">Pay upon delivery</p>
                                </div>
                            </div>
                            <input
                                type="radio"
                                name="payment"
                                className="w-5 h-5 accent-red-600"
                                checked={formData.paymentMethod === 'COD'}
                                onChange={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                            />
                        </label>
                        <div className="p-6 flex items-center justify-between opacity-50 cursor-not-allowed">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <p className="font-black text-gray-400 uppercase text-xs tracking-tight">Credit / Debit Card</p>
                                    <p className="text-[10px] text-gray-300 font-bold italic">Coming soon</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="p-6 bg-white border-t border-gray-100">
                <button
                    onClick={() => setShowPaymentSelection(false)}
                    className="w-full bg-red-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-red-200 hover:bg-black transition-all"
                >
                    Confirm Selection
                </button>
            </footer>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-[#fdfbf7] pb-32">
            <Navbar />

            <AnimatePresence>
                {showPaymentSelection && <PaymentView />}
            </AnimatePresence>

            <main className="container mx-auto px-4 py-8 lg:py-12 max-w-xl">
                <header className="mb-10 flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-400 hover:text-red-600 transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-black text-gray-900 italic uppercase tracking-tighter">Checkout</h1>
                </header>

                <div className="space-y-6">
                    {/* ADDRESS SECTION */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <MapPin className="text-red-600 mt-1" size={20} />
                                <div className="space-y-4 w-full">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-black text-gray-900 uppercase text-xs tracking-tight">{user.name}</p>
                                            <span className="text-[10px] font-bold text-gray-400 italic">0917-XXX-XXXX</span>
                                        </div>
                                        <textarea
                                            placeholder="Enter your artisan delivery address..."
                                            className="w-full text-xs font-bold text-gray-500 bg-transparent outline-none border-none resize-none no-scrollbar h-12"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            required
                                        />
                                        <div className="relative mt-2">
                                            <Smartphone className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                                            <input
                                                type="tel"
                                                placeholder="Contact Number..."
                                                className="w-full pl-6 text-xs font-bold text-gray-500 bg-transparent outline-none"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="text-gray-300 mt-1" size={18} />
                        </div>
                    </div>

                    {/* PRODUCT SECTION */}
                    {cartItems.map(item => (
                        <div key={item.product.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-red-600 text-white px-2 py-0.5 rounded-md text-[8px] font-black uppercase">Master Artisan</div>
                                <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{item.product.seller?.shopName || 'Heritage Mall'}</p>
                                <div className="flex items-center gap-1 ml-auto">
                                    <Star size={10} className="text-amber-500 fill-amber-500" />
                                    <span className="text-[10px] font-black text-gray-900">4.8</span>
                                    <span className="text-[10px] font-bold text-gray-300">(218)</span>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className="w-24 h-32 rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 shadow-inner">
                                    <img src={item.product.images?.[0]?.url || item.product.images?.[0] || null} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col justify-between py-1 flex-1">
                                    <div>
                                        <h3 className="font-black text-gray-900 uppercase text-sm tracking-tight mb-1">{item.product.name}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 italic mb-2">Heritage Design | Handcrafted</p>
                                        <p className="text-lg font-black text-gray-900 tracking-tighter">₱{item.product.price.toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center justify-end gap-4">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Qty: {item.quantity}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Truck size={18} className="text-gray-300" />
                                    <div>
                                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight">Standard Delivery</p>
                                        <p className="text-[8px] font-bold text-green-600 italic">Free Shipping on your first commission</p>
                                    </div>
                                </div>
                                <div className="text-right font-black text-gray-900 text-xs">
                                    ₱0
                                </div>
                            </div>
                        </div>
                    ))}


                    {/* SUMMARY SECTION */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-4">
                        <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <span>Merchandise Subtotal</span>
                            <span className="text-gray-900">₱{cartTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <span>Shipping Registry Fee</span>
                            <span className="text-green-600 italic">Free</span>
                        </div>
                        <div className="pt-4 flex justify-between items-center">
                            <span className="text-sm font-black text-gray-900 uppercase tracking-tighter">Vat inclusive</span>
                            <span className="text-2xl font-black text-red-600 tracking-tighter italic">₱{cartTotal.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* PAYMENT DETAILS */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Payment Details</h4>
                            <button
                                onClick={() => setShowPaymentSelection(true)}
                                className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-1 hover:underline"
                            >
                                View all methods <ChevronRight size={12} />
                            </button>
                        </div>
                        <div className="flex items-start gap-4">
                            {formData.paymentMethod === 'GCash' ? (
                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black italic text-sm shrink-0">G</div>
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white shrink-0">
                                    <Truck size={16} />
                                </div>
                            )}
                            <div className="flex-1">
                                <p className="text-xs font-black text-gray-900 uppercase">{formData.paymentMethod === 'GCash' ? 'GCash Settlement' : 'Cash on Delivery'}</p>
                                <p className="text-[8px] font-bold text-gray-400 italic mb-4">Preferred Payment Master</p>

                                {formData.paymentMethod === 'GCash' && (
                                    <div className="space-y-6">
                                        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Send payment to:</p>
                                            <div className="space-y-3">
                                                {Array.from(new Set(cartItems.map(item => item.product.seller?.id))).map(sellerId => {
                                                    const seller = cartItems.find(item => item.product.seller?.id === sellerId)?.product.seller;
                                                    return (
                                                        <div key={sellerId} className="flex justify-between items-center text-xs">
                                                            <span className="font-bold text-gray-500 italic">{seller?.shopName || 'Heritage Mall'}</span>
                                                            <span className="font-black text-blue-600">{seller?.gcashNumber || '09XX-XXX-XXXX'}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="block text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2">Upload GCash Screenshot</label>
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                />
                                                <div className="border-2 border-dashed border-gray-100 rounded-3xl p-6 text-center group-hover:border-red-600 transition-all flex flex-col items-center gap-2">
                                                    {isUploading ? (
                                                        <Loader2 className="animate-spin text-red-600" size={24} />
                                                    ) : receiptImage ? (
                                                        <>
                                                            <img src={receiptImage || null} className="w-20 h-20 object-cover rounded-xl mb-2" />
                                                            <span className="text-[10px] font-black text-green-600 uppercase">Verification Uploaded</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 mb-2">
                                                                <Upload size={18} />
                                                            </div>
                                                            <span className="text-[10px] font-black text-gray-400 uppercase">Tap to Register Proof</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* STICKY BOTTOM BUTTON */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] z-40">
                <div className="max-w-xl mx-auto">
                    <button
                        onClick={handleSubmit}
                        disabled={isOrdering}
                        className="w-full bg-red-600 text-white h-20 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-red-200 hover:bg-black transition-all disabled:opacity-50"
                    >
                        {isOrdering ? 'Registering Commission...' : 'Place My Order'}
                    </button>
                    <div className="mt-4 flex items-center justify-center gap-3 opacity-30 text-gray-900">
                        <ShieldCheck size={14} />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em]">Secure Artisan Gateway</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
