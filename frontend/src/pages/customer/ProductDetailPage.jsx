import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Clock,
  Flame,
  Star,
  ShieldCheck,
  ArrowLeft,
  Plus,
  Minus,
  Check,
} from 'lucide-react';
import { productService } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatPrice } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProductCard from '../../components/common/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { inWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState({});

  useEffect(() => {
    setLoading(true);
    setQuantity(1);
    setSelectedCustomizations({});

    productService
      .getProduct(id)
      .then((res) => {
        if (res && res.product) {
          setProduct(res.product);

          // Fetch related products in category
          if (res.product.category?._id || res.product.category) {
            const catId = res.product.category?._id || res.product.category;
            productService
              .getProducts({ category: catId, limit: 4 })
              .then((rel) => {
                if (rel && rel.products) {
                  setRelatedProducts(rel.products.filter((p) => p._id !== res.product._id));
                }
              })
              .catch(() => {});
          }
        }
      })
      .catch(() => {
        toast.error('Dish not found');
        navigate('/menu');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return <LoadingSpinner fullPage text="Garnishing your selected dish..." />;
  }

  if (!product) return null;

  // Calculate customized unit price
  let unitPrice = product.price || 0;
  Object.values(selectedCustomizations).forEach((opt) => {
    if (opt?.price) unitPrice += opt.price;
  });
  const totalPrice = unitPrice * quantity;

  const handleCustomizationChange = (groupName, option) => {
    setSelectedCustomizations((prev) => ({
      ...prev,
      [groupName]: option,
    }));
  };

  const handleAddToCart = () => {
    const customList = Object.entries(selectedCustomizations).map(([name, opt]) => ({
      name,
      option: opt.label,
      price: opt.price || 0,
    }));

    addToCart(product, quantity, customList);
    toast.success(`Added ${quantity}x ${product.name} to cart!`);
  };

  const isSaved = inWishlist(product._id);

  return (
    <div className="bg-cream-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Back Link */}
        <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-500 mb-6">
          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Menu</span>
          </Link>
          {product.category?.name && (
            <>
              <span>/</span>
              <Link
                to={`/menu?category=${product.category.slug || ''}`}
                className="text-brand-600 hover:underline font-bold"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-charcoal-900 truncate">{product.name}</span>
        </div>

        {/* Product Showcase Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-charcoal-200/80 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Image Showcase */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative rounded-3xl overflow-hidden aspect-square bg-cream-100 border border-charcoal-100 shadow-inner group">
              <img
                src={product.image || product.thumbnail || product.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Veg/Non-Veg Badge */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-charcoal-100">
                <span
                  className={`w-3 h-3 rounded-full ${
                    product.isVeg ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-rose-500 ring-2 ring-rose-200'
                  }`}
                />
                <span className="text-xs font-bold text-charcoal-800">
                  {product.isVeg ? 'Pure Veg' : 'Non-Veg'}
                </span>
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-sm shadow-sm transition-all ${
                  isSaved
                    ? 'bg-rose-50 text-rose-500'
                    : 'bg-white/90 text-charcoal-400 hover:text-rose-500'
                }`}
                title={isSaved ? 'Remove from wishlist' : 'Save dish'}
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-cream-50 p-3 rounded-2xl border border-charcoal-100">
                <Clock className="w-4 h-4 mx-auto text-brand-500 mb-1" />
                <div className="text-[11px] text-charcoal-400 font-medium">Prep Time</div>
                <div className="text-xs font-bold text-charcoal-900">{product.preparationTime || 20} mins</div>
              </div>
              <div className="bg-cream-50 p-3 rounded-2xl border border-charcoal-100">
                <Flame className="w-4 h-4 mx-auto text-orange-500 mb-1" />
                <div className="text-[11px] text-charcoal-400 font-medium">Calories</div>
                <div className="text-xs font-bold text-charcoal-900">{product.calories || 450} kcal</div>
              </div>
              <div className="bg-cream-50 p-3 rounded-2xl border border-charcoal-100">
                <Star className="w-4 h-4 mx-auto text-amber-500 fill-amber-500 mb-1" />
                <div className="text-[11px] text-charcoal-400 font-medium">Rating</div>
                <div className="text-xs font-bold text-charcoal-900">{product.rating || 4.8} / 5</div>
              </div>
            </div>
          </div>

          {/* Right Column: Dish Info & Customization */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-1">
                {product.category?.name || 'Gourmet Dish'}
              </div>

              <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-charcoal-900 tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 mt-3">
                <span className="font-sans font-black text-3xl text-brand-600">
                  {formatPrice(unitPrice)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-base text-charcoal-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                {product.originalPrice && (
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Save {formatPrice(product.originalPrice - product.price)}
                  </span>
                )}
              </div>

              <p className="text-charcoal-600 text-sm leading-relaxed mt-4">
                {product.description}
              </p>

              {/* Ingredients Tags */}
              {product.ingredients && product.ingredients.length > 0 && (
                <div className="mt-5">
                  <div className="text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-2">
                    Ingredients
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {product.ingredients.map((ing, i) => (
                      <span
                        key={i}
                        className="text-xs bg-cream-100 text-charcoal-700 px-2.5 py-1 rounded-xl font-medium"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Customization Options */}
              {product.customizations && product.customizations.length > 0 && (
                <div className="mt-6 space-y-4 pt-4 border-t border-charcoal-100">
                  {product.customizations.map((group, gIdx) => (
                    <div key={gIdx} className="space-y-2">
                      <div className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
                        Select {group.name}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {group.options.map((opt, oIdx) => {
                          const isSelected = selectedCustomizations[group.name]?.label === opt.label;
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => handleCustomizationChange(group.name, opt)}
                              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                                isSelected
                                  ? 'bg-brand-50 border-brand-500 text-brand-900 shadow-xs'
                                  : 'bg-white border-charcoal-200 text-charcoal-700 hover:bg-cream-50'
                              }`}
                            >
                              <span>{opt.label}</span>
                              <span className="text-[11px] text-charcoal-500">
                                {opt.price > 0 ? `+${formatPrice(opt.price)}` : 'Included'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions: Quantity & Add to Cart */}
            <div className="pt-6 border-t border-charcoal-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center bg-cream-100 border border-charcoal-200 rounded-2xl p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white text-charcoal-700 disabled:opacity-40 shadow-xs hover:bg-cream-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-sm text-charcoal-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white text-charcoal-700 shadow-xs hover:bg-cream-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-right">
                  <div className="text-xs text-charcoal-400">Total Price</div>
                  <div className="font-display font-extrabold text-2xl text-charcoal-900">
                    {formatPrice(totalPrice)}
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-base shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 transform active:scale-98"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Add {quantity} to Cart &bull; {formatPrice(totalPrice)}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h3 className="font-display text-2xl font-bold text-charcoal-900 mb-6">
              You Might Also Crave
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

