'use client';

import type { ReactNode } from 'react';

// Responsive sticky action bar for dashboard forms.
//   • mobile  → fixed to the bottom of the viewport (thumb-reachable);
//   • desktop → sticky to the top of the scrolling content.
// Either way it stays visible while the long form scrolls. Alignment is logical
// (justify-end) so it mirrors correctly under RTL. Matches the dashboard palette
// (the dashboard uses its own fixed light theme, not the storefront tokens).
export default function StickyActionBar({ children }: { children: ReactNode }) {
  return (
    <div
      className="z-30 border-[#ececec] bg-white/90 backdrop-blur
        max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:border-t max-lg:px-5 max-lg:py-3
        lg:sticky lg:top-4 lg:rounded-2xl lg:border lg:px-4 lg:py-3 lg:shadow-[0_2px_12px_rgba(15,23,42,0.06)]"
    >
      <div className="mx-auto flex max-w-4xl items-center justify-end gap-3">
        {children}
      </div>
    </div>
  );
}
