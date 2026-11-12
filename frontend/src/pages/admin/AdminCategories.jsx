import { useState, useEffect } from 'react';
import { Plus, FolderTree, Edit3, Trash2 } from 'lucide-react';
import { productService } from '../../services/productService';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '',
    description: '',
    image: '',
    sortOrder: 1,
  });

  const fetchCategories = () => {
    setLoading(true);
    productService
      .getCategories()
      .then((res) => {
        if (res && res.categories) setCategories(res.categories);
      })
      .catch((err) => toast.error(err.message || 'Error fetching categories'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon || '',
        description: cat.description || '',
        image: cat.image || '',
        sortOrder: cat.sortOrder || 1,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        icon: '',
        description: '',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
        sortOrder: categories.length + 1,
      });
    }
    setShowModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Category name is required.');
      return;
    }

    setSaving(true);
    try {
      const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-');
      const payload = { ...formData, slug, sortOrder: Number(formData.sortOrder) };

      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, payload);
        toast.success('Category updated!');
      } else {
        await api.post('/categories', payload);
        toast.success('Category created!');
      }

      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted.');
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Could not delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-900">
            Menu Taxonomy & Categories
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Organize dishes into snack categories, custom icons and sort orders.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-12">
            <LoadingSpinner text="Loading menu categories..." />
          </div>
        ) : (
          categories.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-3xl p-5 border border-charcoal-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-card transition-all"
            >
              <div>
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-cream-100 mb-3">
                  <img
                    src={c.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'}
                    alt={c.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[11px] font-bold text-charcoal-800 shadow-sm">
                    {c.slug}
                  </div>
                </div>

                <h3 className="font-display font-bold text-base text-charcoal-900">{c.name}</h3>
                <p className="text-xs text-charcoal-500 mt-1 line-clamp-2">
                  {c.description || 'Delicious selection of dishes'}
                </p>
              </div>

              <div className="pt-3 border-t border-charcoal-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-charcoal-400">/{c.slug}</span>
                <div className="space-x-1">
                  <button
                    onClick={() => handleOpenModal(c)}
                    className="p-1.5 rounded-lg bg-cream-100 text-charcoal-600 hover:text-brand-600"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
              <h3 className="font-display font-bold text-lg text-charcoal-900">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-charcoal-400 hover:text-charcoal-800 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Loaded Nachos & Fries"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-cream-50 border border-charcoal-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    placeholder="e.g. Popular, Fresh"
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 bg-cream-50 border border-charcoal-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    className="w-full px-3 py-2 bg-cream-50 border border-charcoal-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short menu section overview..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-cream-50 border border-charcoal-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 bg-cream-50 border border-charcoal-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-charcoal-100">
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
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold"
                >
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

