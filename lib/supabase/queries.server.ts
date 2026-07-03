// lib/supabase/queries.server.ts
// ─────────────────────────────────────────────────────────────
// Server-side data fetching — يُستخدم في Server Components فقط
// كل دالة مُغلَّفة بـ cache() لضمان استدعاء واحد لكل request
// ─────────────────────────────────────────────────────────────

import { cache } from 'react';
import { createPublicServerClient } from './client';
import { getTenantId, getStorefrontFeatures } from './getTenant';
import { mapDbCarToCar, buildContentMap } from './mappers';
import { storefrontListingTypes } from '@/lib/tenant/features';
import type { Car, CarContentMap } from '@/types/vehicles';

// Listing types the storefront may show for this tenant. null = no restriction
// (hybrid). Single-type tenants never surface the other type anywhere.
const getVisibleTypes = cache(async () => storefrontListingTypes(await getStorefrontFeatures()));

// ─── getCarsWithContent ───────────────────────────────────────
// يجلب كل السيارات + المحتوى بـ locale محدد
// مُخزَّن في cache لكل request — لا يُستدعى مرتين في نفس الصفحة

export const getCarsWithContent = cache(
  async (locale: 'en' | 'ar' = 'en'): Promise<{
    cars: Car[];
    contentMap: CarContentMap;
  }> => {
    const supabase  = createPublicServerClient();
    const tenantId  = await getTenantId();

    // جلب السيارات والمحتوى في طلب واحد
    const types = await getVisibleTypes();
    let q = supabase
      .from('cars')
      .select(`*, car_content(*)`)
      .eq('tenant_id', tenantId)
      .eq('available', true);
    if (types) q = q.in('listing_type', types);
    const { data: carsData, error: carsError } = await q
      .order('is_featured', { ascending: false })
      .order('created_at',  { ascending: false });

    if (carsError) throw carsError;
    if (!carsData)  return { cars: [], contentMap: {} };

    // فصل السيارات عن المحتوى
    const cars        = carsData.map(mapDbCarToCar);
    const allContent  = carsData.flatMap(c => c.car_content ?? []);
    const contentMap  = buildContentMap(carsData, allContent, locale);

    return { cars, contentMap };
  }
);

// ─── getCarBySlug ─────────────────────────────────────────────
// يجلب سيارة واحدة بالـ slug — لصفحة التفاصيل

export const getCarBySlug = cache(
  async (
    slug:   string,
    locale: 'en' | 'ar' = 'en'
  ): Promise<{
    car:        Car | null;
    contentMap: CarContentMap;
  }> => {
    const supabase = createPublicServerClient();
    const tenantId = await getTenantId();

    const { data, error } = await supabase
      .from('cars')
      .select(`
        *,
        car_content(*)
      `)
      .eq('tenant_id', tenantId)
      .eq('slug', slug)
      .eq('available', true) // public storefront sees available cars only
      .single();

    if (error || !data) return { car: null, contentMap: {} };

    const car        = mapDbCarToCar(data);
    const allContent = data.car_content ?? [];
    const contentMap = buildContentMap([data], allContent, locale);

    return { car, contentMap };
  }
);

// ─── getFeaturedCars ──────────────────────────────────────────
// للـ FeaturedCarsSection في الـ home page

export const getFeaturedCars = cache(
  async (
    locale: 'en' | 'ar' = 'en',
    limit = 6
  ): Promise<{
    cars:       Car[];
    contentMap: CarContentMap;
  }> => {
    const supabase = createPublicServerClient();
    const tenantId = await getTenantId();

    const types = await getVisibleTypes();
    let q = supabase
      .from('cars')
      .select(`*, car_content(*)`)
      .eq('tenant_id',  tenantId)
      .eq('available',  true)
      .eq('is_featured', true);
    if (types) q = q.in('listing_type', types);
    const { data, error } = await q
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return { cars: [], contentMap: {} };

    const cars       = data.map(mapDbCarToCar);
    const allContent = data.flatMap(c => c.car_content ?? []);
    const contentMap = buildContentMap(data, allContent, locale);

    return { cars, contentMap };
  }
);

// ─── getSimilarCars ───────────────────────────────────────────
// للـ FleetDetailClient — سيارات مشابهة

