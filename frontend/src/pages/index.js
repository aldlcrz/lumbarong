import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { ShoppingBag, ArrowRight, ShieldCheck, Star } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { search } = router.query;

  const categories = ['All', 'Barong Tagalog', 'Filipiniana Dresses', 'Accessories'];

  useEffect(() => {
    if (user) {
      setLoading(true);
      let params = new URLSearchParams();
      if (activeCategory !== 'All') params.append('category', activeCategory);
      if (search) params.append('search', search);

      api.get(`/products?${params.toString()}`)
        .then(res => {
          setProducts(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [activeCategory, user, search]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]"><div className="w-12 h-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div></div>;

  if (!user) {
    return <LandingView />;
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <Navbar />

      <main className="container mx-auto px-4 md:px-8 py-8 md:py-12">
        <section className="mb-16 relative overflow-hidden bg-gray-900 rounded-[3rem] p-8 md:p-16 text-white text-center">
          <div className="absolute inset-0 opacity-20 barong-pattern"></div>
          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-black mb-6 tracking-tighter"
            >
              Our Latest <span className="text-red-600 italic">Masterpieces</span>
            </motion.h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12 font-medium">
              Personalized selection of heritage-grade crafts, exclusively for the LumBarong community.
            </p>

            <div className="flex flex-wrap justify-center gap-1.5 md:gap-3 mb-8">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all border ${activeCategory === cat ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-600/30' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-red-600 font-black text-[10px] uppercase tracking-[0.3em] mb-3">
                {search ? `SEARCH RESULTS FOR "${search.toUpperCase()}"` : 'Artisan Collection'}
              </p>
              <h3 className="text-4xl font-black text-gray-900 tracking-tight">
                {search ? `Found ${products.length} Pieces` : (activeCategory === 'All' ? 'Curated For You' : activeCategory)}
              </h3>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading Collection...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="text-gray-200" size={32} />
              </div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No pieces found in this category.</p>
              <button
                onClick={() => {
                  setActiveCategory('All');
                  router.push('/', undefined, { shallow: true });
                }}
                className="mt-6 text-red-600 font-black text-xs underline decoration-2 underline-offset-4 uppercase tracking-widest"
              >
                Clear Filters & Search
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

function LandingView() {
  const [stats, setStats] = useState({ artisanCount: 0, productCount: 0, averageRating: '4.9' });

  useEffect(() => {
    api.get('/auth/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error('Failed to fetch stats', err));
  }, []);

  return (
    <div className="min-h-screen bg-[#fdfbf7] selection:bg-red-600 selection:text-white">
      {/* Transparent Guest Header */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-6 md:px-12 h-24 flex justify-between items-center">
          <span className="text-3xl font-black italic tracking-tighter text-red-600">LumBarong</span>
          <div className="flex items-center gap-8">
            <Link href="/login" className="text-sm font-black text-gray-500 uppercase tracking-widest hover:text-red-600 transition-colors hidden sm:block">Sign In</Link>
            <Link href="/register">
              <button className="bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200">
                Create Account
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
          <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-10">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                Supporting Local Luzon Artisans
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-gray-900 leading-[0.9] tracking-tighter mb-8">
                Wear the <br />
                <span className="text-red-600 italic">Spirit</span> of the <br />
                Philippines.
              </h1>
              <p className="text-xl text-gray-500 max-w-lg mb-12 font-medium leading-relaxed">
                LumBarong connects you directly with master embroiderers of Lumban. Authentic, high-quality traditional wear delivered to your doorstep.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <button className="bg-red-600 text-white h-20 px-12 rounded-[2rem] font-black text-lg flex items-center justify-center gap-4 hover:bg-red-700 transition-all shadow-2xl shadow-red-200">
                    Start Your Collection
                    <ArrowRight size={24} />
                  </button>
                </Link>
                <Link href="/login">
                  <button className="h-20 px-12 rounded-[2rem] border-2 border-gray-100 font-black text-lg text-gray-900 flex items-center justify-center hover:bg-gray-50 transition-all">
                    Browse Collection
                  </button>
                </Link>
              </div>

              <div className="mt-20 flex items-center gap-12 opacity-40">
                <div>
                  <p className="text-3xl font-black text-gray-900">{stats.productCount}+</p>
                  <p className="text-[10px] font-black uppercase tracking-widest">Designs</p>
                </div>
                <div className="h-10 w-px bg-gray-200"></div>
                <div>
                  <p className="text-3xl font-black text-gray-900">{stats.artisanCount}+</p>
                  <p className="text-[10px] font-black uppercase tracking-widest">Artisans</p>
                </div>
                <div className="h-10 w-px bg-gray-200"></div>
                <div className="flex items-center gap-1">
                  <Star size={16} className="fill-red-600 text-red-600" />
                  <p className="text-3xl font-black text-gray-900">{stats.averageRating}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest ml-1">Rating</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              className="relative lg:block hidden"
            >
              <div className="aspect-[3/4] rounded-[4rem] bg-gray-200 overflow-hidden shadow-2xl rotate-3 scale-95 border-[16px] border-white z-20 relative">
                <img
                  src="https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  className="w-full h-full object-cover"
                  alt="Traditional Barong"
                />
                <div className="absolute bottom-10 left-10 bg-white/30 backdrop-blur-md p-8 rounded-3xl border border-white/20 text-white">
                  <p className="text-xs font-black uppercase tracking-widest mb-1">Featured Artisan</p>
                  <p className="text-2xl font-black">Heritage Designs</p>
                </div>
              </div>
              {/* Decorative Floating Elements */}
              <div className="absolute top-1/2 -left-12 -translate-y-1/2 w-48 h-64 bg-red-600 rounded-[3rem] -z-10 shadow-2xl shadow-red-200"></div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-amber-400 rounded-full blur-[100px] opacity-20"></div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 bg-gray-900 text-white">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <FeatureCard icon={<ShieldCheck className="text-red-600" size={40} />} title="Verified Authenticity" desc="Every piece is hand-inspected to ensure traditional embroidery techniques of the highest standard." />
              <FeatureCard icon={<Star className="text-amber-400" size={40} fill="currentColor" />} title="Master Artisans" desc="Shop directly from sellers with decades of experience in Filipino heritage crafts." />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="group">
      <div className="mb-8 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-2xl font-black mb-4 tracking-tight">{title}</h3>
      <p className="text-gray-500 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

