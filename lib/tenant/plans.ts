// lib/tenant/plans.ts
// Canonical plan → standard-features mapping (P2.5-5).
//
// IMPORTANT: this is the SOURCE for onboarding (apply getPlanFeatures(plan) to a
// NEW tenant's features) and for the dashboard reference display. It is NOT a
// runtime override — `tenants.features` stays per-tenant editable and is the
// authority at runtime. Features may legitimately exceed the plan (manual
// onboarding / upsell); hard enforcement is deferred to V3 billing.

import type { TenantFeatures } from './features';

export type PlanKey = 'starter' | 'pro' | 'enterprise';
export const PLAN_KEYS: PlanKey[] = ['starter', 'pro', 'enterprise'];

export const PLAN_LABELS: Record<PlanKey, { en: string; ar: string }> = {
  starter: { en: 'Starter', ar: 'المبتدئة' },
  pro: { en: 'Pro', ar: 'الاحترافية' },
  enterprise: { en: 'Enterprise', ar: 'المؤسسية' },
};

// Plan-level capabilities that are NOT part of tenants.features (they describe
// what the plan permits, surfaced via the helpers below).
export type PlanCapabilities = {
  hybrid: boolean; // may offer BOTH sale and rental
  customDomain: boolean; // custom domain (else subdomain only)
  expandable: boolean; // limits expandable on request (enterprise)
};

type PlanPreset = { features: TenantFeatures; caps: PlanCapabilities };

// The decided plan map. Single-type plans (starter) default to sale-only — a
// sensible onboarding default the dealer can flip to rental-only; hybrid (both)
// is gated by the plan (planAllowsHybrid).
const PRESETS: Record<PlanKey, PlanPreset> = {
  starter: {
    features: {
      maxCars: 25,
      maxImagesPerCar: 5,
      enableSellCar: true,
      enableRental: false,
      enableFinancing: false,
      enableWhatsApp: true,
      enableVipDelivery: false,
      enableEmailContact: true,
      enablePhoneContact: true,
      enableCarQr: false,
    },
    caps: { hybrid: false, customDomain: false, expandable: false },
  },
  pro: {
    features: {
      maxCars: 75,
      maxImagesPerCar: 8,
      enableSellCar: true,
      enableRental: true,
      enableFinancing: true,
      enableWhatsApp: true,
      enableVipDelivery: false,
      enableEmailContact: true,
      enablePhoneContact: true,
      enableCarQr: false,
    },
    caps: { hybrid: true, customDomain: true, expandable: false },
  },
  enterprise: {
    features: {
      maxCars: 200,
      maxImagesPerCar: 12,
      enableSellCar: true,
      enableRental: true,
      enableFinancing: true,
      enableWhatsApp: true,
      enableVipDelivery: true,
      enableEmailContact: true,
      enablePhoneContact: true,
      enableCarQr: true,
    },
    caps: { hybrid: true, customDomain: true, expandable: true },
  },
};

// Standard features for a plan — apply this to a NEW tenant at onboarding.
export function getPlanFeatures(plan: PlanKey): TenantFeatures {
  return { ...PRESETS[plan].features };
}

export function getPlanCapabilities(plan: PlanKey): PlanCapabilities {
  return { ...PRESETS[plan].caps };
}

export function planAllowsHybrid(plan: PlanKey): boolean {
  return PRESETS[plan].caps.hybrid;
}

export function planAllowsCustomDomain(plan: PlanKey): boolean {
  return PRESETS[plan].caps.customDomain;
}

export function planIsExpandable(plan: PlanKey): boolean {
  return PRESETS[plan].caps.expandable;
}
