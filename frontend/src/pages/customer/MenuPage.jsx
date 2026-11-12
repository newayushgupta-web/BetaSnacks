import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, RotateCcw, Flame, Star, Check, UtensilsCrossed } from 'lucide-react';
import { productService } from '../../services/productService';
import ProductCard from '../../components/common/ProductCard';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Read directly from URL searchParams
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const filterParam = searchParams.get('filter') || '';
  const vegOnlyParam = searchParams.get('isVeg') === 'true';
  const maxPriceParam = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 600;
  const sortParam = searchParams.get('sort') || 'sold';
  const pageParam = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

  // Local state for instant typing in search box
  const [searchInput, setSearchInput] = useState(searchParam);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Sync search input if URL search changes from navbar
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  // Load categories
  useEffect(() => {
    productService
      .getCategories()
      .then((res) => {
        if (res && res.categories) setCategories(res.categories);
      })
      .catch(() => {});
  }, []);

  // Update query params helper
  const updateFilter = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (
        val === undefined ||
        val === null ||
        val === '' ||
        (key === 'maxPrice' && val >= 600) ||
        (key === 'page' && val === 1) ||
        (key === 'isVeg' && !val)
      ) {
        next.delete(key);
      } else {
        next.set(key, String(val));
      }
    });

    // Reset pagination to 1 whenever a filter or search changes
    if (!('page' in updates)) {
      next.delete('page');
    }

    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter({ search: searchInput.trim() });
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  // Fetch products whenever search params change
  useEffect(() => {
    setLoading(true);
    productService
      .getProducts({
        search: searchParam,
        category: categoryParam,
        filter: filterParam,
        isVeg: vegOnlyParam ? true : undefined,
        priceMax: maxPriceParam < 600 ? maxPriceParam : undefined,
        sort: sortParam,
        page: pageParam,
        limit: 12,
      })
      .then((res) => {
        if (res && res.products) {
          setProducts(res.products);
          setPagination({
            page: res.page || 1,
            pages: res.pages || 1,
            total: res.total || res.products.length,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [categoryParam, searchParam, filterParam, vegOnlyParam, maxPriceParam, sortParam, pageParam]);

  const activeCategory = categories.find((c) => c.slug === categoryParam || c._id === categoryParam);

  return (
    <div className="bg-cream-50 min-h-screen py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Menu Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-charcoal-200/70 gap-4">
          <div>
            <span className="text-brand-600 font-bold text-xs uppercase tracking-wider">
              {activeCategory ? activeCategory.name : 'All Gourmet Categories'}
            </span>
            <h1 className="font-sans text-3xl sm:text-4xl font-black text-charcoal-900 tracking-tight mt-0.5">
              {activeCategory ? activeCategory.name : 'Explore Our Menu'}
            </h1>
            <p className="text-charcoal-500 text-xs sm:text-sm mt-1">
              {activeCategory
                ? activeCategory.description
                : 'Hot samosas, crispy bread rolls, stone-baked pizzas, street noodles & desi sweets.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input Form */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search samosa, pizza, noodles..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-16 py-2.5 bg-white border border-charcoal-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
              />
              {searchInput && (
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-brand-500 text-white font-bold text-xs hover:bg-brand-600 transition-colors"
                >
                  Go
                </button>
              )}
            </form>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="lg:hidden p-2.5 bg-white border border-charcoal-200 rounded-2xl text-charcoal-700 shadow-xs flex items-center gap-1.5 text-xs font-bold"
            >
              <Filter className="w-4 h-4 text-brand-500" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Categories Pill Carousel on top */}
        <div className="py-4 overflow-x-auto scrollbar-none flex items-center gap-2 border-b border-charcoal-100">
          <button
            onClick={() => updateFilter({ category: '' })}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 ${
              categoryParam === ''
                ? 'bg-charcoal-900 text-white shadow-md'
                : 'bg-white text-charcoal-700 hover:bg-cream-100 border border-charcoal-200/80'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>All Dishes</span>
          </button>

          {categories.map((c) => {
            const isSelected = categoryParam === c.slug || categoryParam === c._id;
            return (
              <button
                key={c._id || c.slug}
                onClick={() => updateFilter({ category: c.slug || c._id })}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 ${
                  isSelected
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'bg-white text-charcoal-700 hover:bg-cream-100 border border-charcoal-200/80'
                }`}
              >
                {c.image && (
                  <img
                    src={c.image}
                    alt={c.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                )}
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Filter Pills Row */}
        <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
          <button
            onClick={() => updateFilter({ isVeg: !vegOnlyParam })}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 flex-shrink-0 ${
              vegOnlyParam
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-charcoal-700 border-charcoal-200 hover:border-charcoal-300'
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${vegOnlyParam ? 'bg-white' : 'bg-emerald-600'}`} />
            <span>Pure Veg</span>
          </button>

          <button
            onClick={() => updateFilter({ filter: filterParam === 'bestseller' ? '' : 'bestseller' })}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 flex-shrink-0 ${
              filterParam === 'bestseller'
                ? 'bg-charcoal-900 text-white border-charcoal-900 shadow-xs'
                : 'bg-white text-charcoal-700 border-charcoal-200 hover:border-charcoal-300'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-brand-400" />
            <span>Bestsellers</span>
          </button>

          <button
            onClick={() => updateFilter({ filter: filterParam === 'special' ? '' : 'special' })}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 flex-shrink-0 ${
              filterParam === 'special'
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-white text-charcoal-700 border-charcoal-200 hover:border-charcoal-300'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>Daily Deals & Specials</span>
          </button>

          <button
            onClick={() => updateFilter({ maxPrice: maxPriceParam === 200 ? 600 : 200 })}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all flex-shrink-0 ${
              maxPriceParam === 200
                ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                : 'bg-white text-charcoal-700 border-charcoal-200 hover:border-charcoal-300'
            }`}
          >
            Under ₹200
          </button>

          <button
            onClick={() => updateFilter({ maxPrice: maxPriceParam === 350 ? 600 : 350 })}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all flex-shrink-0 ${
              maxPriceParam === 350
                ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                : 'bg-white text-charcoal-700 border-charcoal-200 hover:border-charcoal-300'
            }`}
          >
            Under ₹350
          </button>

          {(vegOnlyParam || searchParam || categoryParam || filterParam || maxPriceParam < 600 || sortParam !== 'sold') && (
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors flex items-center gap-1 flex-shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-4">
          {/* Left Sidebar Filters */}
          <aside
            className={`lg:block bg-white p-6 rounded-3xl border border-charcoal-200/80 shadow-sm h-fit space-y-6 ${
              showFiltersMobile ? 'block' : 'hidden'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-100">
              <div className="flex items-center gap-2 font-display font-bold text-sm text-charcoal-900">
                <SlidersHorizontal className="w-4 h-4 text-brand-500" />
                <span>Filter Dishes</span>
              </div>
              <button
                onClick={resetFilters}
                className="text-xs text-brand-600 hover:text-brand-700 font-bold"
              >
                Reset
              </button>
            </div>

            {/* Categories in Sidebar */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider">
                Categories
              </label>
              <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                <button
                  onClick={() => updateFilter({ category: '' })}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    categoryParam === ''
                      ? 'bg-brand-500 text-white font-bold'
                      : 'text-charcoal-700 hover:bg-cream-50'
                  }`}
                >
                  All Dishes
                </button>
                {categories.map((c) => {
                  const isSelected = categoryParam === c.slug || categoryParam === c._id;
                  return (
                    <button
                      key={c._id || c.slug}
                      onClick={() => updateFilter({ category: c.slug || c._id })}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-brand-500 text-white font-bold'
                          : 'text-charcoal-700 hover:bg-cream-50'
                      }`}
                    >
                      <span className="truncate pr-1">{c.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Slider */}
            <div className="space-y-2 pt-2 border-t border-charcoal-100">
              <div className="flex justify-between items-center text-xs font-bold text-charcoal-900">
                <span className="text-[11px] text-charcoal-400 uppercase tracking-wider">Max Price</span>
                <span className="text-brand-600 font-bold font-mono">₹{maxPriceParam}</span>
              </div>
              <input
                type="range"
                min="50"
                max="600"
                step="25"
                value={maxPriceParam}
                onChange={(e) => updateFilter({ maxPrice: Number(e.target.value) })}
                className="w-full accent-brand-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-charcoal-400 font-medium">
                <span>₹50</span>
                <span>₹600</span>
              </div>
            </div>

            {/* Sorting */}
            <div className="space-y-2 pt-2 border-t border-charcoal-100">
              <label className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider">
                Sort Results
              </label>
              <select
                value={sortParam}
                onChange={(e) => updateFilter({ sort: e.target.value })}
                className="w-full px-3 py-2.5 bg-cream-50 border border-charcoal-200 rounded-xl text-xs font-bold text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="sold">Most Popular (Best Sellers)</option>
                <option value="rating">Top Rated (Highest First)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </aside>

          {/* Right Product Grid Area */}
          <section className="lg:col-span-3">
            {loading ? (
              <LoadingSpinner text="Fetching fresh dishes..." />
            ) : products.length === 0 ? (
              <EmptyState
                title="No dishes found"
                description={`We couldn't find any dishes matching your current filters${categoryParam ? ` in "${activeCategory?.name || categoryParam}"` : ''}. Try resetting your search or price range.`}
                actionText="Reset All Filters"
                onAction={resetFilters}
              />
            ) : (
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-charcoal-500 mb-4">
                  <span>
                    Showing {products.length} delicious dish{products.length > 1 ? 'es' : ''}{' '}
                    {pagination.total > 0 && `(Total: ${pagination.total})`}
                  </span>
                  {categoryParam && (
                    <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
                      Filter: {activeCategory?.name || categoryParam}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>

                {pagination.pages > 1 && (
                  <div className="mt-10 flex justify-center">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.pages}
                      onPageChange={(p) => {
                        updateFilter({ page: p });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
