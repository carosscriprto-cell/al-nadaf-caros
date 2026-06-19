import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2560],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'basemaps.cartocdn.com',
      },
      {
        // Supabase Storage public objects (car images live here, P5a Task 5).
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // P5c settings: a dealer may set an EXTERNAL logo / favicon / OG image
        // URL (any https host). The image optimizer needs this to render them.
        // Tradeoff: the optimizer will fetch arbitrary https hosts on demand —
        // acceptable for tenant-provided brand assets in this multi-tenant SaaS.
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
