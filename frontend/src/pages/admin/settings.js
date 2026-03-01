import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import AdminLayout from '@/components/AdminLayout';
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
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [saving, setSaving] = useState(false);
    const [twoFactor, setTwoFactor] = useState(true);
    const [notifications, setNotifications] = useState({
        newArtisan: true,
        largeOrder: true,
        dailySummary: true,
    });

    const notifSectionRef = useRef(null);

    useEffect(() => {
        if (router.query.tab === 'notifications' && notifSectionRef.current) {
            notifSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [router.query.tab, authLoading]);

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
        <AdminLayout>
            <div className="flex flex-col gap-8">
                <header className="mb-2">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">System Settings</h1>
                    <p className="text-sm text-gray-400 font-bold">Manage global rules, administration, and platform security.</p>
                </header>

                <div className="space-y-8 max-w-5xl">
                    {/* Security Section */}
                    <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-[1.2rem] bg-red-50 flex items-center justify-center text-red-600">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Platform Security</h2>
                                <p className="text-xs text-gray-400 font-bold mt-1">Configure access rules and administrative protocols.</p>
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
                                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 text-gray-500 font-bold text-sm cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-6 rounded-2xl border border-gray-100 bg-gray-50/30">
                                <div>
                                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Two-Factor Authentication</p>
                                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest leading-normal">Require 2FA for all admin logins</p>
                                </div>
                                <div
                                    onClick={handleToggle}
                                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${twoFactor ? 'bg-red-600 shadow-lg shadow-red-100' : 'bg-gray-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${twoFactor ? 'right-1' : 'left-1'}`} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Preferences Section */}
                    <section ref={notifSectionRef} className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
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
            </div>
        </AdminLayout>
    );
}
