import { useState } from 'react';

export default function Photo({ media, alt, className = '', sizes = '(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 380px', priority = false, full = false }) {
  const [failed, setFailed] = useState(false);
  if (!media || failed) return (
    <div className={`photo-placeholder ${className}`} role="img" aria-label={`${alt} — nuotraukos nėra`}>
      <span aria-hidden="true">♡</span><span>Akimirka prisiminimuose</span>
    </div>
  );
  return <img src={full ? media.full : media.src} srcSet={media.srcSet} sizes={sizes}
    width={media.width} height={media.height} alt={alt} className={className}
    loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'}
    decoding="async" onError={() => setFailed(true)} />;
}
