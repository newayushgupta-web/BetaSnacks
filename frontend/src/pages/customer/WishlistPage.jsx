import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import ProductCard from '../../components/common/ProductCard';
import EmptyState from '../../components/common/EmptyState';

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="bg-cream-50 min-h-[75vh] py-16 flex items-center justify-center">
        <div className="max-w-md w-full px-4">
          <EmptyState
            title="Your Wishlist is Empty"
            description="You haven't bookmarked any cravings yet. Tap the heart icon on any gourmet dish to save it here for later!"
            actionText="Explore Dishes"
            onAction={() => navigate('/menu')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pb-6 border-b border-charcoal-200/80 mb-8">
          <h1 className="font-display text-3xl font-extrabold text-charcoal-900 flex items-center gap-2.5">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
            <span>Saved Cravings ({wishlist.length})</span>
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Your personal selection of favorite snacks, burgers, pizzas and bowls.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

