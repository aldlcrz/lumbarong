import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import AdminLayout from '@/components/AdminLayout';
import {
    Users,
    ShieldCheck,
    Mail,
    Calendar,
    ChevronRight,
    Search,
    UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminUsers() {
    const { user, loading: authLoading } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchUsers();
        }
    }, [user]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.role === 'customer' && (
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    if (authLoading || !user) return null;

    return (
        <AdminLayout>
            <div className="flex flex-col gap-8">
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-100">
                                <Users size={20} />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Customer Directory</h1>
                        </div>
                        <p className="text-sm text-gray-400 font-bold italic">Manage and monitor all platform customers.</p>
                    </div>

                    <div className="relative w-full lg:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-gray-100 focus:border-red-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold shadow-sm transition-all outline-none"
                        />
                    </div>
                </header>

                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-50 bg-gray-50/30">
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Details</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    [...Array(5)].map((_, idx) => (
                                        <tr key={idx} className="animate-pulse">
                                            <td className="px-8 py-6"><div className="h-10 bg-gray-100 rounded-xl w-3/4"></div></td>
                                            <td className="px-8 py-6"><div className="h-6 bg-gray-100 rounded-lg w-20"></div></td>
                                            <td className="px-8 py-6"><div className="h-6 bg-gray-100 rounded-lg w-16"></div></td>
                                            <td className="px-8 py-6"><div className="h-6 bg-gray-100 rounded-lg w-24"></div></td>
                                            <td className="px-8 py-6"><div className="h-8 bg-gray-100 rounded-lg w-8 ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-red-600 group-hover:text-white transition-all shadow-inner overflow-hidden">
                                                        {u.profileImage ? (
                                                            <img src={u.profileImage} alt={u.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <UserCircle size={24} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{u.name}</p>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <Mail size={10} className="text-gray-300" />
                                                            <p className="text-[10px] font-bold text-gray-400 italic">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-gray-900 text-white' :
                                                    u.role === 'seller' ? 'bg-red-50 text-red-600' :
                                                        'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${u.isVerified || u.role === 'customer' || u.role === 'admin' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></span>
                                                    <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest italic">
                                                        {u.role === 'seller' ? (u.isVerified ? 'VERIFIED' : 'PENDING') : 'ACTIVE'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={12} className="text-gray-300" />
                                                    <span className="text-[11px] font-bold text-gray-400 italic">
                                                        {new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="p-3 bg-gray-50 rounded-xl text-gray-300 hover:bg-white hover:text-red-600 hover:shadow-lg transition-all transform hover:-translate-y-1">
                                                    <ChevronRight size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                                                    <Users size={32} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 uppercase tracking-tighter italic">User Quiet</p>
                                                    <p className="text-[11px] text-gray-400 font-bold mt-1">No matches found for "{searchQuery}"</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {filteredUsers.length > 0 && (
                        <div className="p-8 bg-gray-50/30 border-t border-gray-50 flex items-center justify-between">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                                Showing {filteredUsers.length} total platform users
                            </p>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-red-100 hover:text-red-600 transition-all cursor-not-allowed opacity-50">Prev</button>
                                <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-red-100 hover:text-red-600 transition-all cursor-not-allowed opacity-50">Next</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
