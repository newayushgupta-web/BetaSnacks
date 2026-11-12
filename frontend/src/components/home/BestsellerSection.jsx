import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, ArrowRight } from 'lucide-react';
import { productService } from '../../services/productService';
import ProductCard from '../common/ProductCard';

export default function BestsellerSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    productService
      .getBestsellers()
      .then((res) => {
        if (res && res.products) {
          setProducts(res.products.slice(0, 8));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-brand-600 font-bold text-xs tracking-wider uppercase mb-1">
              <Flame className="w-3.5 h-3.5 fill-brand-500 text-brand-500" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="font-display text-3xl font-extrabold text-charcoal-900 mt-1">
              Trending Dishes & Best Sellers
            </h2>
            <p className="text-charcoal-500 text-sm mt-1">
              The dishes our foodies keep ordering again and again.
            </p>
          </div>
          <button
            onClick={() => navigate('/menu?filter=bestseller')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors mt-3 sm:mt-0"
          >
            <span>See All Best Sellers</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-80 animate-pulse border border-charcoal-200/60" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-charcoal-200/60">
            <p className="text-charcoal-500 text-sm">Dishes are being prepped fresh on the grill.</p>
          </div>
        )}
      </div>
    </section>
  );
}
