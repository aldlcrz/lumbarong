import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import api from '@/utils/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Upload, X, CheckCircle, Package, Tag, Layers, FileText, Info, PlusCircle, ArrowRight, AlertCircle, ArrowLeft, Store } from 'lucide-react';

export default function AddProduct() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Barong Tagalog',
        stock: '',
        images: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (!authLoading && (!user || (user.role !== 'seller' && user.role !== 'admin'))) {
            router.push('/login');
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
                images: product.images.map(img => img.url || img)
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
                    <p className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] mb-3">Artisan Studio</p>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter italic mb-4">Showcase Your Work</h1>
                    <p className="text-gray-500 font-medium max-w-xl mx-auto">Publish your latest handcrafted masterpiece. Note: 3-5 photos required (Front, Back, Side).</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left: Media Upload */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-28 bg-white p-8 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Upload size={18} className="text-red-600" />
                                Visual Showcase
                            </h3>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                {formData.images.map((img, i) => (
                                    <div key={i} className="aspect-[3/4] rounded-2xl relative group overflow-hidden border border-gray-100 shadow-sm">
                                        <img src={img || null} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-2">
                                            <p className="text-[8px] font-black text-white uppercase tracking-widest text-center">{angleLabels[i]}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="absolute top-2 right-2 bg-white/90 backdrop-blur-md p-2 rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}

                                {formData.images.length < 5 && (
                                    <label
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                        className={`aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${isUploading ? 'bg-gray-50 border-gray-200' : 'border-gray-200 hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-600'}`}>
                                        <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                                        {isUploading ? (
                                            <div className="w-8 h-8 border-2 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-white group-hover:shadow-sm">
                                                    <PlusCircle size={24} />
                                                </div>
                                                <div className="text-center">
                                                    <span className="text-[10px] font-black uppercase tracking-widest block">{angleLabels[formData.images.length]}</span>
                                                    <span className="text-[8px] font-bold text-gray-300 block mt-1">Drag or click</span>
                                                </div>
                                            </>
                                        )}
                                    </label>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 text-amber-700">
                                    <Info size={18} className="shrink-0" />
                                    <p className="text-[9px] font-bold leading-relaxed uppercase tracking-tight">
                                        Requirements: Min 3, Max 5. JPG/PNG/WebP. Max 5MB.
                                    </p>
                                </div>
                                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-xl">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${formData.images.length >= 3 ? 'text-green-600' : 'text-amber-600'}`}>
                                        {formData.images.length}/5 photos
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div className="lg:col-span-7">
                        {message.text && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`p-6 rounded-[2rem] mb-8 border flex items-center gap-4 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}
                            >
                                {message.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                                <p className="font-bold text-sm tracking-tight">{message.text}</p>
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
                    </div>
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

