import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LogOut,
    PlusCircle,
    User,
    Users,
    ShoppingCart,
    ShoppingBag,
    Menu,
    X,
    LayoutDashboard,
    Layers,
    Store,
    Settings,
    ShieldCheck,
    MessageSquare,
    Search,
    ArrowLeft
} from 'lucide-react';
import api from '@/utils/api';
import { useRouter } from 'next/router';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const router = useRouter();
    const { user, logout } = useAuth();
    const { cartCount } = useCart();

    // Debounced search
    React.useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length > 2) {
                try {
                    const res = await api.get(`/products?search=${searchQuery}`);
                    setSuggestions(res.data.slice(0, 5));
                    setShowSuggestions(true);
                } catch (err) {
                    console.error(err);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    if (!user) return null;

    const NavLink = ({ href, children, icon: Icon }) => (
        <Link href={href}>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer font-bold text-sm text-gray-500">
                {Icon && <Icon size={18} />}
                <span>{children}</span>
            </div>
        </Link>
    );

    const renderRoleLinks = () => {
        switch (user.role) {
            case 'admin':
                return (
                    <>
                        <NavLink href="/admin/dashboard" icon={LayoutDashboard}>Admin Console</NavLink>
                        <NavLink href="/admin/sellers" icon={Users}>Manage Sellers</NavLink>
                    </>
                );
            case 'seller':
                return (
                    <>
                        <NavLink href="/seller/dashboard" icon={LayoutDashboard}>Shop Board</NavLink>
                        <NavLink href="/seller/orders" icon={ShoppingBag}>Order Registry</NavLink>
                        <NavLink href="/messages" icon={MessageSquare}>Messages</NavLink>
                        <NavLink href="/seller/inventory" icon={Layers}>Inventory</NavLink>
                    </>
                );
            default: // customer
                return (
                    <>
                        <NavLink href="/" icon={Store}>Heritage Mall</NavLink>
                        <NavLink href="/orders" icon={ShoppingBag}>My Orders</NavLink>
                        <NavLink href="/messages" icon={MessageSquare}>Messages</NavLink>
                        <NavLink href="/heritage-guide" icon={ShieldCheck}>Heritage Guide</NavLink>
                    </>
                );
        }
    };

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-[100]">
            <div className="container mx-auto px-4 md:px-8 h-20 flex justify-between items-center">
                <Link href="/">
                    <div className="flex items-center gap-2 cursor-pointer group">
                        <span className="text-2xl md:text-3xl font-black italic tracking-tighter text-red-600 group-hover:scale-105 transition-transform">LumBarong</span>
                        {user.role !== 'customer' && (
                            <span className="bg-gray-900 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-[0.1em]">
                                {user.role}
                            </span>
                        )}
                    </div>
                </Link>

                {/* Search Bar - Lazada Style - Hidden for Seller/Admin */}
                {user.role === 'customer' && (
                    <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
                        <div className="relative w-full group">
                            <input
                                type="text"
                                placeholder="Search for heritage pieces..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setShowSuggestions(suggestions.length > 0)}
                                className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-red-500 rounded-full py-2.5 pl-12 pr-4 text-sm font-bold transition-all outline-none"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors" size={18} />
                        </div>

                        <AnimatePresence>
                            {showSuggestions && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[110]"
                                >
                                    {suggestions.map(p => (
                                        <div
                                            key={p.id}
                                            onClick={() => {
                                                router.push(`/products/${p.id}`);
                                                setShowSuggestions(false);
                                                setSearchQuery('');
                                            }}
                                            className="px-6 py-4 hover:bg-red-50 cursor-pointer flex items-center gap-4 group"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden shrink-0">
                                                <img src={p.images?.[0]?.url || p.images?.[0] || 'https://via.placeholder.com/40'} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-gray-900 truncate group-hover:text-red-600 transition-colors">{p.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{p.category}</p>
                                            </div>
                                            <p className="text-xs font-black text-gray-900">₱{p.price.toLocaleString()}</p>
                                        </div>
                                    ))}
                                    <div
                                        onClick={() => router.push(`/shop?search=${searchQuery}`)}
                                        className="px-6 py-3 bg-gray-50 text-center text-[10px] font-black text-red-600 uppercase tracking-widest hover:bg-gray-100 cursor-pointer"
                                    >
                                        View all results
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Desktop nav: hidden for admin (admin uses hamburger only) */}
                <nav className={user.role === 'admin' ? 'hidden' : 'hidden lg:flex items-center gap-2'}>
                    {renderRoleLinks()}
                    <div className="h-6 w-px bg-gray-100 mx-4"></div>

                    <div className="flex items-center gap-4">
                        {user.role === 'customer' && (
                            <Link href="/cart" className="relative group p-2 rounded-full hover:bg-gray-50 transition-colors">
                                <ShoppingCart size={22} className="text-gray-900" />
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Mabuhay!</p>
                                <p className="text-sm font-bold text-gray-900">{user.name.split(' ')[0]}</p>
                            </div>
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm shadow-red-100"
                            >
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Hamburger: always visible for admin, else only on mobile (lg:hidden) */}
                <div className={`flex items-center gap-4 ${user.role === 'admin' ? '' : 'lg:hidden'}`}>
                    {user.role === 'customer' && (
                        <Link href="/cart" className="relative p-2">
                            <ShoppingCart size={24} className="text-gray-900" />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    )}
                    <button className="p-2 text-gray-900" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`bg-white border-b border-gray-100 overflow-hidden ${user.role === 'admin' ? '' : 'lg:hidden'}`}
                    >
                        <div className="container mx-auto px-6 py-8 space-y-4">
                            <div className="pb-4 border-b border-gray-50 mb-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Authenticated as</p>
                                <p className="text-lg font-black text-gray-900">{user.name}</p>
                                <p className="text-xs text-red-600 font-bold uppercase tracking-widest">{user.role}</p>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {user.role === 'customer' && <NavLink href="/cart" icon={ShoppingCart}>My Cart</NavLink>}
                                {user.role !== 'admin' && <NavLink href="/messages" icon={MessageSquare}>Messages</NavLink>}
                                {renderRoleLinks()}
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-3 w-full p-4 rounded-2xl bg-red-50 text-red-600 font-black text-sm uppercase tracking-widest mt-4"
                                >
                                    <LogOut size={20} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
