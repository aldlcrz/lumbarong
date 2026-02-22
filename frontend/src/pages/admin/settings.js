import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import {
    LayoutDashboard,
    Users,
    Store,
    Settings,
    Shield,
    BellRing,
    Key,
    Save,
    ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function SystemSettings() {
    const { user, loading: authLoading } = useAuth();
    const [saving, setSaving] = useState(false);
    const [twoFactor, setTwoFactor] = useState(true);
    const [notifications, setNotifications] = useState({
        newArtisan: true,
        largeOrder: true,
        dailySummary: true,
    });

    const handleSave = (message) => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            alert(message || "Settings successfully updated!");
        }, 800);
    };

    const handleToggle = () => {
        setTwoFactor(!twoFactor);
        handleSave(`Two-Factor Authentication ${!twoFactor ? 'enabled' : 'disabled'}`);
    }

    const handleNotificationChange = (e) => {
        const { name, checked } = e.target;
        setNotifications(prev => ({ ...prev, [name]: checked }));
    }

    if (authLoading || !user) return null;

    return (
        <div className="min-h-screen bg-[#fdfbf7]">
            <Navbar />
            <div className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-4">
                <Link href="/admin/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-gray-100 hover:bg-red-50 hover:border-red-100 text-gray-600 hover:text-red-600 font-bold text-sm transition-all">
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </Link>
            </div>
            <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-8 p-6 lg:p-12">

                {/* LEFT SIDEBAR: Navigation Ledger */}
                <aside className="lg:w-1/5 shrink-0">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm sticky top-32">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-8">Main Menu</p>
                        <nav className="space-y-2">
                            <SidebarLink href="/admin/dashboard" icon={LayoutDashboard}>Dashboard</SidebarLink>
                            <SidebarLink href="/admin/sellers" icon={Users}>Manage Sellers</SidebarLink>
                            <SidebarLink href="/admin/products" icon={Store}>Manage Products</SidebarLink>
                            <SidebarLink href="/admin/settings" icon={Settings} active>System Settings</SidebarLink>
                        </nav>

                        <div className="mt-12 pt-12 border-t border-gray-50">
                            <div className="flex items-center gap-3 bg-red-50 p-4 rounded-3xl border border-red-100/50">
                                <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white font-black text-sm">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-black text-gray-900 truncate">Admin Access</p>
                                    <p className="text-[10px] font-bold text-red-600/60 truncate">{user.name}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* MAIN AREA */}
                <main className="lg:flex-1 min-w-0">
                    <header className="mb-10">
                        <p className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] mb-3">Global Configuration</p>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase">System Settings</h1>
                        <p className="text-gray-500 font-medium italic mt-2">Manage global rules, administration, and platform security.</p>
                    </header>

                    <div className="space-y-8">
                        {/* Security Section */}
                        <section className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-[1.5rem] bg-gray-50 flex items-center justify-center text-red-600">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight italic">Platform Security</h2>
                                    <p className="text-sm text-gray-400 font-medium mt-1">Configure access rules and administrative protocols.</p>
                                </div>
                            </div>

                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Admin Email</label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                        <input
                                            type="email"
                                            defaultValue={user.email}
                                            disabled
                                            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-gray-200 text-gray-500 font-bold text-sm cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-6 rounded-2xl border border-gray-100">
                                    <div>
                                        <p className="text-sm font-black text-gray-900">Two-Factor Authentication</p>
                                        <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-widest">Require 2FA for all admin logins</p>
                                    </div>
                                    <div 
                                        onClick={handleToggle}
                                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${twoFactor ? 'bg-red-600' : 'bg-gray-200'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${twoFactor ? 'right-1' : 'left-1'}`} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Preferences Section */}
                        <section className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-[1.5rem] bg-gray-50 flex items-center justify-center text-red-600">
                                    <BellRing size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight italic">Global Notifications</h2>
                                    <p className="text-sm text-gray-400 font-medium mt-1">Configure automated system alerts.</p>
                                </div>
                            </div>

                            <div className="space-y-4 max-w-2xl">
                                {[
                                    { name: 'newArtisan', label: 'New Artisan Registrations', desc: 'Alert when a new artisan requests verification' },
                                    { name: 'largeOrder', label: 'Large Order Anomalies', desc: 'Flag orders exceeding ₱50,000 for manual review' },
                                    { name: 'dailySummary', label: 'Daily Registration Summary', desc: 'Email a recap of new users every 24 hours' }
                                ].map((alert, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-6 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                                        <div>
                                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{alert.label}</p>
                                            <p className="text-[10px] text-gray-400 font-medium mt-1">{alert.desc}</p>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            name={alert.name}
                                            checked={notifications[alert.name]}
                                            onChange={handleNotificationChange}
                                            className="w-5 h-5 accent-red-600 rounded cursor-pointer" 
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={() => handleSave('Configuration saved')}
                                disabled={saving}
                                className="flex items-center gap-2 px-8 py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
                            >
                                <Save size={16} />
                                {saving ? 'Applying...' : 'Save Configuration'}
                            </button>
                        </div>
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
