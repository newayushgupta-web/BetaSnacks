import { Link } from 'react-router-dom';
import { Heart, Plus, Star, Flame, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatPrice } from '../../utils/formatters';
import ImageWithFallback from './ImageWithFallback';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(product._id);

  const displayImage =
    product.thumbnail ||
    product.images?.[0] ||
    product.image ||
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const ratingVal =
    typeof product.rating === 'number'
      ? product.rating
      : product.rating?.average || 4.8;

  const reviewCount =
    product.reviewCount || product.rating?.count || 120;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-3xl border border-charcoal-200/70 hover:border-brand-300 hover:shadow-card transition-all duration-300 overflow-hidden flex flex-col justify-between group"
    >
      <Link to={`/product/${product._id}`} className="block">
        {/* Photo Container */}
        <div className="relative overflow-hidden aspect-[4/3] bg-cream-100">
          <ImageWithFallback
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.isBestseller && (
              <span className="inline-flex items-center gap-1 bg-charcoal-900/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                <Flame className="w-3 h-3 text-brand-400 fill-brand-400" />
                <span>Bestseller</span>
              </span>
            )}
            {product.isSpecial && (
              <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                <Sparkles className="w-3 h-3" />
                <span>Chef's Special</span>
              </span>
            )}
          </div>

          {/* Discount Pill */}
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="absolute top-3 right-3 z-10">
              <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </span>
            </div>
          )}

          {/* Floating Wishlist Button */}
          <button
            type="button"
            onClick={handleWishlist}
            className={`absolute bottom-3 right-3 p-2 rounded-full backdrop-blur-md shadow-xs transition-all duration-200 z-10 ${
              inWishlist
                ? 'bg-rose-50 text-rose-500'
                : 'bg-white/90 text-charcoal-400 hover:text-rose-500 hover:bg-white'
            }`}
            title={inWishlist ? 'Remove from wishlist' : 'Save dish'}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex flex-col flex-1">
          {/* Top Row: FSSAI Diet Indicator + Category & Rating */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              {/* Professional FSSAI Green/Red Dot Square */}
              <div
                className={`w-4 h-4 rounded-xs border-2 flex items-center justify-center p-0.5 ${
                  product.isVeg ? 'border-emerald-600' : 'border-rose-600'
                }`}
                title={product.isVeg ? 'Pure Vegetarian' : 'Non-Vegetarian'}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    product.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                />
              </div>

              <span className="text-[11px] font-semibold text-charcoal-500 line-clamp-1">
                {product.category?.name || product.category || 'Gourmet Dish'}
              </span>
            </div>

            {/* Rating Stars */}
            <div className="flex items-center gap-1 bg-cream-50 px-2 py-0.5 rounded-md border border-charcoal-200/60">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              <span className="text-[11px] font-bold text-charcoal-800">
                {ratingVal.toFixed(1)}
              </span>
              <span className="text-[10px] text-charcoal-400">({reviewCount})</span>
            </div>
          </div>

          {/* Dish Name: Clean modern bold sans-serif typography */}
          <h3 className="font-sans font-extrabold text-charcoal-900 text-sm sm:text-base leading-snug group-hover:text-brand-600 transition-colors line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-charcoal-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>
      </Link>

      {/* Footer: Price & Add Button */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 flex items-center justify-between border-t border-charcoal-100/70 mt-auto pt-3">
        <div className="flex items-baseline gap-1.5">
          <span className="font-bold text-charcoal-900 text-lg">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-charcoal-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-500 text-brand-600 hover:text-white border border-brand-300 hover:border-brand-500 font-bold text-xs uppercase tracking-wider transition-all duration-200 transform active:scale-95 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>ADD</span>
        </button>
      </div>
    </motion.div>
  );
}
