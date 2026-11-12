import { useState, useEffect } from 'react';

const FALLBACK = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';

const ImageWithFallback = ({ src, alt, className = '', fallback = FALLBACK, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src || fallback);

  useEffect(() => {
    setImgSrc(src || fallback);
  }, [src, fallback]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (imgSrc !== fallback) {
          setImgSrc(fallback);
        }
      }}
      loading="lazy"
      {...props}
    />
  );
};

export default ImageWithFallback;
