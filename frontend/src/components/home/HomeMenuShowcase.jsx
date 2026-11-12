import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, UtensilsCrossed } from 'lucide-react';
import { productService } from '../../services/productService';
import ProductCard from '../common/ProductCard';

export default function HomeMenuShowcase() {
  const [categories, setCategories] = useState([]);
  const [activeSlug, setActiveSlug] = useState('chaat-snacks');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    productService
      .getCategories()
      .then((res) => {
        if (res && res.categories && res.categories.length > 0) {
          setCategories(res.categories);
          setActiveSlug(res.categories[0].slug);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeSlug) return;
    setLoading(true);
    productService
      .getProducts({ category: activeSlug, limit: 8 })
      .then((res) => {
        if (res && res.products) {
          setProducts(res.products);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeSlug]);

  const activeCategory = categories.find((c) => c.slug === activeSlug);

  return (
    <section className="py-14 bg-white border-t border-charcoal-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-brand-600 font-bold text-xs tracking-wider uppercase mb-1">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Curated by Category</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-charcoal-900">
              Browse Kitchen Specials
            </h2>
          </div>

          <button
            onClick={() => navigate(`/menu?category=${activeSlug}`)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
          >
            <span>View All in {activeCategory?.name || 'Category'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none border-b border-charcoal-100">
          {categories.map((cat) => {
            const isActive = cat.slug === activeSlug;
            return (
              <button
                key={cat._id || cat.slug}
                onClick={() => setActiveSlug(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-charcoal-900 text-white shadow-sm'
                    : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Dishes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-cream-100 rounded-3xl h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

