// Betasnacks Modern Brand Identity Logo
export default function Logo({ size = 'md', variant = 'full', className = '', dark = false }) {
  const sizeConfig = {
    sm: { icon: 26, text: 'text-lg', dot: 'w-1.5 h-1.5' },
    md: { icon: 34, text: 'text-xl', dot: 'w-2 h-2' },
    lg: { icon: 42, text: 'text-2xl', dot: 'w-2.5 h-2.5' },
    xl: { icon: 52, text: 'text-3xl', dot: 'w-3 h-3' },
  }[size] || { icon: 34, text: 'text-xl', dot: 'w-2 h-2' };

  const textColor = dark ? 'text-white' : 'text-charcoal-900';

  const BrandIcon = () => (
    <div
      style={{ width: sizeConfig.icon, height: sizeConfig.icon }}
      className="relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-amber-500 shadow-sm shadow-brand-500/30 flex-shrink-0"
    >
      {/* Modern minimalist Taste / Flame / Fry geometric mark */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-3/5 h-3/5 text-white"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2C6.5 7.5 4 11 4 14.5a8 8 0 0 0 16 0C20 11 17.5 7.5 12 2z" fill="currentColor" fillOpacity="0.15" />
        <path d="M12 2C8 6 6 9.5 6 13a6 6 0 0 0 12 0c0-3.5-2-7-6-11z" />
        <path d="M12 11c-1.5 1.5-2 2.5-2 3.8a2 2 0 0 0 4 0c0-1.3-.5-2.3-2-3.8z" fill="currentColor" />
      </svg>
    </div>
  );

  if (variant === 'icon') return <BrandIcon />;

  if (variant === 'text') {
    return (
      <span className={`font-display font-black tracking-tight ${sizeConfig.text} ${textColor} ${className}`}>
        BETA<span className="text-brand-500">SNACKS</span>
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <BrandIcon />
      <div className="flex flex-col leading-none">
        <span className={`font-display font-black tracking-tight ${sizeConfig.text} ${textColor}`}>
          BETA<span className="text-brand-500">SNACKS</span>
        </span>
        <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-charcoal-400 mt-0.5">
          Gourmet Kitchen
        </span>
      </div>
    </div>
  );
}
