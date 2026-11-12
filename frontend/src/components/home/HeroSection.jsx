import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Clock, Star, ShieldCheck, Flame, UtensilsCrossed } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HERO_SNACKS = [
  {
    title: 'Artisanal Margherita Supreme',
    subtitle: 'Stone-baked Neapolitan crust, San Marzano tomato sauce & fresh bocconcini mozzarella',
    price: '₹299',
    tag: 'Wood-Fired Classic',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=900&auto=format&fit=crop&q=80',
    link: '/menu?category=pizza',
  },
  {
    title: 'Royal Kesar Rabdi Jalebi Platter',
    subtitle: 'Golden crisp spirals soaked in saffron syrup, served with slow-simmered pistachio rabdi',
    price: '₹199',
    tag: 'Royal Special',
    image: '/images/kesar-rabdi-jalebi.jpg',
    link: '/menu?category=desserts',
  },
  {
    title: 'Punjabi Crispy Aloo Samosa (2 Pcs)',
    subtitle: 'Flaky golden pastry filled with aromatic spiced potatoes, roasted cashews & green chutney',
    price: '₹69',
    tag: 'Street Favorite',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=900&auto=format&fit=crop&q=80',
    link: '/menu?category=chaat-snacks',
  },
  {
    title: 'Soft Steamed Idli & Masala Dosa',
    subtitle: 'Authentic South Indian fermented rice-lentil crepes with fresh coconut chutney & sambar',
    price: '₹129',
    tag: 'South Indian',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=900&auto=format&fit=crop&q=80',
    link: '/menu?category=south-indian',
  },
  {
    title: 'Royal Dum Hyderabadi Chicken Biryani',
    subtitle: 'Slow-cooked aromatic basmati rice infused with whole spices, saffron & tender chicken',
    price: '₹369',
    tag: 'Dum Special',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=900&auto=format&fit=crop&q=80',
    link: '/menu?category=biryani',
  },
];

