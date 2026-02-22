import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import api from '@/utils/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Upload, X, CheckCircle, Package, Tag, Layers, FileText, Info, PlusCircle, ArrowRight, AlertCircle, ArrowLeft, Store, Clock } from 'lucide-react';

export default function AddProduct() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Barong Tagalog',
        stock: '',
        images: [],
        sizes: [],
        colors: [],
        leadTime: 3
    });
    const [newSize, setNewSize] = useState('');
    const [newColor, setNewColor] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (!authLoading && (!user || (user.role !== 'seller' && user.role !== 'admin'))) {
            router.push('/login');
            return;
        }

        // Pre-fill GCash info if not editing
        if (!router.query.edit && user) {
            setFormData(prev => ({
                ...prev,
                gcashNumber: user.gcashNumber || '',
                gcashQrCode: user.gcashQrCode || ''
            }));
        }

        const { edit } = router.query;
        if (edit) {
            fetchProduct(edit);
        }
    }, [user, authLoading, router.query]);

    const fetchProduct = async (id) => {
        try {
            const res = await api.get(`/products/${id}`);
            const product = res.data;
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                stock: product.stock,
                images: product.images.map(img => img.url || img),
                sizes: product.availableSizes?.map(s => s.size) || [],
                colors: product.availableColors?.map(c => c.color) || [],
                leadTime: product.leadTime || 3,
                gcashNumber: product.seller?.gcashNumber || '',
                gcashQrCode: product.seller?.gcashQrCode || ''
            });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load product for editing.' });
        }
    };

    const handleFileUpload = async (e) => {
        const files = e.target?.files || e.dataTransfer?.files;
        if (!files || files.length === 0) return;

        const file = files[0];

        // Validation
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setMessage({ type: 'error', text: 'Invalid format. Please use JPG, PNG, or WebP.' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'File too large. Max 5MB allowed.' });
            return;
        }

        if (formData.images.length >= 5) {
            setMessage({ type: 'error', text: 'Maximum 5 photos allowed per masterpiece.' });
            return;
        }

        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            const res = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, res.data.url]
            }));
            setMessage({ type: '', text: '' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Upload failed: ' + (error.response?.data?.message || error.message) });
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { edit } = router.query;

        if (formData.images.length < 3) {
            setMessage({ type: 'error', text: 'Wait! At least 3 photos (Front, Back, Side) are required to showcase heritage details.' });
            return;
        }

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            if (edit) {
                await api.put(`/products/${edit}`, formData);
                setMessage({ type: 'success', text: 'Update complete. Your masterpiece has been refined!' });
            } else {
                await api.post('/products', formData);
                setMessage({ type: 'success', text: 'Your masterpiece is now live in the collection!' });
            }
            setTimeout(() => router.push('/seller/inventory'), 2000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to showcase product'
            });
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleFileUpload(e);
    };

    if (authLoading || !user) return null;

    const angleLabels = ['Front View', 'Back View', 'Side View', 'Detail 1', 'Detail 2'];

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

                <header className="mb-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <p className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] mb-3 flex items-center justify-center gap-2">
                            <span className="w-8 h-[1px] bg-red-600/30"></span>
                            Artisan Studio
                            <span className="w-8 h-[1px] bg-red-600/30"></span>
                        </p>
                        <h1 className="text-6xl font-black text-gray-900 tracking-tighter italic mb-4 uppercase">Showcase Your Work</h1>
                        <p className="text-gray-500 font-medium max-w-xl mx-auto italic">Publish your latest handcrafted masterpiece. Note: 3-5 photos required.</p>
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left: Media Upload */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-5"
                    >
                        <div className="sticky top-28 bg-white/70 backdrop-blur-3xl p-8 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-white/50 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-amber-400 to-red-600 opacity-20"></div>

                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                                <motion.div
                                    animate={{
                                        rotate: [0, 10, -10, 0],
                                    }}
                                    transition={{ repeat: Infinity, duration: 4 }}
                                >
                                    <Upload size={18} className="text-red-600" />
                                </motion.div>
                                Visual Showcase
                            </h3>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {formData.images.map((img, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        layout
                                        className="aspect-[3/4] rounded-3xl relative group overflow-hidden border border-gray-100 shadow-sm"
                                    >
                                        <img src={img || null} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-md p-3 translate-y-2 group-hover:translate-y-0 transition-transform">
                                            <p className="text-[9px] font-black text-white uppercase tracking-widest text-center">{angleLabels[i]}</p>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-3 right-3 bg-red-600 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-xl"
                                        >
                                            <X size={14} />
                                        </motion.button>
                                    </motion.div>
                                ))}

                                {formData.images.length < 5 && (
                                    <motion.label
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                        whileHover={{ scale: 1.02, backgroundColor: "rgba(254, 242, 242, 0.8)" }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`aspect-[3/4] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${isUploading ? 'bg-gray-50 border-gray-200' : 'border-gray-200 bg-gray-50/50 text-gray-400 hover:border-red-200 hover:text-red-600'}`}>
                                        <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                                        {isUploading ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-10 h-10 border-4 border-red-600/10 border-t-red-600 rounded-full animate-spin"></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-red-600 animate-pulse">Uploading...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <motion.div
                                                    animate={{ y: [0, -5, 0] }}
                                                    transition={{ repeat: Infinity, duration: 2 }}
                                                    className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 group-hover:border-red-100"
                                                >
                                                    <PlusCircle size={28} />
                                                </motion.div>
                                                <div className="text-center px-4">
                                                    <span className="text-[10px] font-black uppercase tracking-widest block mb-1">{angleLabels[formData.images.length]}</span>
                                                    <span className="text-[8px] font-bold text-gray-300 block">Drag or click masterpiece</span>
                                                </div>
                                            </>
                                        )}
                                    </motion.label>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-100/50 flex gap-4 text-amber-700 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 opacity-10">
                                        <Info size={40} />
                                    </div>
                                    <Info size={20} className="shrink-0 mt-0.5" />
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-1">Quality Requirements</p>
                                        <p className="text-[9px] font-bold leading-relaxed opacity-80">
                                            Minimum 3 (Front, Back, Detail). JPG/PNG/WebP. Max 5MB per image.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 p-5 bg-gray-50/50 rounded-3xl border border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress</span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${formData.images.length >= 3 ? 'text-green-600' : 'text-amber-600'}`}>
                                            {formData.images.length}/5 photos
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(formData.images.length / 5) * 100}%` }}
                                            className={`h-full rounded-full ${formData.images.length >= 3 ? 'bg-green-600' : 'bg-amber-500'}`}
                                        ></motion.div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-7"
                    >
                        {message.text && (
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`p-8 rounded-[2.5rem] mb-8 border-2 flex items-center gap-6 shadow-xl ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100 shadow-green-900/5' : 'bg-red-50 text-red-700 border-red-100 shadow-red-900/5'}`}
                            >
                                <div className={`p-3 rounded-2xl ${message.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                    {message.type === 'success' ? <CheckCircle size={28} /> : <AlertCircle size={28} />}
                                </div>
                                <p className="font-black text-lg tracking-tight italic uppercase">{message.text}</p>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="bg-white p-10 md:p-12 rounded-[3.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 space-y-8">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <Field label="Piece Name" icon={Tag}>
                                            <input
                                                name="name"
                                                type="text"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full bg-transparent outline-none font-bold text-gray-900 placeholder:text-gray-300"
                                                placeholder="Give your masterpiece a unique name..."
                                                required
                                            />
                                        </Field>
                                        <p className="mt-2 ml-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest italic flex items-center gap-2">
                                            <Store size={10} />
                                            From {user.shopName || user.name}'s Collection
                                        </p>
                                    </div>

                                    <Field label="Heritage Category" icon={Layers}>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full bg-transparent outline-none font-bold text-gray-900 appearance-none cursor-pointer"
                                        >
                                            <option>Barong Tagalog</option>
                                            <option>Filipiniana Dresses</option>
                                            <option>Accessories</option>
                                        </select>
                                    </Field>

                                    <Field label="Price" icon={Tag}>
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-gray-400">₱</span>
                                            <input
                                                name="price"
                                                type="number"
                                                value={formData.price}
                                                onChange={handleChange}
                                                className="w-full bg-transparent outline-none font-bold text-gray-900 placeholder:text-gray-300"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </Field>

                                    <div className="md:col-span-2">
                                        <Field label="Pieces Available" icon={Package}>
                                            <input
                                                name="stock"
                                                type="number"
                                                value={formData.stock}
                                                onChange={handleChange}
                                                className="w-full bg-transparent outline-none font-bold text-gray-900 placeholder:text-gray-300"
                                                placeholder="How many in stock?"
                                                required
                                            />
                                        </Field>
                                    </div>

                                    <div className="md:col-span-2">
                                        <Field label="Estimated Production Days" icon={Clock}>
                                            <input
                                                name="leadTime"
                                                type="number"
                                                value={formData.leadTime}
                                                onChange={handleChange}
                                                className="w-full bg-transparent outline-none font-bold text-gray-900 placeholder:text-gray-300"
                                                placeholder="Days to produce..."
                                                required
                                            />
                                        </Field>
                                    </div>

                                    <div className="md:col-span-2">
                                        <Field label="Available Sizes" icon={Layers}>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={newSize}
                                                        onChange={(e) => setNewSize(e.target.value)}
                                                        className="flex-1 bg-transparent outline-none font-bold text-gray-900 placeholder:text-gray-300"
                                                        placeholder="e.g. M, XL, Custom"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                if (newSize.trim()) {
                                                                    setFormData(prev => ({ ...prev, sizes: [...prev.sizes, newSize.trim()] }));
                                                                    setNewSize('');
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (newSize.trim()) {
                                                                setFormData(prev => ({ ...prev, sizes: [...prev.sizes, newSize.trim()] }));
                                                                setNewSize('');
                                                            }
                                                        }}
                                                        className="px-4 py-1 bg-gray-900 text-white text-[10px] font-black uppercase rounded-xl hover:bg-red-600 transition-all"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.sizes.map((s, idx) => (
                                                        <span key={idx} className="px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-black uppercase text-gray-600 flex items-center gap-2">
                                                            {s}
                                                            <X size={10} className="cursor-pointer hover:text-red-600" onClick={() => setFormData(prev => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== idx) }))} />
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </Field>
                                    </div>

                                    <div className="md:col-span-2">
                                        <Field label="Available Colors" icon={PlusCircle}>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={newColor}
                                                        onChange={(e) => setNewColor(e.target.value)}
                                                        className="flex-1 bg-transparent outline-none font-bold text-gray-900 placeholder:text-gray-300"
                                                        placeholder="e.g. Classic White, Ivory"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                if (newColor.trim()) {
                                                                    setFormData(prev => ({ ...prev, colors: [...prev.colors, newColor.trim()] }));
                                                                    setNewColor('');
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (newColor.trim()) {
                                                                setFormData(prev => ({ ...prev, colors: [...prev.colors, newColor.trim()] }));
                                                                setNewColor('');
                                                            }
                                                        }}
                                                        className="px-4 py-1 bg-gray-900 text-white text-[10px] font-black uppercase rounded-xl hover:bg-red-600 transition-all"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.colors.map((c, idx) => (
                                                        <span key={idx} className="px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-black uppercase text-gray-600 flex items-center gap-2">
                                                            {c}
                                                            <X size={10} className="cursor-pointer hover:text-red-600" onClick={() => setFormData(prev => ({ ...prev, colors: prev.colors.filter((_, i) => i !== idx) }))} />
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </Field>
                                    </div>

                                    <div className="md:col-span-2">
                                        <Field label="The Artisan Story & Specs" icon={FileText}>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows="4"
                                                className="w-full bg-transparent outline-none font-medium text-gray-600 placeholder:text-gray-300 resize-none"
                                                placeholder="Detail the embroidery style, specific threadwork, and fabric..."
                                            ></textarea>
                                        </Field>
                                    </div>

                                    {/* GCash Settlement Settings */}
                                    <div className="md:col-span-2 pt-6 border-t border-gray-100">
                                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                            Payment Settlement (GCash)
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Field label="GCash Number" icon={PlusCircle}>
                                                <input
                                                    name="gcashNumber"
                                                    type="text"
                                                    value={formData.gcashNumber || ''}
                                                    onChange={handleChange}
                                                    className="w-full bg-transparent outline-none font-bold text-gray-900 placeholder:text-gray-300"
                                                    placeholder="0917-xxx-xxxx"
                                                />
                                            </Field>

                                            <div className="group">
                                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3 ml-2 group-focus-within:text-blue-600 transition-colors">
                                                    GCash QR Code
                                                </label>
                                                <label className="flex items-center gap-4 p-5 rounded-3xl bg-gray-50 border border-dashed border-gray-200 cursor-pointer hover:bg-white hover:border-blue-200 transition-all">
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            const file = e.target.files[0];
                                                            if (!file) return;
                                                            const uploadData = new FormData();
                                                            uploadData.append('image', file);
                                                            try {
                                                                const res = await api.post('/upload', uploadData);
                                                                setFormData(prev => ({ ...prev, gcashQrCode: res.data.url }));
                                                            } catch (err) {
                                                                console.error('QR Upload failed', err);
                                                            }
                                                        }}
                                                        accept="image/*"
                                                    />
                                                    <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 uppercase text-[9px] font-black tracking-widest text-gray-400">
                                                        {formData.gcashQrCode ? 'Update QR' : 'Upload QR'}
                                                    </div>
                                                    {formData.gcashQrCode && (
                                                        <img src={formData.gcashQrCode} className="h-10 w-10 object-cover rounded-lg border border-gray-100" />
                                                    )}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || isUploading}
                                className="w-full bg-red-600 text-white h-20 rounded-[2rem] font-black text-lg flex items-center justify-center gap-4 hover:bg-black transition-all shadow-2xl shadow-red-200 disabled:opacity-50 group"
                            >
                                {isSubmitting ? 'Syncing with Registry...' : (
                                    <>
                                        <span>Publish to Collection</span>
                                        <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

function Field({ label, icon: Icon, children }) {
    return (
        <div className="group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3 ml-2 group-focus-within:text-red-600 transition-colors">
                {label}
            </label>
            <div className="flex items-start gap-4 p-5 rounded-3xl bg-gray-50 border border-transparent group-focus-within:bg-white group-focus-within:border-red-100 group-focus-within:shadow-lg group-focus-within:shadow-red-50 transition-all">
                <Icon size={18} className="text-gray-300 mt-0.5 group-focus-within:text-red-600 transition-colors" />
                <div className="flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}
