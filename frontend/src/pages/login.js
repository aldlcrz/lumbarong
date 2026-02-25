import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      // Re-fetch user from sessionStorage because AuthContext update might be async
      const savedUser = JSON.parse(sessionStorage.getItem('user'));
      const role = savedUser.role;

      if (role === 'admin') router.push('/admin/dashboard');
      else if (role === 'seller') router.push('/seller/dashboard');
      else router.push('/'); // Customer
    } else {
      setError(result.message || 'Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#fdfbf7] barong-pattern">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 relative overflow-hidden"
      >
        {/* Subtle decorative element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 opacity-50"></div>

        <div className="relative">
          <div className="text-center mb-10">
            <Link href="/">
              <span className="text-4xl font-black italic tracking-tighter text-red-600 cursor-pointer">LumBarong</span>
            </Link>
            <h2 className="text-2xl font-bold text-gray-800 mt-6 md:text-3xl">Mabuhay!</h2>
            <p className="text-gray-500 mt-2 font-medium">Welcome back to the artisan marketplace</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-3"
            >
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-14 pr-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all font-medium"
                  placeholder="name@example.ph"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-14 pr-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 text-white h-14 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-xl shadow-red-200 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <LogIn size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-50 text-center">
            <p className="text-gray-500 font-medium">
              New here? {' '}
              <Link href="/register">
                <span className="text-red-600 font-bold hover:underline cursor-pointer inline-flex items-center gap-1">
                  Create Account <ArrowRight size={14} />
                </span>
              </Link>
            </p>
          </div>

          <div className="mt-6 flex justify-center items-center gap-2 opacity-40">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Heritage Portal</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}