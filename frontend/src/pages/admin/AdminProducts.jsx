import { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, Eye, EyeOff, Sparkles, Filter } from 'lucide-react';
import { productService } from '../../services/productService';
import { formatPrice } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    originalPrice: '',
    isVeg: true,
    spiceLevel: 'mild',
    preparationTime: 20,
    calories: 450,
    stock: 50,
    isAvailable: true,
    isFeatured: false,
    isBestseller: false,
    thumbnail: '',
  });

  const fetchCatalog = () => {
    setLoading(true);
    Promise.all([
      productService.getProducts({ search, page, limit: 10 }),
      productService.getCategories(),
    ])
      .then(([prodRes, catRes]) => {
        if (prodRes && prodRes.products) {
          setProducts(prodRes.products);
          setPages(prodRes.pages || 1);
        }
        if (catRes && catRes.categories) {
          setCategories(catRes.categories);
        }
      })
      .catch((err) => toast.error(err.message || 'Error fetching products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCatalog();
  }, [search, page]);

  const handleOpenModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setFormData({
        name: prod.name,
        description: prod.description,
        category: prod.category?._id || prod.category || '',
        price: prod.price,
        originalPrice: prod.originalPrice || '',
        isVeg: prod.isVeg,
        spiceLevel: prod.spiceLevel || 'mild',
        preparationTime: prod.preparationTime || 20,
        calories: prod.calories || 450,
        stock: prod.stock || 50,
        isAvailable: prod.isAvailable !== false,
        isFeatured: prod.isFeatured || false,
        isBestseller: prod.isBestseller || false,
        thumbnail: prod.thumbnail || prod.images?.[0] || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        category: categories[0]?._id || '',
        price: '',
        originalPrice: '',
        isVeg: true,
        spiceLevel: 'mild',
        preparationTime: 20,
        calories: 450,
        stock: 50,
        isAvailable: true,
        isFeatured: false,
        isBestseller: false,
        thumbnail: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
      });
    }
    setShowModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Name, price and category are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        stock: Number(formData.stock),
        preparationTime: Number(formData.preparationTime),
        calories: Number(formData.calories),
        images: [formData.thumbnail],
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct._id, payload);
        toast.success('Dish updated successfully!');
      } else {
        await productService.createProduct(payload);
        toast.success('New dish added to Betasnacks menu!');
      }

      setShowModal(false);
      fetchCatalog();
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this dish from the menu?')) return;
    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted.');
      fetchCatalog();
    } catch (err) {
      toast.error(err.message || 'Could not delete product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-900">
            Menu & Products Inventory
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Manage recipes, ingredients, prices, stock levels and chef specials.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-charcoal-200/80 shadow-sm flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by dish name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream-50 border border-charcoal-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-charcoal-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12">
            <LoadingSpinner text="Loading dishes catalog..." />
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-charcoal-400 text-xs">
            No dishes found in catalog.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-charcoal-200 text-charcoal-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Dish</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Diet</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Sold</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-cream-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image || p.thumbnail || p.images?.[0] || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200'}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover bg-cream-100"
                        />
                        <div>
                          <div className="font-bold text-charcoal-900 line-clamp-1">{p.name}</div>
                          <div className="text-[11px] text-charcoal-400">★ {p.rating || 4.8} ({p.reviewCount || 0})</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-charcoal-700 font-medium">
                      {p.category?.name || 'Snacks'}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.isVeg ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.isVeg ? 'Pure Veg' : 'Non-Veg'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-charcoal-900">
                      {formatPrice(p.price)}
                    </td>

                    <td className="py-3 px-4 font-semibold text-charcoal-700">
                      {p.stock || 50} units
                    </td>

                    <td className="py-3 px-4 text-charcoal-500 font-medium">
                      {p.sold || 0}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.isAvailable !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-charcoal-100 text-charcoal-500'
                        }`}
                      >
                        {p.isAvailable !== false ? 'Active' : 'Hidden'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(p)}
                        className="p-1.5 rounded-lg bg-cream-100 text-charcoal-600 hover:text-brand-600 hover:bg-brand-50"
                        title="Edit dish"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                        title="Delete dish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="p-4 border-t border-charcoal-100 flex justify-center">
            <Pagination currentPage={page} totalPages={pages} onPageChange={(p) => setPage(p)} />
          </div>
        )}
      </div>

      {/* Add / Edit Dish Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
              <h3 className="font-display font-bold text-xl text-charcoal-900">
                {editingProduct ? 'Edit Dish Recipe' : 'Add New Dish to Menu'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-charcoal-400 hover:text-charcoal-800 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Crispy Loaded Burger"
                    className="w-full px-3 py-2 bg-cream-50 border border-charcoal-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-cream-50 border border-charcoal-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    placeholder="299"
                    className="w-full px-3 py-2 bg-cream-50 border border-charcoal-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="349"
                    className="w-full px-3 py-2 bg-cream-50 border border-charcoal-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                    Description & Ingredients
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mouthwatering description for foodies..."
                    className="w-full px-3 py-2 bg-cream-50 border border-charcoal-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                    Food Image URL (Unsplash or Cloudinary)
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-cream-50 border border-charcoal-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                    Dietary Classification
                  </label>
                  <select
                    value={formData.isVeg ? 'veg' : 'nonveg'}
                    onChange={(e) => setFormData({ ...formData, isVeg: e.target.value === 'veg' })}
                    className="w-full px-3 py-2 bg-cream-50 border border-charcoal-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="veg">Pure Vegetarian (Veg)</option>
                    <option value="nonveg">Non-Vegetarian (Non-Veg)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                    Stock Inventory Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 bg-cream-50 border border-charcoal-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-charcoal-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="rounded accent-brand-500"
                  />
                  <span>Dish Active & Available</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-charcoal-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded accent-brand-500"
                  />
                  <span>Show as Featured</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-charcoal-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBestseller}
                    onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                    className="rounded accent-brand-500"
                  />
                  <span>Mark as Bestseller</span>
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-charcoal-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-white border border-charcoal-200 rounded-xl text-xs font-semibold text-charcoal-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {saving ? 'Saving...' : 'Save Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

