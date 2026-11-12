import { useState, useEffect } from 'react';
import { Search, Users, Award, Shield, Mail, Phone } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchCustomers = () => {
    setLoading(true);
    adminService
      .getAllCustomers({ search, page, limit: 10 })
      .then((res) => {
        if (res && res.customers) {
          setCustomers(res.customers);
          setPages(res.pages || 1);
        }
      })
      .catch((err) => toast.error(err.message || 'Error fetching customer directory'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-900">
            Customer Directory
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Registered foodies, loyalty tiers, contact details and lifetime orders.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-charcoal-200/80 shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream-50 border border-charcoal-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-charcoal-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12">
            <LoadingSpinner text="Loading customers..." />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-charcoal-400 text-xs">
            No customers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-50 border-b border-charcoal-200 text-charcoal-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Loyalty Points</th>
                  <th className="py-3 px-4">Joined On</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-cream-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
                          {c.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-charcoal-900">{c.name}</div>
                          <div className="text-[11px] text-charcoal-400">{c.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-cream-200 text-charcoal-700'
                        }`}
                      >
                        {c.role === 'admin' ? 'Administrator' : 'Customer'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-charcoal-600 font-medium">
                      {c.phone || '—'}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>{c.rewardPoints || 0} pts</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-charcoal-500">
                      {formatDate(c.createdAt)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Active
                      </span>
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
    </div>
  );
}

