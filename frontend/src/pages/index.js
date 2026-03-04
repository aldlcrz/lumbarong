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
  const [activeCategory, setActiveCategory] = useState({ id: 'All', name: 'All' });
  const [categories, setCategories] = useState([{ id: 'All', name: 'All' }]);
  const [showFilters, setShowFilters] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { search } = router.query;


  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories([{ id: 'All', name: 'All' }, ...res.data]);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      let params = new URLSearchParams();
      if (activeCategory.id !== 'All') {
        params.append('categoryId', activeCategory.id);
      }
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

      <main className="container mx-auto px-4 md:px-8 py-4 md:py-6">
        <section className="mb-6 relative overflow-hidden bg-gray-900 rounded-[1.5rem] p-4 md:p-6 text-white text-center">
          <div className="absolute inset-0 opacity-10 barong-pattern"></div>
          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl md:text-2xl font-black mb-2 tracking-tighter"
            >
              Latest <span className="text-red-600 italic">Masterpieces</span>
            </motion.h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto mb-6 font-medium">
              Selection of heritage-grade crafts, exclusively for the community.
            </p>

            <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 mb-4">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-[9px] md:text-[10px] uppercase tracking-[0.15em] transition-all border ${activeCategory.id === cat.id ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-transparent border-white/20 text-white/60 hover:text-white hover:border-white/40'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-red-600 font-bold text-[9px] uppercase tracking-[0.25em] mb-1">
                {search ? `RESULTS FOR "${search.toUpperCase()}"` : 'Artisan Collection'}
              </p>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                {search ? `Found ${products.length} Pieces` : (activeCategory.id === 'All' ? 'Curated For You' : activeCategory.name)}
              </h3>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading Collection...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
                  setActiveCategory({ id: 'All', name: 'All' });
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
        <div className="container mx-auto px-6 md:px-12 h-16 flex justify-between items-center">
          <span className="text-2xl font-black italic tracking-tighter text-red-600">LumBarong</span>
          <div className="flex items-center gap-8">
            <Link href="/login" className="text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-red-600 transition-colors hidden sm:block">Sign In</Link>
            <Link href="/register">
              <button className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-200">
                Create Account
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[50vh] flex items-center overflow-hidden pt-20 pb-8">
          <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-3 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-[9px] font-bold uppercase tracking-widest mb-6">
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
                </span>
                Supporting Local Luzon Artisans
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-[0.95] tracking-tighter mb-4">
                Wear the <br />
                <span className="text-red-600 italic">Spirit</span> of the <br />
                Philippines.
              </h1>
              <p className="text-lg text-gray-500 max-w-lg mb-10 font-medium leading-relaxed">
                LumBarong connects you directly with master embroiderers of Lumban. Authentic, high-quality traditional wear delivered to your doorstep.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/register">
                  <button className="bg-red-600 text-white h-12 px-8 rounded-xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-xl shadow-red-200">
                    Start Collection
                    <ArrowRight size={18} />
                  </button>
                </Link>
                <Link href="/login">
                  <button className="h-12 px-8 rounded-xl border-2 border-gray-100 font-bold text-sm text-gray-900 flex items-center justify-center hover:bg-gray-50 transition-all">
                    Browse
                  </button>
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-8 opacity-40">
                <div>
                  <p className="text-xl font-black text-gray-900">{stats.productCount}+</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest">Designs</p>
                </div>
                <div className="h-6 w-px bg-gray-200"></div>
                <div>
                  <p className="text-xl font-black text-gray-900">{stats.artisanCount}+</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest">Artisans</p>
                </div>
                <div className="h-6 w-px bg-gray-200"></div>
                <div className="flex items-center gap-1">
                  <Star size={12} className="fill-red-600 text-red-600" />
                  <p className="text-xl font-black text-gray-900">{stats.averageRating}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest ml-1">Rating</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              className="relative lg:block hidden"
            >
              <div className="aspect-[3/4] rounded-[3rem] bg-gray-200 overflow-hidden shadow-2xl rotate-3 scale-90 border-[12px] border-white z-20 relative">
                <img
                  src="https://thumbs.dreamstime.com/b/formal-shirt-national-dress-barong-tagalog-philippines-96812514.jpg?w=992"
                  className="w-full h-full object-cover"
                  alt="Traditional Barong"
                />
                <div className="absolute bottom-6 left-6 bg-white/30 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5">Featured Artisan</p>
                  <p className="text-xl font-black">Heritage Designs</p>
                </div>
              </div>
              {/* Decorative Floating Elements */}
              <div className="absolute top-1/2 -left-12 -translate-y-1/2 w-48 h-64 bg-red-600 rounded-[3rem] -z-10 shadow-2xl shadow-red-200"></div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-amber-400 rounded-full blur-[100px] opacity-20"></div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}

      </main>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="group">
      <div className="mb-6 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-black mb-3 tracking-tight">{title}</h3>
      <p className="text-gray-400 text-sm font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

