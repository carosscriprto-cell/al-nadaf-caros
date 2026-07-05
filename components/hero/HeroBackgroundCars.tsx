'use client';

import Image from 'next/image';
import { useState } from 'react';

// Two showroom cars bleeding in from the left + right edges, vertically centred
// BEHIND the headline + search card so the whole hero reads as one scene (not a
// stack of blocks). Purely decorative (aria-hidden, pointer-events-none).
//
// • White-label: the wash + headline halo are radials of var(--color-accent) /
//   var(--background) so a per-tenant accent still tints it. Base surface is the
//   themed token (bg-background) → light/dark via next-themes. No hardcoded colors.
// • RTL: positioned with LOGICAL insets (start-*/end-*) + logical object-position,
//   so the two cars swap edges automatically under dir="rtl".
// • LCP: next/image with priority (the hero is the largest paint).
// • Graceful degrade: if an asset is missing/broken, that car is dropped on error
//   and only the soft gradient remains — never a broken-image icon.

const CARS = [
  {
    src: '/hero/car-1.png',
    // start edge: left in LTR, right in RTL. Anchor the car to the OUTER edge so
    // its outer flank is cropped by the viewport (it bleeds off-screen).
    box: 'start-[-13%] [object-position:left_center] rtl:[object-position:right_center]',
  },
  {
    src: '/hero/car-2.png',
    // end edge: right in LTR, left in RTL
    box: 'end-[-12%] [object-position:right_center] rtl:[object-position:left_center] scale-x-[-1]',
  },
] as const;

export default function HeroBackgroundCars({
  heroImageUrl,
}: {
  // Per-tenant hero background (P). When set, it replaces the two-car static
  // composition with a single full-bleed image + accent overlay. null → the
  // default two-car scene (unchanged fallback).
  heroImageUrl?: string | null;
} = {}) {
  // One broken-flag per car so a single missing asset doesn't take the other down.
  const [broken, setBroken] = useState<Record<string, boolean>>({});
  // Degrade a broken tenant hero to the gradient-only base (same as the cars).
  const [heroBroken, setHeroBroken] = useState(false);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Themed base */}
      <div className="absolute inset-0 bg-background" />

      {/* Per-tenant hero image: single full-bleed background with the accent
          wash layered ON TOP for text contrast. Broken/missing → gradient only. */}
      {heroImageUrl && !heroBroken && (
        <Image
          src={heroImageUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          onError={() => setHeroBroken(true)}
          className="select-none object-cover"
          quality={100}
        />
      )}

      {/* Accent wash over the whole scene — subtle, accent-tinted, white-label */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          background:
            'radial-gradient(65% 60% at 50% 38%, var(--color-accent) 0%, transparent 70%)',
        }}
      />

      {/* The two cars — vertically centred, large, bleeding off the edges. Hidden
          on small screens so they never crowd the content (legibility first).
          Skipped entirely when a tenant hero image is in use. */}
      {!(heroImageUrl && !heroBroken) && CARS.map(({ src, box }) =>
        broken[src] ? null : (
          <div
            key={src}
            className={`absolute top-1/2 hidden h-[62%] w-[64vw] max-w-[680px] -translate-y-1/2 md:block ${box}`}
          >
            <Image
              src={src}
              alt=""
              fill
              priority
              sizes="64vw"
              onError={() => setBroken((b) => ({ ...b, [src]: true }))}
              className="select-none object-contain opacity-95"
              quality={100}
            />
          </div>
        ),
      )}

      {/* Headline halo — a soft clearing of the background colour behind the upper
          content, so the text lifts cleanly off the cars. Sits above the cars but
          below the page content (this whole layer is -z-10). */}
      <div
        className="absolute inset-x-0 top-[14%] mx-auto h-[52vh] w-[88%] max-w-4xl"
        style={{
          background:
            'radial-gradient(closest-side at 50% 40%, var(--background) 55%, transparent 100%)',
        }}
      />

      {/* Gentle fade at the very bottom into the next section */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent to-background" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-border" />
    </div>
  );
}
