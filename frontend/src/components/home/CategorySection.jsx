import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { productService } from '../../services/productService';
import { motion } from 'framer-motion';

export default function CategorySection() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    productService
      .getCategories()
      .then((res) => {
        if (res && res.categories) setCategories(res.categories);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-12 bg-white border-b border-charcoal-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-brand-500 font-bold text-xs tracking-wider uppercase">
              Browse Categories
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-charcoal-900 mt-1">
              What&apos;s on your mind?
            </h2>
          </div>
          <button
            onClick={() => navigate('/menu')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
          >
            <span>Explore Full Menu</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Clean Horizontal / Grid Circular Food Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-5 gap-5 sm:gap-6">
          {categories.map((cat, idx) => (
            <motion.button
              key={cat._id || cat.slug || idx}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={() => navigate(`/menu?category=${cat.slug || cat._id}`)}
              className="group flex flex-col items-center text-center focus:outline-none"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-cream-100 mb-2.5 shadow-card group-hover:shadow-card-hover ring-2 ring-transparent group-hover:ring-brand-500 transition-all duration-300">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              <span className="text-xs font-bold text-charcoal-800 group-hover:text-brand-600 line-clamp-2 leading-tight px-1">
                {cat.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
