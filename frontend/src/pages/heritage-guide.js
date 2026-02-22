import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Scissors, Flower2, Waves, Wind, Sun, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function HeritageGuide() {
    const router = useRouter();
    return (
        <div className="min-h-screen bg-[#fdfbf7]">
            <Navbar />

            <main className="pb-32">
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

                {/* Hero section */}
                <section className="bg-gray-900 py-32 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <img
                            src="https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=2000"
                            className="w-full h-full object-cover"
                            alt="Textile background"
                        />
                    </div>
                    <div className="relative z-10 container mx-auto px-6">
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-500 font-black text-[10px] uppercase tracking-[0.5em] mb-6"
                        >
                            The Artisan Manual
                        </motion.p>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter"
                        >
                            The Anatomy of <br />
                            <span className="text-red-600">Pure Craftsmanship</span>
                        </motion.h1>
                    </div>
                </section>

                {/* Steps Section */}
                <section className="container mx-auto px-6 max-w-6xl mt-32">
                    <div className="grid grid-cols-1 gap-40">

                        <StepSection
                            number="01"
                            title="Harvesting the Soul"
                            subtitle="FIBER EXTRACTION"
                            description="Every masterpiece begins in the fields. Our artisans use Piña (pineapple fiber) or Jusi (silk-based fabric). The pineapple leaves are hand-scraped to extract the fine 'Liniwan' fibers—the highest grade of silk-like thread known for its translucent luster."
                            icon={<Sun size={40} className="text-amber-500" />}
                            image="https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=800"
                        />

                        <StepSection
                            number="02"
                            title="The Calado Blueprint"
                            subtitle="HAND EMBROIDERY"
                            description="This is where the magic happens. Using the 'Calado' technique, artisans painstakingly pull out threads from the fabric to create intricate lattices, then embroider back into the empty spaces. A single chest piece can take 2 to 4 weeks of continuous hand-stitching."
                            icon={<Flower2 size={40} className="text-red-600" />}
                            image="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800"
                            reversed
                        />

                        <StepSection
                            number="03"
                            title="The Master's Cut"
                            subtitle="TAILORING & ASSEMBLY"
                            description="Unlike mass-produced garments, a heritage Barong is cut following the unique flow of the embroidery. Our master tailors ensure that the patterns align perfectly across the seams, preserving the visual integrity of the artisan's vision."
                            icon={<Scissors size={40} className="text-gray-900" />}
                            image="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800"
                        />

                    </div>
                </section>

                {/* Care HUD */}
                <section className="mt-40 bg-white border-y border-gray-100 py-32">
                    <div className="container mx-auto px-6 text-center mb-20">
                        <h2 className="text-4xl font-black text-gray-900 italic uppercase tracking-tighter mb-4">Preserving the Legacy</h2>
                        <p className="text-gray-400 font-medium italic">How to care for your commissioned masterpiece.</p>
                    </div>
                    <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
                        <CareCard
                            icon={<Waves className="text-blue-500" />}
                            title="Cold Rinse Only"
                            desc="Hand wash with mild soap in cold water. Never machine wash or dry clean heritage fibers."
                        />
                        <CareCard
                            icon={<Wind className="text-cyan-500" />}
                            title="Air Dry"
                            desc="Lay flat on a clean towel in a shaded area. Direct sunlight can weaken the delicate fibers."
                        />
                        <CareCard
                            icon={<ShieldCheck className="text-green-600" />}
                            title="Store Hanging"
                            desc="Use padded hangers to maintain shoulder structure. Store in a breathable cotton garment bag."
                        />
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

function StepSection({ number, title, subtitle, description, icon, image, reversed }) {
    return (
        <div className={`flex flex-col ${reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-20`}>
            <div className="lg:w-1/2">
                <div className="flex items-center gap-4 mb-4">
                    <span className="text-6xl font-black text-gray-100 leading-none">{number}</span>
                    <div className="h-px w-20 bg-gray-100" />
                </div>
                <p className="text-red-600 font-black text-[10px] uppercase tracking-widest mb-2">{subtitle}</p>
                <h3 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter mb-8 leading-tight">{title}</h3>
                <div className="flex gap-6 items-start">
                    <div className="shrink-0 mt-1">{icon}</div>
                    <p className="text-lg text-gray-500 font-medium leading-relaxed italic">{description}</p>
                </div>
            </div>
            <div className="lg:w-1/2 w-full">
                <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000">
                    <img src={image} className="w-full h-full object-cover" alt={title} />
                </div>
            </div>
        </div>
    );
}

function CareCard({ icon, title, desc }) {
    return (
        <div className="bg-gray-50/50 p-10 rounded-[3rem] border border-gray-100 text-center hover:border-red-600 transition-colors group">
            <div className="mb-6 flex justify-center group-hover:scale-110 transition-transform">{icon}</div>
            <h4 className="text-xl font-black text-gray-900 uppercase italic tracking-tight mb-4">{title}</h4>
            <p className="text-sm text-gray-400 font-medium leading-relaxed italic">{desc}</p>
        </div>
    );
}
