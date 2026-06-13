import { createServerClient } from "./client";

export async function getTenantByDomain(domain: string) {
  const supabase = createServerClient();

  // جرب custom domain أولاً
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .or(`domain.eq.${domain},subdomain.eq.${domain}`)
    .eq('active', true)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getTenantBySlug(slug: string) {
  const supabase = createServerClient();

  const { data } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single();

  return data;
}