const CRAVING_CHIPS = [
  { label: 'Samosa & Chaat', link: '/menu?category=chaat-snacks' },
  { label: 'Idli & Masala Dosa', link: '/menu?category=south-indian' },
  { label: 'Desi Ghee Jalebi', link: '/menu?category=desserts' },
  { label: 'Bread Rolls', link: '/menu?search=bread%20roll' },
  { label: 'Stone-Baked Pizza', link: '/menu?category=pizza' },
  { label: 'Hakka Noodles', link: '/menu?category=pasta' },
  { label: 'Dum Biryani', link: '/menu?category=biryani' },
];

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SNACKS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const currentSnack = HERO_SNACKS[activeSlide];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#FFFBF7] via-[#FFF5ED] to-[#FFEBD9] text-charcoal-900 pt-10 pb-14 sm:pt-14 sm:pb-18 lg:pt-16 lg:pb-20 border-b border-orange-100">
      {/* Soft Warm Radial Ambient Glows */}
      <div className="absolute -top-24 right-0 w-[550px] h-[550px] rounded-full bg-orange-400/12 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[420px] h-[420px] rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Settled Content with Crystal-Clear Contrast */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-6 text-left max-w-full"
          >
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <span className="text-[11px] font-bold text-brand-700 tracking-wider uppercase">
                Fresh Kitchen &bull; Express 25-Min Delivery
              </span>
            </div>

            {/* Main Catchy Headline (Sharp Dark Charcoal + Bright Orange) */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-charcoal-900 leading-[1.12] tracking-tight break-words">
              Crave-Worthy Snacks, <br />
              <span className="text-brand-500">Delivered Piping Hot.</span>
            </h1>

            <p className="text-charcoal-600 text-sm sm:text-base max-w-xl leading-relaxed font-normal">
              Order crispy Punjabi samosas, golden potato bread rolls, desi ghee jalebis,
              stone-baked pizzas, street noodles, and dum biryani — cooked fresh to order.
            </p>

            {/* Clean White Search Bar with Orange Button */}
            <form onSubmit={handleSearch} className="max-w-xl w-full">
              <div className="flex items-center bg-white p-1.5 rounded-2xl shadow-lg shadow-orange-950/5 border border-charcoal-200/80 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-all">
                <Search className="w-5 h-5 text-charcoal-400 ml-3.5 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search samosa, bread roll, jalebi, biryani, pizza..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm text-charcoal-900 placeholder-charcoal-400 bg-transparent focus:outline-none min-w-0 font-medium"
                />
                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm px-5 sm:px-6 py-2.5 rounded-xl transition-all flex-shrink-0 shadow-md active:scale-95"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Quick Craving Chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 w-full max-w-full">
              <span className="text-xs font-bold text-charcoal-500 whitespace-nowrap flex items-center gap-1 flex-shrink-0">
                <Flame className="w-3.5 h-3.5 text-brand-500 fill-brand-500" />
                <span>Trending:</span>
              </span>
              <div className="flex items-center gap-2 flex-nowrap sm:flex-wrap">
                {CRAVING_CHIPS.map((chip, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => navigate(chip.link)}
                    className="px-3.5 py-1.5 bg-white hover:bg-brand-50 hover:text-brand-600 border border-charcoal-200 hover:border-brand-300 rounded-full text-xs font-semibold text-charcoal-700 transition-all whitespace-nowrap shadow-xs"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                onClick={() => navigate('/menu')}
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-brand-500/25 transition-all active:scale-95"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Explore Full Menu</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/menu?filter=special')}
                className="inline-flex items-center gap-2 bg-white hover:bg-cream-100 text-charcoal-800 font-bold text-sm px-6 py-3.5 rounded-xl border border-charcoal-200 shadow-xs transition-all"
              >
                <span>Today&apos;s Deals</span>
              </button>
            </div>

            {/* Clean Trust Row (Sharp & High Contrast) */}
            <div className="grid grid-cols-3 gap-4 pt-5 border-t border-charcoal-200/60 max-w-lg">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200/60 flex items-center justify-center text-brand-600">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-charcoal-900 text-xs sm:text-sm">25 Mins</div>
                  <div className="text-[11px] text-charcoal-500">Fast Delivery</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <div className="font-extrabold text-charcoal-900 text-xs sm:text-sm">4.9 Rated</div>
                  <div className="text-[11px] text-charcoal-500">12k+ Reviews</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="font-extrabold text-charcoal-900 text-xs sm:text-sm">100% Fresh</div>
                  <div className="text-[11px] text-charcoal-500">Hygienic Kitchen</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Clean Food Showcase Card (Matching Screenshot) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-5 w-full max-w-full"
          >
            <div
              onClick={() => navigate(currentSnack.link)}
              className="relative rounded-3xl overflow-hidden shadow-2xl border border-charcoal-200/80 aspect-[4/3] sm:aspect-square bg-charcoal-900 group cursor-pointer"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentSnack.title}
                  src={currentSnack.image}
                  alt={currentSnack.title}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </AnimatePresence>

              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/90 via-charcoal-950/25 to-transparent" />

              {/* Top Indicators */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {HERO_SNACKS.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSlide(idx);
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        activeSlide === idx ? 'w-7 bg-brand-500' : 'w-2 bg-white/50'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
                <span className="px-3 py-1 rounded-full bg-charcoal-950/70 backdrop-blur-md text-[11px] font-bold text-amber-300 border border-white/10 shadow-sm">
                  Code: BETASNACKS20 (20% OFF)
                </span>
              </div>

              {/* Bottom Dish Caption */}
              <div className="absolute bottom-5 left-5 right-5 text-left">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-brand-500 text-[10px] font-bold uppercase tracking-wider text-white">
                    {currentSnack.tag}
                  </span>
                  <span className="text-lg font-extrabold text-white bg-charcoal-950/60 backdrop-blur-sm px-2.5 py-0.5 rounded-lg">
                    {currentSnack.price}
                  </span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                  {currentSnack.title}
                </h3>
                <p className="text-xs text-charcoal-200 mt-1 line-clamp-1">
                  {currentSnack.subtitle}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
