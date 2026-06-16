'use client';

// next/image wrapper that renders a neutral car placeholder when the source is
// empty or fails to load (e.g. seeded cars whose local image path 404s). Keeps
// all next/image benefits (WebP/AVIF, responsive, lazy) for valid images.

import { useEffect, useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { Car } from 'lucide-react';

export default function ImageWithFallback({ src, alt, ...rest }: ImageProps) {
  const [failed, setFailed] = useState(false);

  // Reset when the source changes (component may be reused across rows/cards).
  useEffect(() => setFailed(false), [src]);

  if (failed || !src) {
    return (
      <span className="flex h-full w-full items-center justify-center bg-[#f0f1f3] text-[#cbd0d6]">
        <Car className="h-1/3 w-1/3" aria-hidden />
      </span>
    );
  }

  return <Image src={src} alt={alt} onError={() => setFailed(true)} {...rest} />;
}
