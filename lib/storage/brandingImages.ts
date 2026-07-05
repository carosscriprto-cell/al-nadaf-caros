// lib/storage/brandingImages.ts — tenant branding image uploads (logo/favicon).
// Reuses the SAME `car-images` bucket: its RLS keys on the FIRST path segment
// (= tenant_id), not on `/cars/`, so `{tenant_id}/branding/…` is covered by the
// existing tenant-scoped write policies + public read — no new bucket/policy.
// Browser-only (compression runs on canvas).

import type { SupabaseClient } from '@supabase/supabase-js';
import { safeRandomUUID } from '@/lib/utils/uuid';
import { CAR_IMAGES_BUCKET } from './carImages';

export type BrandingKind = 'logo' | 'logo_dark' | 'favicon' | 'hero';

export async function uploadBrandingImage(
  client: SupabaseClient,
  tenantId: string,
  kind: BrandingKind,
  blob: Blob,
): Promise<string> {
  const objectPath = `${tenantId}/branding/${kind}-${safeRandomUUID()}.webp`;
  const { error } = await client.storage
    .from(CAR_IMAGES_BUCKET)
    .upload(objectPath, blob, { contentType: 'image/webp', upsert: false });
  if (error) throw error;
  const { data } = client.storage.from(CAR_IMAGES_BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}
