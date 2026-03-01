import { Share2, Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-6">
            <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                    <span className="flex flex-col items-center text-2xl font-black tracking-tighter text-red-600 mb-2 block text-center">&copy; {new Date().getFullYear()} LumBarong Philippines</span>
                    <p className="text-[10px] text-gray-400 font-medium italic text-center leading-relaxed max-w-[200px] mx-auto mb-20">
                        Support local artisans.
                    </p>
                </div>
                <div className="hidden md:block"></div>
                <div>
                    <h4 className="text-[8px] font-black text-gray-900 uppercase tracking-[0.25em] mb-3">Navigation</h4>
                    <ul className="space-y-1.5">
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
                    <h4 className="text-[8px] font-black text-gray-900 uppercase tracking-[0.25em] mb-3">Legacy Support</h4>
                    <ul className="space-y-1.5">
                        <li className="group cursor-pointer">
                            <span className="block text-sm font-bold text-gray-400 group-hover:text-red-600 transition-colors uppercase tracking-widest">Customer Care</span>
                            <span className="block text-[9px] text-gray-300 font-medium italic mt-1 leading-none">Dedicated support for your heritage commissions</span>
                        </li>
                        <li className="group cursor-pointer">
                            <span className="block text-sm font-bold text-gray-400 group-hover:text-red-600 transition-colors uppercase tracking-widest">Privacy Policy</span>
                            <span className="block text-[9px] text-gray-300 font-medium italic mt-1 leading-none">Secure management of your registry data</span>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}
