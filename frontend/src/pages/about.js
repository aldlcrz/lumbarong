import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Quote, Heart, Sparkles, MapPin, ArrowLeft } from 'lucide-react';

export default function AboutPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#fdfbf7]">
            <Navbar />

            <main>
                {/* Back Button */}
                <div className="container mx-auto px-6 pt-8">
                    <button
                        onClick={() => router.back()}
                        className="mb-4 flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-gray-100 hover:border-red-600 hover:bg-red-50 transition-all shadow-sm group"
                    >
                        <ArrowLeft size={18} className="text-gray-400 group-hover:text-red-600 transition-colors" />
                        <span className="text-sm font-black text-gray-600 group-hover:text-red-600 uppercase tracking-widest transition-colors">Back</span>
                    </button>
                </div>

                {/* Hero Section */}
                <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-gray-900">
                    <div className="absolute inset-0 opacity-40">
                        <img
                            src="https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
                            className="w-full h-full object-cover"
                            alt="Artisan Background"
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90" />

                    <div className="relative z-10 text-center px-6">
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 font-black text-xs uppercase tracking-[0.5em] mb-6"
                        >
                            Our Heritage Narrative
                        </motion.p>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-6xl md:text-8xl font-black text-white tracking-tighter italic uppercase underline decoration-red-600 decoration-8 underline-offset-[12px]"
                        >
                            The Spirit of Lumban
                        </motion.h1>
                    </div>
                </section>

                {/* The Genesis Section */}
                <section className="py-32 container mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="aspect-[4/5] rounded-[4rem] bg-gray-100 overflow-hidden shadow-2xl z-20 relative">
                                <img
                                    src="https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                    className="w-full h-full object-cover"
                                    alt="Artisan at work"
                                />
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-red-600 rounded-[3rem] -z-10 shadow-2xl shadow-red-200 opacity-20" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <Quote className="text-red-600 mb-8" size={64} strokeWidth={3} />
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight italic uppercase mb-8 leading-tight">
                                Born from a <span className="text-red-600">tapestry</span> <br />
                                of ancestral threads.
                            </h2>
                            <div className="space-y-6 text-lg text-gray-500 font-medium leading-relaxed italic">
                                <p>
                                    LumBarong was never just an e-commerce platform. It was a promise made in the quiet, sun-drenched workshops of Lumban, Laguna—the barong capital of the Philippines.
                                </p>
                                <p>
                                    Our story began when a group of heritage advocates recognized a disconnect between the master embroiderers who spend months hand-stiching a single piece of piña-silk and the modern world that craved authentic Filipino identity.
                                </p>
                                <p>
                                    We saw master artisans whose skills had been passed down through generations, yet their craft was being overshadowed by mass-produced imitations. We chose to build a digital bridge—a registry of excellence.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Values HUD */}
                <section className="py-32 bg-gray-900 text-white">
                    <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-16">
                        <ValueCard
                            icon={<Heart className="text-red-600" size={40} />}
                            title="Empowering Artisans"
                            desc="We connect independent shops directly to the registry, ensuring every commission fairly values the artisan's time and heritage."
                        />
                        <ValueCard
                            icon={<Sparkles className="text-amber-400" size={40} fill="currentColor" />}
                            title="Uncompromising Quality"
                            desc="Each Barong and Filipiniana is a masterwork, utilizing traditional hand embroidery techniques that define the Luzon spirit."
                        />
                        <ValueCard
                            icon={<MapPin className="text-red-500" size={40} />}
                            title="Heritage Preservation"
                            desc="A portion of every piece sold supports training programs for the next generation of embroiderers in Laguna."
                        />
                    </div>
                </section>

                {/* Legacy Section */}
                <section className="py-32 container mx-auto px-6 md:px-12 text-center">
                    <div className="max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-10">
                            The LumBarong Vision
                        </div>
                        <h3 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter italic uppercase mb-12">
                            To clothe the world in <br />
                            <span className="text-red-600">Filipino Pride.</span>
                        </h3>
                        <p className="text-xl text-gray-400 font-medium leading-relaxed italic mb-16">
                            Today, LumBarong stands as more than a marketplace. It is a community of patrons and artisans bound by a shared respect for the threads that weave our history together. When you wear a LumBarong piece, you are not just wearing clothing; you are carrying a story of resilience, craftsmanship, and the eternal beauty of the Philippines.
                        </p>
                    </div>

                    {/* Vision Image Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {[
                            "https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
                            "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
                            "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
                            "https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
                        ].map((url, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="aspect-square rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700"
                            >
                                <img src={url} className="w-full h-full object-cover" alt="Heritage Gallery" />
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

function ValueCard({ icon, title, desc }) {
    return (
        <div className="group text-center">
            <div className="mb-8 flex justify-center group-hover:scale-110 transition-transform">{icon}</div>
            <h3 className="text-2xl font-black mb-4 tracking-tight uppercase italic">{title}</h3>
            <p className="text-gray-500 font-medium leading-relaxed italic">{desc}</p>
        </div>
    );
}
