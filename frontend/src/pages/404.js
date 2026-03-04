import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, AlertCircle } from 'lucide-react';

export default function Custom404() {
    return (
        <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <AlertCircle size={48} className="text-red-600" />
                    </div>

                    <h1 className="text-6xl font-black text-gray-900 mb-4 tracking-tighter">404</h1>
                    <p className="text-red-600 font-bold uppercase tracking-[0.25em] text-xs mb-6">Page Not Found</p>

                    <p className="text-gray-500 font-medium mb-10 leading-relaxed">
                        The heritage piece you're looking for might have been moved or doesn't exist.
                    </p>

                    <Link href="/">
                        <button className="bg-gray-900 text-white h-12 px-8 rounded-xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-gray-200 mx-auto">
                            <Home size={18} />
                            Back to Showroom
                        </button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
