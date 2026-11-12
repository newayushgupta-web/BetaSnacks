export const formatPrice = (price) => `₹${price?.toLocaleString('en-IN') || 0}`;
export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
export const truncateText = (text, length = 100) =>
  text?.length > length ? text.substring(0, length) + '...' : text;
export const getOrderStatusColor = (status) => {
  const colors = {
    placed: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-purple-100 text-purple-800',
    preparing: 'bg-yellow-100 text-yellow-800',
    ready: 'bg-orange-100 text-orange-800',
    'out-for-delivery': 'bg-brand-100 text-brand-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};
