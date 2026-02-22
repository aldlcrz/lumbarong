import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import api from '@/utils/api';
import { motion } from 'framer-motion';
import {
    PlusCircle,
    Trash2,
    Edit3,
    Search,
    Package,
    Store,
    ExternalLink,
    ChevronRight,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function MyCatalog() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        router.push('/seller/inventory');
    }, [router]);

    const fetchProducts = async () => {
        try {
            // Only show loader on initial fetch
            if (products.length === 0) setLoading(true);

            // Filter products by current seller
            const res = await api.get(`/products?shop=${user.id}`);
            setProducts(res.data);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id) => {
        if (!confirm('Are you sure you want to retire this design from your collection?')) return;
        try {
            await api.delete(`/products/${id}`);
            setProducts(products.filter(p => p.id !== id));
        } catch (err) {
            alert('Failed to delete product');
        }
    };

    if (authLoading || !user) return null;

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#fdfbf7]">
            <Navbar />

            <main className="container mx-auto px-4 md:px-8 py-12">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="mb-8 flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-gray-100 hover:border-red-600 hover:bg-red-50 transition-all shadow-sm group"
                >
                    <ArrowLeft size={18} className="text-gray-400 group-hover:text-red-600 transition-colors" />
                    <span className="text-sm font-black text-gray-600 group-hover:text-red-600 uppercase tracking-widest transition-colors">Back</span>
                </button>

                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <p className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] mb-3">Artisan Inventory</p>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tighter italic">My Design Catalog</h1>
                        <div className="flex items-center gap-3 mt-2">
                            <p className="text-gray-500 font-medium italic">Managing {products.length} of your exclusive handcrafted pieces.</p>
                            <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Registry synced in realtime</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search your designs..."
                                className="pl-12 pr-6 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm outline-none focus:border-red-600 transition-all font-bold text-sm min-w-[300px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Link href="/seller/add-product">
                            <button className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-red-100 flex items-center gap-2">
                                <PlusCircle size={18} />
                                New Showcase
                            </button>
                        </Link>
                    </div>
                </header>

                {loading ? (
                    <div className="py-32 text-center">
                        <div className="w-16 h-16 border-4 border-red-600/10 border-t-red-600 rounded-full animate-spin mx-auto mb-6"></div>
                        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Accessing Artisan Vault...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredProducts.map(product => (
                            <motion.div
                                layout
                                key={product.id}
                                className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all group"
                            >
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    {/* Media */}
                                    <div className="w-full md:w-32 h-40 rounded-[2rem] overflow-hidden bg-gray-50 shrink-0 border border-gray-100 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                        <img src={product.images?.[0]?.url || product.images?.[0] || null} className="w-full h-full object-cover" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 py-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-red-50 text-red-600 px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-red-100">
                                                {product.category}
                                            </span>
                                            <div className={`flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${product.stock < 5 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                                <Package size={10} />
                                                {product.stock} Units Remaining
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 mb-1 tracking-tight group-hover:text-red-600 transition-colors">{product.name}</h3>
                                        <p className="text-xs text-gray-400 font-medium line-clamp-1 italic">{product.description}</p>
                                    </div>

                                    {/* Price & Actions */}
                                    <div className="flex items-center gap-12 shrink-0">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">Base Commission</p>
                                            <p className="text-3xl font-black text-gray-900 tracking-tighter italic">₱{product.price?.toLocaleString()}</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link href={`/products/${product.id}`}>
                                                <div className="p-4 rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-900 hover:text-white transition-all cursor-pointer">
                                                    <ExternalLink size={20} />
                                                </div>
                                            </Link>
                                            <button
                                                onClick={() => deleteProduct(product.id)}
                                                className="p-4 rounded-2xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm shadow-red-100"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {filteredProducts.length === 0 && (
                            <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
                                <Package size={48} className="mx-auto text-gray-100 mb-6" />
                                <h4 className="text-xl font-black text-gray-900 mb-2">Heritage Vault Empty</h4>
                                <p className="text-gray-400 font-medium">You haven't showcased any designs yet or none match your search.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
