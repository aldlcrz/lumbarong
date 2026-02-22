import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import {
    Users,
    Store,
    TrendingUp,
    Package,
    ChevronRight,
    LayoutDashboard,
    ShoppingBag,
    Settings,
    ShieldCheck,
    AlertCircle,
    Trash2,
    Eye,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function AdminProducts() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to remove this product from the platform?')) return;
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
        } catch (err) {
            console.error(err);
        }
    };

    if (authLoading || !user) return null;
    if (user.role !== 'admin') {
        router.push('/');
        return null;
    }

    return (
        <div className="bg-[#fdfbf7] min-h-screen">
            <Navbar />
            <div className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-4">
                <Link href="/admin/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-gray-100 hover:bg-red-50 hover:border-red-100 text-gray-600 hover:text-red-600 font-bold text-sm transition-all">
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </Link>
            </div>
            <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-8 p-6 lg:p-12">

                {/* Sidebar Navigation */}
                <aside className="lg:w-1/5 shrink-0">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm sticky top-32">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-8">System Catalog</p>
                        <nav className="space-y-2">
                            <SidebarLink href="/admin/dashboard" icon={LayoutDashboard}>Dashboard</SidebarLink>
                            <SidebarLink href="/admin/sellers" icon={Users}>Manage Sellers</SidebarLink>
                            <SidebarLink href="/admin/products" icon={Store} active>Manage Products</SidebarLink>
                            <SidebarLink href="/profile" icon={Settings}>System Settings</SidebarLink>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="lg:flex-1 min-w-0">


                    <header className="mb-10">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase">Central Catalog</h1>
                        <p className="text-gray-500 font-medium italic">Overseeing all heritage collections across the platform.</p>
                    </header>

                    <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="py-20 text-center border-2 border-dashed border-gray-50 rounded-[2rem]">
                                <Package size={48} className="mx-auto text-gray-100 mb-4" />
                                <p className="text-gray-300 font-bold italic">No products registered yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-50">
                                            <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                                            <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Artisan</th>
                                            <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Price</th>
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
                                                            <p className="text-[10px] font-bold text-gray-400 italic">Category: {product.category || 'Barong'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6 text-center">
                                                    <p className="text-xs font-bold text-gray-600 bg-gray-50 inline-block px-3 py-1 rounded-full">{product.seller?.shopName || 'Unknown Shop'}</p>
                                                </td>
                                                <td className="py-6 text-center">
                                                    <p className="font-black text-red-600 italic text-sm">₱{product.price.toLocaleString()}</p>
                                                </td>
                                                <td className="py-6">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/products/${product.id}`}>
                                                            <button className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                                                <Eye size={18} />
                                                            </button>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
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
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

function SidebarLink({ href, icon: Icon, children, active }) {
    return (
        <Link href={href}>
            <div className={`flex items-center gap-3 p-4 rounded-2xl transition-all cursor-pointer group ${active ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50 hover:text-red-600'}`}>
                <Icon size={18} className={active ? 'text-red-500' : 'group-hover:scale-110 transition-transform'} />
                <span className="text-xs font-black uppercase tracking-widest">{children}</span>
            </div>
        </Link>
    );
}
