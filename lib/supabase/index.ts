// lib/supabase/index.ts — بدّله بهذا
export { createServerClient, createBrowserClient } from './client';
export { getTenantByDomain, getTenantBySlug }      from './tenant';

// الجديد
export { getTenantId, getTenantConfig }  from './getTenant';
export {
  getCarsWithContent,
  getAllCarsForSearch,
  getSimilarCars,
  getCarBySlug as getCarBySlugWithContent,
  getFeaturedCars as getFeaturedCarsWithContent,
} from './queries.server';
export { mapDbCarToCar, buildContentMap } from './mappers';