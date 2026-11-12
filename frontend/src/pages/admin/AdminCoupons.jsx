import { useState, useEffect } from 'react';
import { Plus, Ticket, Trash2, Tag, Calendar, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { formatPrice, formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'percentage',
    value: 20,
    minOrderAmount: 249,
    maxDiscount: 100,
    usageLimit: 500,
    expiresAt: '',
    isActive: true,
  });

  const fetchCoupons = () => {
    setLoading(true);
    api
      .get('/coupons')
      .then((res) => {
        if (res && res.coupons) setCoupons(res.coupons);
      })
      .catch((err) => toast.error(err.message || 'Error fetching coupons'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.value) {
      toast.error('Code and discount value are required.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/coupons', {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        value: Number(formData.value),
        minOrderAmount: Number(formData.minOrderAmount),
        maxDiscount: Number(formData.maxDiscount),
        usageLimit: Number(formData.usageLimit),
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      });

      toast.success(`Coupon ${formData.code.toUpperCase()} created!`);
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.message || 'Failed to create coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (err) {
      toast.error(err.message || 'Could not delete coupon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-900">
            Coupons & Promotional Vouchers
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Create percentage and flat discount codes with minimum cart rules.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12">
            <LoadingSpinner text="Loading promotion vouchers..." />
          </div>
        ) : coupons.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-3xl border border-charcoal-200 text-charcoal-400 text-xs">
            No active coupons found. Click "Create New Coupon" to offer discounts.
          </div>
        ) : (
          coupons.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-3xl p-6 border border-charcoal-200/80 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-charcoal-900 tracking-wider bg-brand-50 text-brand-700 px-2.5 py-1 rounded-xl border border-brand-200">
                      {c.code}
                    </span>
                    <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-600 mt-2 leading-relaxed">
                    {c.description || 'Promotional coupon code'}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(c._id)}
                  className="p-1.5 text-charcoal-400 hover:text-rose-600 rounded-lg"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-3 border-t border-charcoal-100 space-y-1 text-xs text-charcoal-500">
                <div className="flex justify-between">
                  <span>Min Order:</span>
                  <span className="font-semibold text-charcoal-900">{formatPrice(c.minOrderAmount)}</span>
                </div>
                {c.maxDiscount > 0 && (
                  <div className="flex justify-between">
                    <span>Max Discount Cap:</span>
                    <span className="font-semibold text-charcoal-900">{formatPrice(c.maxDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Used Count:</span>
                  <span className="font-semibold text-charcoal-900">{c.usedCount || 0} / {c.usageLimit || '∞'}</span>
                </div>
                <div className="flex justify-between text-[11px] text-charcoal-400 pt-1">
                  <span>Expires:</span>
                  <span>{formatDate(c.expiresAt)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
              <h3 className="font-display font-bold text-lg text-charcoal-900">
                Create Discount Coupon
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-charcoal-400 hover:text-charcoal-800 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. SNACKFEST30"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-cream-50 border border-charcoal-200 rounded-xl text-xs uppercase font-mono tracking-wider focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="30% discount on party snacks"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-cream-50 border border-charcoal-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-cream-50 border border-charcoal-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Rupee (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-cream-50 border border-charcoal-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                    Min Order (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full px-3 py-2 bg-cream-50 border border-charcoal-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                    Max Cap (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    className="w-full px-3 py-2 bg-cream-50 border border-charcoal-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>
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
                  {saving ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

