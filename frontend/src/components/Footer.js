import { Share2, Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-20">
            <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="md:col-span-2">
                    <span className="text-3xl font-black italic tracking-tighter text-red-600 mb-8 block">LumBarong</span>
                    <p className="text-gray-400 max-w-sm font-medium leading-relaxed">
                        The premiere marketplace for authentic Filipino heritage. Connecting world-class artisans to the global stage.
                    </p>
                </div>
                <div>
                    <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em] mb-8">Navigation</h4>
                    <ul className="space-y-6">
                        <li className="group cursor-pointer">
                            <Link href="/">
                                <span className="block text-sm font-bold text-gray-400 group-hover:text-red-600 transition-colors uppercase tracking-widest">Artisan Catalog</span>
                                <span className="block text-[9px] text-gray-300 font-medium italic mt-1 leading-none">Browse our collection of handcrafted masterpieces</span>
                            </Link>
                        </li>
                        <li className="group cursor-pointer">
                            <Link href="/heritage-guide">
                                <span className="block text-sm font-bold text-gray-400 group-hover:text-red-600 transition-colors uppercase tracking-widest">Heritage Guide</span>
                                <span className="block text-[9px] text-gray-300 font-medium italic mt-1 leading-none">Learn about the traditions behind every stitch</span>
                            </Link>
                        </li>
                        <li className="group cursor-pointer">
                            <Link href="/about">
                                <span className="block text-sm font-bold text-red-600 group-hover:text-red-700 transition-colors uppercase tracking-widest">Our Story</span>
                                <span className="block text-[9px] text-gray-300 font-medium italic mt-1 leading-none">Discover the journey of the Lumban artisans</span>
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em] mb-8">Legacy Support</h4>
                    <ul className="space-y-6">
                        <li className="group cursor-pointer">
                            <span className="block text-sm font-bold text-gray-400 group-hover:text-red-600 transition-colors uppercase tracking-widest">Customer Care</span>
                            <span className="block text-[9px] text-gray-300 font-medium italic mt-1 leading-none">Dedicated support for your heritage commissions</span>
                        </li>
                        <li className="group cursor-pointer">
                            <span className="block text-sm font-bold text-gray-400 group-hover:text-red-600 transition-colors uppercase tracking-widest">Privacy Policy</span>
                            <span className="block text-[9px] text-gray-300 font-medium italic mt-1 leading-none">Secure management of your registry data</span>
                        </li>
                        <li className="group cursor-pointer">
                            <span className="block text-sm font-bold text-gray-400 group-hover:text-red-600 transition-colors uppercase tracking-widest">Philippine Craft Council</span>
                            <span className="block text-[9px] text-gray-300 font-medium italic mt-1 leading-none">Supporting the national movement for textiles</span>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="container mx-auto px-6 md:px-12 mt-20 pt-10 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-6">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">&copy; {new Date().getFullYear()} LumBarong Philippines</p>
                <div className="flex gap-10">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest cursor-pointer hover:text-red-600">Facebook</span>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest cursor-pointer hover:text-red-600">Instagram</span>
                </div>
            </div>
        </footer>
    );
}
