import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import {
    User,
    MapPin,
    Phone,
    Mail,
    Plus,
    Trash2,
    Edit2,
    CheckCircle2,
    ChevronRight,
    Settings,
    Home,
    Briefcase,
    Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('account'); // 'account', 'addresses'
    const [profileData, setProfileData] = useState({ name: '', phone: '' });
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressForm, setAddressForm] = useState({
        fullName: '',
        phoneNumber: '',
        street: '',
        barangay: '',
        city: '',
        province: '',
        postalCode: '',
        label: 'Home',
        isDefault: false
    });

    useEffect(() => {
        if (user) {
            setProfileData({ name: user.name || '', phone: user.phone || '' });
            fetchAddresses();
        }
    }, [user]);

    const fetchAddresses = async () => {
        try {
            const res = await api.get('/users/addresses');
            setAddresses(res.data);
        } catch (err) {
            console.error('Error fetching addresses:', err);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/users/profile', profileData);
            alert('Profile updated successfully');
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingAddress) {
                await api.put(`/users/addresses/${editingAddress.id}`, addressForm);
            } else {
                await api.post('/users/addresses', addressForm);
            }
            setShowAddressModal(false);
            setEditingAddress(null);
            setAddressForm({
                fullName: '',
                phoneNumber: '',
                street: '',
                barangay: '',
                city: '',
                province: '',
                postalCode: '',
                label: 'Home',
                isDefault: false
            });
            fetchAddresses();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving address');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            await api.delete(`/users/addresses/${id}`);
            fetchAddresses();
        } catch (err) {
            alert('Error deleting address');
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await api.patch(`/users/addresses/${id}/default`);
            fetchAddresses();
        } catch (err) {
            alert('Error setting default address');
        }
    };

    if (authLoading) return null;

    return (
        <div className="bg-[#fdfbf7] min-h-screen font-['Inter']">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 py-10 lg:py-16">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar */}
                    <aside className="lg:w-1/4 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm border-b-4 border-b-red-600/10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center text-white text-2xl font-black italic italic uppercase italic">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <h2 className="font-black text-gray-900 leading-tight uppercase tracking-tight">{user?.name}</h2>
                                    <p className="text-xs font-bold text-red-600/60 italic uppercase tracking-widest">{user?.role}</p>
                                </div>
                            </div>

                            <nav className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('account')}
                                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeTab === 'account' ? 'bg-gray-900 text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50 hover:text-red-600'}`}
                                >
                                    <Settings size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Account Info</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('addresses')}
                                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeTab === 'addresses' ? 'bg-gray-900 text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50 hover:text-red-600'}`}
                                >
                                    <MapPin size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Address Book</span>
                                </button>
                                <button className="w-full flex items-center gap-3 p-4 rounded-2xl text-gray-400 hover:bg-gray-50 hover:text-red-600 transition-all opacity-50 cursor-not-allowed">
                                    <Shield size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Security</span>
                                </button>
                            </nav>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="lg:flex-1">
                        <AnimatePresence mode="wait">
                            {activeTab === 'account' ? (
                                <motion.div
                                    key="account"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-white rounded-[3rem] p-8 lg:p-12 border border-gray-100 shadow-sm"
                                >
                                    <div className="mb-8">
                                        <h1 className="text-2xl font-black text-gray-900 tracking-tighter italic uppercase underline decoration-red-600/20 underline-offset-8">Account Settings</h1>
                                        <p className="mt-4 text-gray-500 font-medium italic">Manage your personal information and contact details.</p>
                                    </div>

                                    <form onSubmit={handleUpdateProfile} className="space-y-8 max-w-2xl">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <User size={12} className="text-red-600" /> Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profileData.name}
                                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-red-600/20 transition-all"
                                                    placeholder="Enter your full name"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Mail size={12} className="text-red-600" /> Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    value={user?.email}
                                                    disabled
                                                    className="w-full bg-gray-100/50 border-none rounded-2xl px-6 py-4 font-bold text-gray-400 cursor-not-allowed"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Phone size={12} className="text-red-600" /> Phone Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profileData.phone}
                                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-red-600/20 transition-all"
                                                    placeholder="+63 9XX XXX XXXX"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-gray-900 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all shadow-xl shadow-gray-200"
                                        >
                                            {loading ? 'Saving Changes...' : 'Save Settings'}
                                        </button>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="addresses"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-white rounded-[3rem] p-8 lg:p-12 border border-gray-100 shadow-sm"
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                        <div>
                                            <h1 className="text-2xl font-black text-gray-900 tracking-tighter italic uppercase underline decoration-red-600/20 underline-offset-8">Address Book</h1>
                                            <p className="mt-4 text-gray-500 font-medium italic">Manage your delivery locations for faster checkout.</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setEditingAddress(null);
                                                setAddressForm({
                                                    fullName: '', phoneNumber: '', street: '', barangay: '',
                                                    city: '', province: '', postalCode: '', label: 'Home', isDefault: false
                                                });
                                                setShowAddressModal(true);
                                            }}
                                            className="flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all shadow-lg"
                                        >
                                            <Plus size={16} /> New Address
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {addresses.map(addr => (
                                            <div key={addr.id} className={`group relative p-6 rounded-[2.5rem] border transition-all ${addr.isDefault ? 'border-red-100 bg-red-50/20 shadow-lg' : 'border-gray-100 hover:border-gray-200'}`}>
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-xl ${addr.isDefault ? 'bg-red-600 text-white' : 'bg-gray-50 text-gray-400'}`}>
                                                            {addr.label === 'Home' ? <Home size={16} /> : <Briefcase size={16} />}
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{addr.label}</span>
                                                    </div>
                                                    {addr.isDefault && (
                                                        <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                                                            <CheckCircle2 size={10} /> Default
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="text-lg font-black text-gray-900 mb-2 truncate italic">{addr.fullName}</h3>
                                                <p className="text-xs font-bold text-gray-400 mb-4">{addr.phoneNumber}</p>
                                                <div className="space-y-1 text-xs font-medium text-gray-500 italic max-w-[80%]">
                                                    <p>{addr.street}, {addr.barangay}</p>
                                                    <p>{addr.city}, {addr.province}, {addr.postalCode}</p>
                                                </div>

                                                <div className="mt-8 flex items-center gap-3 pt-6 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!addr.isDefault && (
                                                        <button
                                                            onClick={() => handleSetDefault(addr.id)}
                                                            className="text-[9px] font-black uppercase tracking-widest text-red-600 hover:underline"
                                                        >
                                                            Set Default
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            setEditingAddress(addr);
                                                            setAddressForm(addr);
                                                            setShowAddressModal(true);
                                                        }}
                                                        className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAddress(addr.id)}
                                                        className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {addresses.length === 0 && (
                                            <div className="md:col-span-2 py-20 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                                                <MapPin size={48} className="mx-auto text-gray-200 mb-4" />
                                                <p className="text-gray-400 font-bold italic">No addresses saved yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Address Modal */}
            <AnimatePresence>
                {showAddressModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setShowAddressModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[3.5rem] w-full max-w-2xl overflow-hidden relative shadow-2xl z-10"
                        >
                            <div className="p-10 lg:p-12">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase mb-8">
                                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                                </h2>

                                <form onSubmit={handleSaveAddress} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Receiver Name</label>
                                            <input
                                                required
                                                type="text"
                                                value={addressForm.fullName}
                                                onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-red-600/20"
                                                placeholder="Recipient full name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Phone Number</label>
                                            <input
                                                required
                                                type="text"
                                                value={addressForm.phoneNumber}
                                                onChange={(e) => setAddressForm({ ...addressForm, phoneNumber: e.target.value })}
                                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-red-600/20"
                                                placeholder="+63"
                                            />
                                        </div>
                                        <div className="sm:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Street Address</label>
                                            <input
                                                required
                                                type="text"
                                                value={addressForm.street}
                                                onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-red-600/20"
                                                placeholder="House No., Street Name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Barangay</label>
                                            <input
                                                required
                                                type="text"
                                                value={addressForm.barangay}
                                                onChange={(e) => setAddressForm({ ...addressForm, barangay: e.target.value })}
                                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-red-600/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">City/Municipality</label>
                                            <input
                                                required
                                                type="text"
                                                value={addressForm.city}
                                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-red-600/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Province</label>
                                            <input
                                                required
                                                type="text"
                                                value={addressForm.province}
                                                onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-red-600/20"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Postal Code</label>
                                            <input
                                                required
                                                type="text"
                                                value={addressForm.postalCode}
                                                onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-gray-900 focus:ring-2 focus:ring-red-600/20"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50 mt-4">
                                        <div className="flex gap-2">
                                            {['Home', 'Office'].map(l => (
                                                <button
                                                    key={l}
                                                    type="button"
                                                    onClick={() => setAddressForm({ ...addressForm, label: l })}
                                                    className={`px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${addressForm.label === l ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                                >
                                                    {l}
                                                </button>
                                            ))}
                                        </div>
                                        <label className="flex items-center gap-3 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={addressForm.isDefault}
                                                onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                                className="w-5 h-5 rounded-lg border-gray-200 text-red-600 focus:ring-red-600/20"
                                            />
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Set as default address</span>
                                        </label>
                                    </div>

                                    <div className="flex gap-4 pt-8">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 bg-gray-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all shadow-xl shadow-gray-100"
                                        >
                                            {loading ? 'Saving...' : 'Save Address'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowAddressModal(false)}
                                            className="px-8 bg-gray-50 text-gray-400 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
}
