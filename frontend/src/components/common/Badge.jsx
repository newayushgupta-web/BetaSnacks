const variantClasses = {
  veg: 'bg-green-100 text-green-800 border border-green-200',
  'non-veg': 'bg-red-100 text-red-800 border border-red-200',
  bestseller: 'bg-brand-100 text-brand-800 border border-brand-200',
  featured: 'bg-purple-100 text-purple-800 border border-purple-200',
  special: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  new: 'bg-blue-100 text-blue-800 border border-blue-200',
  default: 'bg-charcoal-100 text-charcoal-700 border border-charcoal-200',
};

const Badge = ({ label, variant = 'default', className = '' }) => {
  const cls = variantClasses[variant] || variantClasses.default;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls} ${className}`}>
      {label}
    </span>
  );
};

export default Badge;
