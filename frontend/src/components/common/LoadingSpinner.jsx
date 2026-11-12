import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ fullPage = false, size = 'md', text = '' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-cream-50/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className={`${sizes.lg} animate-spin text-brand-500`} />
          {text && <p className="text-charcoal-600 font-medium">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <Loader2 className={`${sizes[size]} animate-spin text-brand-500`} />
      {text && <p className="text-charcoal-600">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
