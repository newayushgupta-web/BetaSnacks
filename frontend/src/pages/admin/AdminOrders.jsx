import { useState, useEffect } from 'react';
import { Search, Eye, Filter, CheckCircle, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatPrice, formatDate, getOrderStatusColor } from '../../utils/formatters';
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '../../utils/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Selected Order Detail Modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    adminService
      .getAllOrders({ status: statusFilter, search, page, limit: 12 })
      .then((res) => {
        if (res && res.orders) {
          setOrders(res.orders);
          setPages(res.pages || 1);
        }
      })
      .catch((err) => toast.error(err.message || 'Error fetching orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search, page]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      toast.success(`Order updated to '${ORDER_STATUS_LABELS[newStatus] || newStatus}'`);
      fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update order status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-900">
            Live Order Kitchen Pipeline
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Real-time status tracking, cooking prep stages and dispatch management.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2.5 bg-white border border-charcoal-200 rounded-xl text-charcoal-700 hover:bg-cream-100 transition-colors shadow-xs flex items-center gap-1.5 text-xs font-bold"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Pipeline</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-3xl border border-charcoal-200/80 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-1.5 border-b border-charcoal-100 pb-3">
          <button
            onClick={() => { setStatusFilter(''); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              statusFilter === '' ? 'bg-brand-500 text-white' : 'text-charcoal-600 hover:bg-cream-100'
            }`}
          >
            All Orders
          </button>
          {ORDER_STATUSES.map((st) => (
            <button
              key={st}
              onClick={() => { setStatusFilter(st); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === st ? 'bg-brand-500 text-white' : 'text-charcoal-600 hover:bg-cream-100'
              }`}
            >
              {ORDER_STATUS_LABELS[st]}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order number or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream-50 border border-charcoal-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-charcoal-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12">
            <LoadingSpinner text="Refreshing orders..." />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-charcoal-400 text-xs">
            No orders found under selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-charcoal-200 text-charcoal-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Update Status</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-cream-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-charcoal-900">
                      #{ord.orderNumber || ord._id.substring(0, 7).toUpperCase()}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-charcoal-800">{ord.deliveryAddress?.name || ord.user?.name || 'Customer'}</div>
                      <div className="text-[11px] text-charcoal-400">{ord.deliveryAddress?.city || 'Bengaluru'}</div>
                    </td>

                    <td className="py-3.5 px-4 text-charcoal-600 font-medium">
                      {ord.items?.length || 0} item(s)
                    </td>

                    <td className="py-3.5 px-4 font-bold text-charcoal-900 font-mono">
                      {formatPrice(ord.total)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ord.paymentStatus === 'paid' ? 'PAID' : 'COD PENDING'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${getOrderStatusColor(ord.status)}`}>
                        {ORDER_STATUS_LABELS[ord.status] || ord.status}
                      </span>
                    </td>

                    {/* Status Update Quick Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                        className="px-2.5 py-1 bg-cream-50 border border-charcoal-200 rounded-lg text-xs font-semibold text-charcoal-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {ORDER_STATUS_LABELS[st]}
                          </option>
                        ))}
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 rounded-lg bg-cream-100 text-charcoal-700 hover:text-brand-600 hover:bg-brand-50"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
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

      {/* Inspect Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-lg text-charcoal-900">
                  Order Details #{selectedOrder.orderNumber || selectedOrder._id.substring(0, 7)}
                </h3>
                <span className="text-xs text-charcoal-400">Placed on {formatDate(selectedOrder.createdAt)}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-charcoal-400 hover:text-charcoal-800 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Dishes in order */}
            <div className="space-y-2 divide-y divide-charcoal-100 max-h-60 overflow-y-auto">
              {selectedOrder.items?.map((item, i) => (
                <div key={i} className="pt-2 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-charcoal-900">{item.quantity}x</span>{' '}
                    <span>{item.name}</span>
                  </div>
                  <span className="font-bold text-charcoal-900 font-mono">
                    {formatPrice((item.price || 0) * (item.quantity || 1))}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-charcoal-200 text-xs space-y-1 text-charcoal-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>{selectedOrder.deliveryFee === 0 ? 'FREE' : formatPrice(selectedOrder.deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-charcoal-900 pt-1 border-t border-charcoal-100">
                <span>Grand Total:</span>
                <span className="text-brand-600 font-mono">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            <div className="p-3 bg-cream-50 rounded-2xl border border-charcoal-200 text-xs text-charcoal-700 space-y-1">
              <div className="font-bold text-charcoal-900">Delivery Address:</div>
              <div>{selectedOrder.deliveryAddress?.name} ({selectedOrder.deliveryAddress?.phone})</div>
              <div>{selectedOrder.deliveryAddress?.street}, {selectedOrder.deliveryAddress?.city} - {selectedOrder.deliveryAddress?.pincode}</div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-charcoal-900 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

