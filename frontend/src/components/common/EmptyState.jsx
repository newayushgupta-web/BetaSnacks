import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon,
  emoji,
  title,
  description,
  ctaText,
  ctaLink,
  onCtaClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {emoji ? (
        <div className="text-6xl mb-4">{emoji}</div>
      ) : Icon ? (
        <div className="bg-cream-100 rounded-full p-6 mb-4">
          <Icon className="h-12 w-12 text-brand-400" />
        </div>
      ) : null}
      <h3 className="font-display text-2xl text-charcoal-900 mb-2">{title}</h3>
      {description && (
        <p className="text-charcoal-500 max-w-sm mb-6">{description}</p>
      )}
      {ctaText && ctaLink && (
        <Link
          to={ctaLink}
          className="bg-brand-500 text-white px-6 py-3 rounded-xl hover:bg-brand-600 transition-colors font-medium"
        >
          {ctaText}
        </Link>
      )}
      {ctaText && onCtaClick && !ctaLink && (
        <button
          onClick={onCtaClick}
          className="bg-brand-500 text-white px-6 py-3 rounded-xl hover:bg-brand-600 transition-colors font-medium"
        >
          {ctaText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
