'use client';

import { Crown, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTenantFeatures } from '@/components/providers/TenantFeaturesProvider';

interface VipDeliveryBadgeProps {
  className?: string;
}

export default function VipDeliveryBadge({ className = "" }: VipDeliveryBadgeProps) {
  const t = useTranslations();
  const features = useTenantFeatures();

  if (!features.enableVipDelivery) {
    return null;
  }

  return (
    <div className={`inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg ${className}`}>
      <Crown className="w-4 h-4" />
      <Star className="w-3 h-3 fill-current" />
      <span>{t('car.vip_delivery')}</span>
    </div>
  );
}
