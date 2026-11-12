import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, count, size = 'sm', showCount = true }) => {
  const sizes = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' };
  const starSize = sizes[size];

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= Math.round(rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-charcoal-200'
            }`}
          />
        ))}
      </div>
      {showCount && (
        <span className="text-xs text-charcoal-500">
          {rating?.toFixed ? rating.toFixed(1) : rating}
          {count !== undefined && ` (${count})`}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
