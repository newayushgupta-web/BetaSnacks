import { Link } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';

const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/menu?category=${category.slug}`}
      className="flex-shrink-0 group"
    >
      <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group-hover:scale-105">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
            <UtensilsCrossed className="w-8 h-8 text-brand-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 to-transparent" />
        <div className="absolute bottom-2 left-0 right-0 text-center">
          <span className="text-xs font-semibold text-white">{category.name}</span>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