export const getSimilarCars = cache(
  async (
    currentCar: Car,
    locale:     'en' | 'ar' = 'en',
    limit = 3
  ): Promise<{
    cars:       Car[];
    contentMap: CarContentMap;
  }> => {
    const supabase = createPublicServerClient();
    const tenantId = await getTenantId();

    const types = await getVisibleTypes();
    let q = supabase
      .from('cars')
      .select(`*, car_content(*)`)
      .eq('tenant_id', tenantId)
      .eq('available',  true)
      .neq('id', String(currentCar.id))
      .or(
        `category.eq.${currentCar.category},class.eq.${currentCar.class}`
      );
    if (types) q = q.in('listing_type', types);
    const { data, error } = await q.limit(limit * 2); // نجلب أكثر ثم نرتب

    if (error || !data) return { cars: [], contentMap: {} };

    // ترتيب حسب التشابه (نفس منطق page.tsx الحالي)
    const scored = data
      .map(row => {
        let score = 0;
        if (row.listing_type === currentCar.listingType) score += 8;
        else if (
          row.listing_type === 'both' ||
          currentCar.listingType === 'both'
        ) score += 5;
        if (row.brand    === currentCar.brand)    score += 4;
        if (row.category === currentCar.category) score += 2;
        if (row.class    === currentCar.class)    score += 1;
        return { row, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(x => x.row);

    const cars       = scored.map(mapDbCarToCar);
    const allContent = scored.flatMap(c => c.car_content ?? []);
    const contentMap = buildContentMap(scored, allContent, locale);

    return { cars, contentMap };
  }
);

// ─── getFinanceableCars ───────────────────────────────────────
// For the standalone financing page (V2). Same tenant + visibility scoping as the
// other storefront queries (tenant_id, available, storefrontListingTypes), plus
// is_financeable = true. Cards read downPayment (← cars.down_payment) and
// installmentMonthly (← cars.installment_monthly) from the mapped Car.

export const getFinanceableCars = cache(
  async (locale: 'en' | 'ar' = 'en'): Promise<{
    cars:       Car[];
    contentMap: CarContentMap;
  }> => {
    const supabase = createPublicServerClient();
    const tenantId = await getTenantId();

    const types = await getVisibleTypes();
    let q = supabase
      .from('cars')
      .select(`*, car_content(*)`)
      .eq('tenant_id', tenantId)
      .eq('available', true)
      .eq('is_financeable', true);
    if (types) q = q.in('listing_type', types);
    const { data, error } = await q
      .order('is_featured', { ascending: false })
      .order('created_at',  { ascending: false });

    if (error || !data) return { cars: [], contentMap: {} };

    const cars       = data.map(mapDbCarToCar);
    const allContent = data.flatMap(c => c.car_content ?? []);
    const contentMap = buildContentMap(data, allContent, locale);

    return { cars, contentMap };
  }
);

// ─── getAllCarsForSearch ───────────────────────────────────────
// للـ search layer — يجلب كل السيارات بدون pagination
// يُستخدم في HomeVehicleSearchForm و CarsListingPage

export const getAllCarsForSearch = cache(
  async (locale: 'en' | 'ar' = 'en'): Promise<{
    cars:       Car[];
    contentMap: CarContentMap;
    contentAr:  CarContentMap;
    contentEn:  CarContentMap;
  }> => {
    const supabase = createPublicServerClient();
    const tenantId = await getTenantId();

    const types = await getVisibleTypes();
    let q = supabase
      .from('cars')
      .select(`*, car_content(*)`)
      .eq('tenant_id', tenantId)
      .eq('available', true); // public storefront sees available cars only
    if (types) q = q.in('listing_type', types);
    const { data, error } = await q.order('is_featured', { ascending: false });

    if (error || !data) {
      return { cars: [], contentMap: {}, contentAr: {}, contentEn: {} };
    }

    const cars       = data.map(mapDbCarToCar);
    const allContent = data.flatMap(c => c.car_content ?? []);

    // نبني map للـ locale الحالي + كلا اللغتين للـ search index
    const contentMap = buildContentMap(data, allContent, locale);
    const contentAr  = buildContentMap(data, allContent, 'ar');
    const contentEn  = buildContentMap(data, allContent, 'en');

    return { cars, contentMap, contentAr, contentEn };
  }
);