import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import SellerLayout from '@/components/SellerLayout';
import api from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PlusCircle,
    Trash2,
    Edit3,
    Eye,
    Search,
    Package,
    AlertCircle,
    ArrowLeft,
    Save,
    X,
    TrendingDown,
    Filter,
    CheckCircle2,
    ShoppingBag,
    Star,
    ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function InventoryPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [stockFilter, setStockFilter] = useState('All');
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [notif, setNotif] = useState({ show: false, message: '', type: 'success' });
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        if (user && (user.role === 'seller' || user.role === 'admin')) {
            fetchProducts();
            fetchCategories();
            const interval = setInterval(fetchProducts, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    const fetchProducts = async () => {
        try {
            if (products.length === 0) setLoading(true);
            const res = await api.get(`/products?shop=${user.id}`);
            setProducts(res.data);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        try {
            await api.delete(`/products/${id}`);
            setProducts(products.filter(p => p.id !== id));
            setDeleteTarget(null);
            showNotif('Product deleted successfully', 'success');
        } catch (err) {
            setDeleteTarget(null);
            showNotif('Failed to delete product', 'error');
        }
    };

    const handleUpdateStock = async (id) => {
        try {
            const newValue = parseInt(editValue);
            if (isNaN(newValue) || newValue < 0) {
                showNotif('Please enter a valid quantity', 'error');
                return;
            }

            await api.patch(`/products/${id}/stock`, { stock: newValue });
            setProducts(products.map(p => p.id === id ? { ...p, stock: newValue } : p));
            setEditingId(null);
            showNotif('Inventory updated successfully', 'success');
        } catch (err) {
            showNotif('Failed to update stock', 'error');
        }
    };

    const showNotif = (message, type) => {
        setNotif({ show: true, message, type });
        setTimeout(() => setNotif({ ...notif, show: false }), 3000);
    };

    if (authLoading || !user) return null;


    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const catValue = p.category?.id || p.CategoryId || p.category; // Handle both object and legacy string
        const matchesCategory = categoryFilter === 'All' || catValue === categoryFilter;
        const matchesStock = stockFilter === 'All' ||
            (stockFilter === 'Low Stock' && p.stock <= (p.lowStockThreshold || 5)) ||
            (stockFilter === 'Out of Stock' && p.stock === 0) ||
            (stockFilter === 'In Stock' && p.stock > (p.lowStockThreshold || 5));

        return matchesSearch && matchesCategory && matchesStock;
    });

    const lowStockCount = products.filter(p => p.stock <= (p.lowStockThreshold || 5)).length;

    return (
        <SellerLayout>
            <div className="py-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="mb-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-100 hover:border-red-600 hover:bg-red-50 transition-all shadow-sm group"
                        >
                            <ArrowLeft size={16} className="text-gray-400 group-hover:text-red-600 transition-colors" />
                            <span className="text-[10px] font-black text-gray-500 group-hover:text-red-600 uppercase tracking-widest">Back</span>
                        </button>
                        <p className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] mb-3">Warehouse Management</p>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tighter italic">Inventory Console</h1>
                        <div className="flex items-center gap-3 mt-2">
                            <p className="text-gray-500 font-medium italic">Tracking {products.length} active designs in your workshop.</p>
                            {lowStockCount > 0 && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-100 animate-pulse">
                                    <TrendingDown size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{lowStockCount} items need attention</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <Link href="/seller/add-product">
                            <button className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-red-100 flex items-center gap-2">
                                <PlusCircle size={18} />
                                Post New Design
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm mb-12 flex flex-col lg:flex-row gap-6 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by product name..."
                            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-red-600/10 transition-all font-bold text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl shrink-0">
                            <Filter size={14} className="text-gray-400" />
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="bg-transparent outline-none font-bold text-xs text-gray-600 pr-4"
                            >
                                <option value="All">All Categories</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl shrink-0">
                            <Package size={14} className="text-gray-400" />
                            <select
                                value={stockFilter}
                                onChange={(e) => setStockFilter(e.target.value)}
                                className="bg-transparent outline-none font-bold text-xs text-gray-600 pr-4"
                            >
                                <option value="All">All Status</option>
                                <option value="In Stock">In Stock</option>
                                <option value="Low Stock">Low Stock</option>
                                <option value="Out of Stock">Out of Stock</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Inventory Table/Grid */}
                {loading ? (
                    <div className="py-32 text-center">
                        <div className="w-16 h-16 border-4 border-red-600/10 border-t-red-600 rounded-full animate-spin mx-auto mb-6"></div>
                        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Scanning Workshop...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredProducts.map(product => {
                            const isLowStock = product.stock <= (product.lowStockThreshold || 5);
                            const isOut = product.stock === 0;

                            return (
                                <motion.div
                                    layout
                                    key={product.id}
                                    className={`bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm transition-all group ${isLowStock ? 'hover:border-red-200' : 'hover:border-gray-200'}`}
                                >
                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                        {/* Product Preview */}
                                        <div className="w-20 h-24 rounded-2xl overflow-hidden bg-gray-50 shrink-0 border border-gray-50">
                                            <img src={product.images?.[0]?.url || null} className="w-full h-full object-cover" />
                                        </div>

                                        {/* info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">{product.category?.name || (typeof product.category === 'string' ? product.category : 'Barong')}</span>
                                            </div>
                                            <h3 className="text-xl font-black text-gray-900 tracking-tight">{product.name}</h3>
                                            <p className="text-xs text-gray-400 font-medium italic mb-3">SKU: {product.id?.toString().slice(-8).toUpperCase() || 'N/A'}</p>

                                            {/* Sales Funnel */}
                                            <div className="flex items-center gap-1">
                                                {/* Stage 1: Listed */}
                                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 border border-blue-100 rounded-xl">
                                                    <ShoppingBag size={10} className="text-blue-500" />
                                                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Listed</span>
                                                </div>
                                                <div className="text-gray-200 font-black text-xs">›</div>
                                                {/* Stage 2: Reviews */}
                                                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${(product.ratings?.length || 0) > 0
                                                    ? 'bg-amber-50 border-amber-100'
                                                    : 'bg-gray-50 border-gray-100'
                                                    }`}>
                                                    <Star size={10} className={(product.ratings?.length || 0) > 0 ? 'text-amber-500' : 'text-gray-300'} />
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${(product.ratings?.length || 0) > 0 ? 'text-amber-600' : 'text-gray-400'
                                                        }`}>{product.ratings?.length || 0} Reviews</span>
                                                </div>
                                                <div className="text-gray-200 font-black text-xs">›</div>
                                                {/* Stage 3: Stock */}
                                                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${isOut
                                                    ? 'bg-red-50 border-red-100'
                                                    : isLowStock
                                                        ? 'bg-amber-50 border-amber-100'
                                                        : 'bg-green-50 border-green-100'
                                                    }`}>
                                                    <Package size={10} className={isOut ? 'text-red-500' : isLowStock ? 'text-amber-500' : 'text-green-500'} />
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${isOut ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-green-600'
                                                        }`}>
                                                        {isOut ? 'Sold Out' : isLowStock ? 'Low Stock' : 'In Stock'}
                                                    </span>
                                                </div>

                                                {/* Stage 4: Registry Status */}
                                                <div className="text-gray-200 font-black text-xs">›</div>
                                                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${product.status === 'approved'
                                                    ? 'bg-green-50 border-green-100 text-green-600'
                                                    : product.status === 'rejected'
                                                        ? 'bg-red-50 border-red-100 text-red-600'
                                                        : 'bg-amber-50 border-amber-100 text-amber-600'
                                                    }`}>
                                                    <ShieldCheck size={10} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">
                                                        {product.status || 'Pending'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stock Level Control */}
                                        <div className="flex items-center gap-12 shrink-0">
                                            <div className="text-center md:text-right px-6 py-2 bg-gray-50 rounded-2xl border border-gray-100 min-w-[140px]">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Available Units</p>
                                                {editingId === product.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            autoFocus
                                                            type="number"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            className="w-20 bg-white border border-red-200 rounded-lg px-2 py-1 font-black text-center text-red-600 text-xl outline-none"
                                                        />
                                                        <div className="flex flex-col gap-1">
                                                            <button
                                                                onClick={() => handleUpdateStock(product.id)}
                                                                className="p-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                                                            >
                                                                <Save size={12} />
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingId(null)}
                                                                className="p-1 bg-gray-200 text-gray-500 rounded-md hover:bg-gray-300 transition-colors"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center md:justify-end gap-3 group/edit">
                                                        <span className={`text-2xl font-black italic tracking-tighter ${isOut ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-gray-900'}`}>
                                                            {product.stock}
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                setEditingId(product.id);
                                                                setEditValue(product.stock.toString());
                                                            }}
                                                            className="p-2 opacity-0 group-hover/edit:opacity-100 transition-opacity text-gray-400 hover:text-red-600"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Link href={`/products/${product.id}`}>
                                                    <div className="p-4 rounded-2xl bg-blue-50 text-blue-400 hover:bg-blue-600 hover:text-white transition-all cursor-pointer" title="View product">
                                                        <Eye size={20} />
                                                    </div>
                                                </Link>
                                                <Link href={`/seller/add-product?edit=${product.id}`}>
                                                    <div className="p-4 rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-900 hover:text-white transition-all cursor-pointer" title="Edit product">
                                                        <Edit3 size={20} />
                                                    </div>
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteTarget(product)}
                                                    className="p-4 rounded-2xl bg-red-50 text-red-400 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                                                    title="Delete product"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {filteredProducts.length === 0 && (
                            <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
                                <Package size={48} className="mx-auto text-gray-100 mb-6" />
                                <h4 className="text-xl font-black text-gray-900 mb-2">No Matching Patterns</h4>
                                <p className="text-gray-400 font-medium">Clear your filters or add new designs to your workshop.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteTarget(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2.5rem] p-8 max-w-md w-full relative z-10 shadow-2xl border border-gray-100"
                        >
                            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                                <Trash2 size={32} className="text-red-600" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic text-center mb-4">
                                Unlist Pattern?
                            </h2>
                            <p className="text-gray-500 text-center font-medium italic mb-8">
                                Are you sure you want to remove <span className="text-red-600 font-bold">"{deleteTarget.name}"</span> from your workshop? This action cannot be undone.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    className="py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all border border-gray-100"
                                >
                                    Keep Design
                                </button>
                                <button
                                    onClick={() => handleDeleteProduct(deleteTarget.id)}
                                    className="py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-red-600 text-white hover:bg-black transition-all shadow-xl shadow-red-100"
                                >
                                    Delete Anyway
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Notification Toast */}
            <AnimatePresence>
                {notif.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${notif.type === 'success'
                            ? 'bg-black text-white border-white/10'
                            : 'bg-red-600 text-white border-red-500'
                            }`}
                    >
                        {notif.type === 'success' ? <CheckCircle2 size={18} className="text-green-400" /> : <AlertCircle size={18} />}
                        <span className="text-xs font-black uppercase tracking-widest">{notif.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </SellerLayout>
    );
}
