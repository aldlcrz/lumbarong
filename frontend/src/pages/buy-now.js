import { useState, useEffect } from 'react';
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
    Loader2,
    Eye
} from 'lucide-react';

export default function BuyNowCheckout() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { id, qty, color, design, size } = router.query;

    const [product, setProduct] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [showAddressSelector, setShowAddressSelector] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [formData, setFormData] = useState({
        address: '',
        phone: '',
        paymentMethod: 'COD',
        referenceNumber: ''
    });
    const [orderComplete, setOrderComplete] = useState(false);
    const [isOrdering, setIsOrdering] = useState(false);
    const [receiptImage, setReceiptImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showPaymentSelection, setShowPaymentSelection] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
        if (user) {
            fetchAddresses();
        }
    }, [id, user]);

    const fetchProduct = async () => {
        try {
            const res = await api.get(`/products/${id}`);
            setProduct(res.data);
        } catch (err) {
            console.error('Error fetching product:', err);
        }
    };

    const fetchAddresses = async () => {
        try {
            const res = await api.get('/users/addresses');
            setAddresses(res.data);
            const defaultAddr = res.data.find(a => a.isDefault) || res.data[0];
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr.id);
                setFormData(prev => ({
                    ...prev,
                    phone: defaultAddr.phoneNumber,
                    address: `${defaultAddr.fullName} | ${defaultAddr.street}, ${defaultAddr.barangay}, ${defaultAddr.city}, ${defaultAddr.province} ${defaultAddr.postalCode}`
                }));
            }
        } catch (err) {
            console.error('Error fetching addresses:', err);
        }
    };

    useEffect(() => {
        if (!authLoading && !user) {
            router.push(`/login?redirect=${router.asPath}`);
        }
    }, [user, authLoading]);

    const handleSubmit = async () => {
        if (!formData.address || !formData.phone) {
            alert('Please complete your shipping details.');
            return;
        }
        if (!product) return;

        setIsOrdering(true);
        try {
            const orderData = {
                items: [{
                    product: product.id,
                    quantity: parseInt(qty) || 1,
                    price: product.price,
                    color: color,
                    design: design,
                    size: size
                }],
                totalAmount: product.price * (parseInt(qty) || 1),
                paymentMethod: formData.paymentMethod,
                shippingAddress: `${formData.address} | Contact: ${formData.phone}`,
                referenceNumber: formData.paymentMethod === 'GCash' ? formData.referenceNumber : null,
                receiptImage: formData.paymentMethod === 'GCash' ? receiptImage : null
            };

            await api.post('/orders', orderData);
            setOrderComplete(true);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Order failed. Please try again.');
        } finally {
            setIsOrdering(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

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

    if (authLoading || !user || !product) return (
        <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
            <Loader2 className="animate-spin text-red-600" size={32} />
        </div>
    );

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
                        <p className="text-gray-500 mb-10 text-lg font-medium italic">Your direct artisan commission has been registered.</p>
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

    const mainImg = product.images?.find(img => img.designName === design)?.url
        || product.images?.[0]?.url
        || product.images?.[0]
        || 'https://via.placeholder.com/100x130';

    return (
        <div className="min-h-screen bg-[#fdfbf7] pb-32">
            <Navbar />

            <AnimatePresence>
                {showPaymentSelection && <PaymentView />}
            </AnimatePresence>

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
                                <Plus className="rotate-45" size={32} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="container mx-auto px-4 py-8 lg:py-12 max-w-xl">
                <header className="mb-10 flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-400 hover:text-red-600 transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-black text-gray-900 italic uppercase tracking-tighter">Direct Buy</h1>
                </header>

                <div className="space-y-6">
                    {/* ADDRESS SECTION */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                                <MapPin className="text-red-600 mt-1" size={20} />
                                <div className="space-y-4 w-full">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Shipping Destination</p>
                                        {addresses.length > 0 && (
                                            <button
                                                onClick={() => setShowAddressSelector(true)}
                                                className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline"
                                            >
                                                Change Address
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <textarea
                                                placeholder="Enter your artisan delivery address..."
                                                className="w-full text-xs font-bold text-gray-900 bg-transparent outline-none border-none resize-none no-scrollbar h-auto min-h-[48px]"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                required
                                            />
                                            <div className="relative mt-2">
                                                <Smartphone className="absolute left-0 top-1/2 -translate-y-1/2 text-red-600/30" size={14} />
                                                <input
                                                    type="tel"
                                                    placeholder="Contact Number..."
                                                    className="w-full pl-6 text-xs font-bold text-gray-900 bg-transparent outline-none"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address Selector Modal */}
                    <AnimatePresence>
                        {showAddressSelector && (
                            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                                    onClick={() => setShowAddressSelector(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden relative shadow-2xl z-20"
                                >
                                    <div className="p-8 lg:p-10">
                                        <h2 className="text-2xl font-black text-gray-900 tracking-tighter italic uppercase mb-8 pr-12">Select Shipping Address</h2>
                                        <button
                                            onClick={() => setShowAddressSelector(false)}
                                            className="absolute top-8 right-8 p-2 text-gray-400 hover:text-red-600 transition-colors"
                                        >
                                            <Plus className="rotate-45" size={24} />
                                        </button>

                                        <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar pr-2">
                                            {addresses.map(addr => (
                                                <div
                                                    key={addr.id}
                                                    onClick={() => {
                                                        setFormData({
                                                            ...formData,
                                                            phone: addr.phoneNumber,
                                                            address: `${addr.fullName} | ${addr.street}, ${addr.barangay}, ${addr.city}, ${addr.province} ${addr.postalCode}`
                                                        });
                                                        setSelectedAddressId(addr.id);
                                                        setShowAddressSelector(false);
                                                    }}
                                                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-red-600 bg-red-50/20' : 'border-gray-50 hover:border-gray-200 bg-gray-50/50'}`}
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 bg-white rounded-md text-gray-400 border border-gray-100">{addr.label}</span>
                                                        {addr.isDefault && <span className="text-[8px] font-black uppercase tracking-widest text-red-600">Default</span>}
                                                    </div>
                                                    <p className="font-black text-gray-900 text-sm italic mb-1 uppercase tracking-tight">{addr.fullName}</p>
                                                    <p className="text-[10px] text-gray-500 font-medium italic line-clamp-2">
                                                        {addr.street}, {addr.barangay}, {addr.city}, {addr.province} {addr.postalCode}
                                                    </p>
                                                    <p className="mt-3 text-[10px] font-bold text-gray-400">{addr.phoneNumber}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* PRODUCT SECTION */}
                    <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-sm relative group">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-red-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider">Master Artisan</div>
                            <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest">{product.seller?.shopName || 'LumBarong'}</p>
                        </div>

                        <div className="flex gap-8">
                            <div
                                onClick={() => setPreviewImage(mainImg)}
                                className="w-32 h-40 rounded-[2.5rem] overflow-hidden bg-gray-50 shrink-0 border border-gray-100 shadow-inner group-hover/img:shadow-xl transition-all relative cursor-zoom-in group/img"
                            >
                                <img src={mainImg} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                                    <div className="bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg">
                                        <Eye size={16} className="text-gray-900" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-between py-1 flex-1">
                                <div>
                                    <h3 className="font-bold text-gray-900 uppercase text-lg tracking-tight mb-3 italic">{product.name}</h3>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {color && <span className="text-[9px] bg-red-50 text-red-500 px-3 py-1.5 rounded-full font-black uppercase border border-red-100 italic tracking-widest">Color: {color}</span>}
                                        {size && <span className="text-[9px] bg-gray-50 text-gray-400 px-3 py-1.5 rounded-full font-black uppercase border border-gray-100 italic tracking-widest">Size: {size}</span>}
                                        {design && <span className="text-[9px] bg-gray-50 text-gray-500 px-3 py-1.5 rounded-full font-black uppercase border border-gray-100 italic tracking-widest">Design: {design}</span>}
                                    </div>
                                    <p className="text-2xl font-black text-gray-900 tracking-tighter">₱{product.price.toLocaleString()}</p>
                                </div>
                                <div className="flex items-center justify-end">
                                    <span className="text-[11px] font-black text-gray-300 uppercase underline decoration-gray-200 underline-offset-4 italic">Qty: {qty || 1}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-10 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Truck size={22} className="text-gray-200" />
                                <div>
                                    <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight">Standard Delivery</p>
                                    <p className="text-[9px] font-bold text-green-600 italic">Free Shipping applied</p>
                                </div>
                            </div>
                            <div className="text-right font-black text-gray-900 text-sm">
                                ₱0
                            </div>
                        </div>
                    </div>

                    {/* SUMMARY SECTION */}
                    <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-6">
                        <div className="flex justify-between items-center text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            <span>Subtotal</span>
                            <span className="text-gray-900 text-sm tracking-tight">₱{(product.price * (parseInt(qty) || 1)).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            <span>Shipping Registry Fee</span>
                            <span className="text-green-500 font-black italic tracking-widest">FREE</span>
                        </div>
                        <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
                            <span className="text-sm font-black text-gray-900 uppercase tracking-widest italic">Grand Total</span>
                            <span className="text-3xl font-black text-red-600 tracking-tighter italic">₱{(product.price * (parseInt(qty) || 1)).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* PAYMENT DETAILS */}
                    <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Payment Details</h4>
                            <button
                                onClick={() => setShowPaymentSelection(true)}
                                className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-1 hover:underline"
                            >
                                Change method <ChevronRight size={12} />
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

                                {formData.paymentMethod === 'GCash' && (
                                    <div className="mt-6 space-y-6">
                                        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Send payment to:</p>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-bold text-gray-500 italic">{product.seller?.shopName || 'LumBarong'}</span>
                                                <span className="font-black text-blue-600">{product.seller?.gcashNumber || '09XX-XXX-XXXX'}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="block text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2">Upload Proof of Purchase</label>
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
                        {isOrdering ? 'Processing...' : 'Direct Place Order'}
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
