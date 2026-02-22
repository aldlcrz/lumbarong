import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Shop, Store, ArrowRight, CheckCircle2, ShoppingBag, ShieldCheck, Smartphone } from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'customer',
        shopName: '',
        shopDescription: '',
        gcashNumber: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        setIsLoading(true);

        const result = await register(formData);
        if (result.success) {
            setStatus({ type: 'success', message: result.message });
            setTimeout(() => {
                router.push('/');
            }, 2500);
        } else {
            setStatus({ type: 'error', message: result.message });
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#fdfbf7] barong-pattern">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-gray-100 relative overflow-hidden"
            >
                {/* Decorative background circle */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-red-50 rounded-full -mr-20 -mt-20 opacity-50"></div>

                <div className="relative">
                    <div className="text-center mb-10">
                        <Link href="/">
                            <span className="text-3xl font-black italic tracking-tighter text-red-600 cursor-pointer">LumBarong</span>
                        </Link>
                        <h2 className="text-3xl font-black text-gray-800 mt-6 tracking-tight">Create Your Account</h2>
                        <p className="text-gray-500 mt-2 font-medium">Join our community of heritage craft lovers</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {status.message && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`p-4 rounded-2xl text-sm font-bold mb-8 flex items-center gap-3 border ${status.type === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}
                            >
                                {status.type === 'success' ? <CheckCircle2 size={20} /> : <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>}
                                {status.message}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Role Switcher */}
                        <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100 mb-8">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'customer' })}
                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.role === 'customer' ? 'bg-white shadow-sm text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <ShoppingBag size={14} />
                                    Buyer
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'seller' })}
                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.role === 'seller' ? 'bg-white shadow-sm text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Store size={14} />
                                    Artisan
                                </div>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className={formData.role === 'seller' ? 'md:col-span-1' : 'md:col-span-2'}>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    <input
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-sm"
                                        placeholder="Juan Dela Cruz"
                                        required
                                    />
                                </div>
                            </div>

                            <div className={formData.role === 'seller' ? 'md:col-span-1' : 'md:col-span-2'}>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-sm"
                                        placeholder="juan@example.ph"
                                        required
                                    />
                                </div>
                            </div>

                            {formData.role === 'seller' && (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="md:col-span-1"
                                    >
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Shop Name</label>
                                        <div className="relative">
                                            <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                            <input
                                                name="shopName"
                                                type="text"
                                                value={formData.shopName}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-sm"
                                                placeholder="Heritage Shop"
                                                required
                                            />
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="md:col-span-1"
                                    >
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">GCash Number</label>
                                        <div className="relative">
                                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                            <input
                                                name="gcashNumber"
                                                type="text"
                                                value={formData.gcashNumber}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-sm"
                                                placeholder="09xx-xxx-xxxx"
                                                required
                                            />
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="md:col-span-2"
                                    >
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Artisan Story</label>
                                        <textarea
                                            name="shopDescription"
                                            value={formData.shopDescription}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full px-4 py-3.5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-sm resize-none"
                                            placeholder="Tell us about your heritage craft..."
                                            required
                                        ></textarea>
                                    </motion.div>
                                </>
                            )}
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Secure Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-red-600 outline-none transition-all font-medium text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-red-600 text-white h-16 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-xl shadow-red-200 active:scale-[0.98] disabled:opacity-50 mt-4"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>{formData.role === 'seller' ? 'Register as Artisan' : 'Create My Account'}</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-gray-50 text-center">
                        <p className="text-gray-500 font-medium text-sm">
                            Already part of the heritage? {' '}
                            <Link href="/login">
                                <span className="text-red-600 font-bold hover:underline cursor-pointer">
                                    Sign In Here
                                </span>
                            </Link>
                        </p>
                    </div>

                    <div className="mt-6 flex justify-center items-center gap-2 opacity-30">
                        <ShieldCheck size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Artisan Registration</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
