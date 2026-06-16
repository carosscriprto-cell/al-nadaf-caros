-- ============================================================================
-- Phase 5a · Storage RLS for the `car-images` bucket
-- ============================================================================
-- Path convention: {tenant_id}/cars/{car_id}/{filename}
--   → (storage.foldername(name))[1] is the tenant_id segment.
--
-- Model mirrors the table RLS (my_tenant_id()):
--   * authenticated tenant may INSERT/UPDATE/DELETE ONLY within its own
--     {tenant_id}/ path → a tenant cannot touch another tenant's objects.
--   * public (anon) may SELECT (storefront display). The bucket is also marked
--     public, so object URLs are served via the CDN; this policy makes the
--     intent explicit for the authenticated/anon API path too.
--
-- storage.objects already has RLS enabled by Supabase. Idempotent.
-- Apply in the Supabase SQL editor (review first).
-- ============================================================================

drop policy if exists "car-images: public read" on storage.objects;
create policy "car-images: public read"
  on storage.objects for select to public
  using ( bucket_id = 'car-images' );

drop policy if exists "car-images: tenant insert own path" on storage.objects;
create policy "car-images: tenant insert own path"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'car-images'
    and (storage.foldername(name))[1] = (select public.my_tenant_id())::text
  );

drop policy if exists "car-images: tenant update own path" on storage.objects;
create policy "car-images: tenant update own path"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'car-images'
    and (storage.foldername(name))[1] = (select public.my_tenant_id())::text
  )
  with check (
    bucket_id = 'car-images'
    and (storage.foldername(name))[1] = (select public.my_tenant_id())::text
  );

drop policy if exists "car-images: tenant delete own path" on storage.objects;
create policy "car-images: tenant delete own path"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'car-images'
    and (storage.foldername(name))[1] = (select public.my_tenant_id())::text
  );
