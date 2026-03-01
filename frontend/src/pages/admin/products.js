import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import AdminLayout from '@/components/AdminLayout';
import {
    Package,
    ShoppingBag,
    ShieldCheck,
    Trash2,
    Eye,
    ArrowLeft,
    Layers,
    Plus,
    Edit2,
    Save,
    X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function AdminProducts() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('all');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

    useEffect(() => {
        if (user && user.role === 'admin') {
            const searchQuery = router.query.search || '';
            if (activeTab === 'all') fetchProducts(searchQuery);
            if (activeTab === 'categories') fetchCategories();
        }
    }, [activeTab, user, router.query.search]);

    const fetchProducts = async (search = '') => {
        setLoading(true);
        try {
            const url = search ? `/products?search=${encodeURIComponent(search)}` : '/products';
            const res = await api.get(url);
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!confirm('Are you sure you want to remove this product from the platform?')) return;
        try {
            await api.delete(`/products/${id}`);
            if (activeTab === 'all') fetchProducts();
        } catch (err) {
            console.error(err);
        }
    };

    const handleProductStatus = async (id, status) => {
        try {
            await api.patch(`/products/${id}/status`, { status });
            if (activeTab === 'all') fetchProducts();
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            await api.post('/categories', categoryForm);
            setCategoryForm({ name: '', description: '' });
            setIsAddingCategory(false);
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create category');
        }
    };

    const handleUpdateCategory = async (id) => {
        try {
            await api.put(`/categories/${id}`, categoryForm);
            setEditingCategoryId(null);
            setCategoryForm({ name: '', description: '' });
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update category');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await api.delete(`/categories/${id}`);
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete category');
        }
    };

    if (authLoading || !user) return null;
    if (user.role !== 'admin') {
        router.push('/');
        return null;
    }

    return (
        <AdminLayout>
            <div className="flex flex-col gap-8">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Central Catalog</h1>
                        <p className="text-sm text-gray-400 font-bold">Overseeing all heritage collections and segments.</p>
                    </div>

                    {/* Status Tabs */}
                    <div className="flex p-1.5 bg-white border border-gray-100 rounded-2xl self-start md:self-auto overflow-x-auto shadow-sm">
                        <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')} icon={ShoppingBag}>All Products</TabButton>
                        <TabButton active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} icon={Layers}>Categories</TabButton>
                    </div>
                </header>

                {/* Tab Content */}
                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm overflow-hidden">
                    {loading && activeTab !== 'categories' ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                        </div>
                    ) : activeTab === 'all' ? (
                        <ProductTable products={products} onDelete={handleDeleteProduct} onAction={handleProductStatus} />
                    ) : (
                        <CategoryManager
                            categories={categories}
                            loading={loading}
                            isAdding={isAddingCategory}
                            setIsAdding={setIsAddingCategory}
                            editingId={editingCategoryId}
                            setEditingId={setEditingCategoryId}
                            formData={categoryForm}
                            setFormData={setCategoryForm}
                            onCreate={handleCreateCategory}
                            onUpdate={handleUpdateCategory}
                            onDelete={handleDeleteCategory}
                        />
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

function TabButton({ children, active, onClick, icon: Icon }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${active ? 'bg-red-50 text-red-600 shadow-sm border border-red-100/50' : 'text-gray-400 hover:text-gray-600'}`}
        >
            <Icon size={14} className={active ? 'text-red-600' : ''} />
            {children}
        </button>
    );
}

function ProductTable({ products, onDelete, onAction }) {
    if (products.length === 0) return (
        <div className="py-20 text-center border-2 border-dashed border-gray-50 rounded-[2rem]">
            <Package size={48} className="mx-auto text-gray-100 mb-4" />
            <p className="text-gray-300 font-bold italic">No products registered yet.</p>
        </div>
    );

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-gray-50">
                        <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                        <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Artisan</th>
                        <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                        <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {products.map(product => (
                        <tr key={product.id} className="group hover:bg-gray-50/50 transition-all">
                            <td className="py-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden relative border border-gray-100">
                                        <img src={product.images?.[0]?.url || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 uppercase tracking-tight text-sm line-clamp-1">{product.name}</p>
                                        <p className="text-[10px] font-bold text-gray-400 italic">Category: {product.category?.name || product.category || 'Barong'}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-6 text-center">
                                <p className="text-xs font-bold text-gray-600 bg-gray-50 inline-block px-3 py-1 rounded-full">{product.seller?.shopName || 'Unknown Shop'}</p>
                            </td>
                            <td className="py-6 text-center">
                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${product.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' :
                                    product.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                        'bg-red-50 text-red-600 border-red-100'
                                    }`}>
                                    {product.status || 'pending'}
                                </span>
                            </td>
                            <td className="py-6">
                                <div className="flex justify-end gap-2">
                                    <Link href={`/products/${product.id}`}>
                                        <button className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                            <Eye size={18} />
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => onDelete(product.id)}
                                        className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function CategoryManager({ categories, loading, isAdding, setIsAdding, editingId, setEditingId, formData, setFormData, onCreate, onUpdate, onDelete }) {
    const startEditing = (cat) => {
        setEditingId(cat.id);
        setFormData({ name: cat.name, description: cat.description });
    };

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <h2 className="text-xl font-black text-gray-900 uppercase italic">Category Segments</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-red-600 text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-red-100"
                >
                    {isAdding ? <X size={14} /> : <Plus size={14} />}
                    {isAdding ? 'Cancel' : 'New Category'}
                </button>
            </header>

            {isAdding && (
                <section className="bg-gray-50/50 rounded-3xl p-8 border border-red-100 border-l-8 border-l-red-600">
                    <form onSubmit={onCreate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Category Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-4 bg-white rounded-2xl border border-gray-100 focus:border-red-600 outline-none font-bold italic uppercase"
                                    placeholder="e.g. Wedding Collections"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Description</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-4 bg-white rounded-2xl border border-gray-100 focus:border-red-600 outline-none font-bold"
                                    placeholder="Brief overview of collection"
                                />
                            </div>
                        </div>
                        <button type="submit" className="bg-gray-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all">
                            Add Segment
                        </button>
                    </form>
                </section>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-50">
                            <th className="pb-6 text-[10px] font-black text-gray-300 uppercase tracking-widest">Name</th>
                            <th className="pb-6 text-[10px] font-black text-gray-300 uppercase tracking-widest">Desc</th>
                            <th className="pb-6 text-[10px] font-black text-gray-300 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {categories.map(cat => (
                            <tr key={cat.id} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="py-6 pr-4">
                                    {editingId === cat.id ? (
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full p-3 bg-white rounded-xl border border-red-600 outline-none font-black text-sm uppercase italic"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                                                <Layers size={14} />
                                            </div>
                                            <span className="font-black text-gray-900 uppercase tracking-tight italic">{cat.name}</span>
                                        </div>
                                    )}
                                </td>
                                <td className="py-6 px-4">
                                    {editingId === cat.id ? (
                                        <input
                                            type="text"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full p-3 bg-white rounded-xl border border-red-600 outline-none text-sm font-medium"
                                        />
                                    ) : (
                                        <p className="text-sm text-gray-500 font-medium truncate max-w-xs">{cat.description || 'N/A'}</p>
                                    )}
                                </td>
                                <td className="py-6 pl-4 text-right">
                                    {editingId === cat.id ? (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => onUpdate(cat.id)} className="p-2 rounded-xl bg-gray-900 text-white hover:bg-green-600 transition-all"><Save size={16} /></button>
                                            <button onClick={() => setEditingId(null)} className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 transition-all"><X size={16} /></button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEditing(cat)} className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-900 hover:text-white transition-all"><Edit2 size={16} /></button>
                                            <button onClick={() => onDelete(cat.id)} className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16} /></button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && (
                    <div className="py-12 flex justify-center">
                        <div className="w-8 h-8 border-2 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
                    </div>
                )}
                {!loading && categories.length === 0 && (
                    <div className="py-20 text-center">
                        <Layers className="mx-auto text-gray-100 mb-4" size={48} />
                        <p className="text-gray-300 font-bold italic">No segments defined.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
