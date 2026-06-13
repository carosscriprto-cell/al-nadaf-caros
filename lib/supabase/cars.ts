import { createServerClient } from "./client";

export type CarsFilter = {
  tenantId:     string;
  listingType?: 'rent' | 'sale' | 'both' | 'all';
  category?:    string;
  brand?:       string;
  class?:       string;
  fuelType?:    string;
  transmission?:string;
  condition?:   string;
  seats?:       number;
  minPrice?:    number;
  maxPrice?:    number;
  available?:   boolean;
  search?:      string;
  locale?:      'en' | 'ar';
  page?:        number;
  pageSize?:    number;
};

export async function getCars(filter: CarsFilter) {
  const supabase = createServerClient();
  const page     = filter.page ?? 1;
  const pageSize = filter.pageSize ?? 9;
  const from     = (page - 1) * pageSize;
  const to       = from + pageSize - 1;

  let query = supabase
    .from('cars')
    .select(`
      *,
      content:car_content(*)
    `, { count: 'exact' })
    .eq('tenant_id', filter.tenantId)
    .order('created_at', { ascending: false })
    .range(from, to);

  // Filters
  if (filter.available !== undefined)
    query = query.eq('available', filter.available);

  if (filter.listingType && filter.listingType !== 'all')
    query = filter.listingType === 'rent'
      ? query.in('listing_type', ['rent', 'both'])
      : filter.listingType === 'sale'
        ? query.in('listing_type', ['sale', 'both'])
        : query.eq('listing_type', filter.listingType);

  if (filter.category)     query = query.eq('category', filter.category);
  if (filter.brand)        query = query.eq('brand', filter.brand);
  if (filter.class)        query = query.eq('class', filter.class);
  if (filter.fuelType)     query = query.eq('fuel_type', filter.fuelType);
  if (filter.transmission) query = query.eq('transmission', filter.transmission);
  if (filter.condition)    query = query.eq('condition', filter.condition);
  if (filter.seats)        query = query.eq('seats', filter.seats);

  if (filter.minPrice)
    query = query.or(`price_daily.gte.${filter.minPrice},price_total.gte.${filter.minPrice}`);
  if (filter.maxPrice)
    query = query.or(`price_daily.lte.${filter.maxPrice},price_total.lte.${filter.maxPrice}`);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    cars:  data ?? [],
    total: count ?? 0,
    pages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function getCarBySlug(tenantId: string, slug: string) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('cars')
    .select(`
      *,
      content:car_content(*)
    `)
    .eq('tenant_id', tenantId)
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

export async function getFeaturedCars(tenantId: string, limit = 6) {
  const supabase = createServerClient();

  const { data } = await supabase
    .from('cars')
    .select(`*, content:car_content(*)`)
    .eq('tenant_id', tenantId)
    .eq('available', true)
    .eq('is_featured', true)
    .limit(limit);

  return data ?? [];
}