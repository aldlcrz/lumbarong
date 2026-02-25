import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

export default function ProfileRouter() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else {
                // Redirect based on role
                if (user.role === 'admin') {
                    router.push('/admin/dashboard');
                } else if (user.role === 'seller') {
                    router.push('/seller/dashboard');
                } else {
                    // Customers can see their "view" of their profile at /shop/id
                    // but for now, the most relevant page is home or orders
                    router.push('/orders');
                }
            }
        }
    }, [user, loading, router]);

    return (
        <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
        </div>
    );
}
