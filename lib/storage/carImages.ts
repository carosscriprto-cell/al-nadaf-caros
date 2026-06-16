// lib/storage/carImages.ts — client-side car image helpers (compression +
// Supabase Storage upload/delete). Browser-only (canvas + browser supabase
// client). Compression runs in the BROWSER so Vercel serverless limits don't
// apply and uploads are small.

import type { SupabaseClient } from '@supabase/supabase-js';

export const CAR_IMAGES_BUCKET = 'car-images';
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_SOURCE_BYTES = 15 * 1024 * 1024; // 15MB pre-compression guard

// Resize (max dimension) + convert to WebP via canvas.
export async function compressImageToWebP(
  file: File,
  maxDim = 1920,
  quality = 0.8,
): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;
  if (width > maxDim || height > maxDim) {
    const scale = maxDim / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', quality),
  );
  if (!blob) throw new Error('Compression failed');
  return { blob, width, height };
}

export function validateSourceFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return 'type';
  if (file.size > MAX_SOURCE_BYTES) return 'size';
  return null;
}

function path(tenantId: string, carId: string, filename: string) {
  return `${tenantId}/cars/${carId}/${filename}`;
}

// Upload a compressed WebP blob → returns its public URL.
export async function uploadCarImage(
  client: SupabaseClient,
  tenantId: string,
  carId: string,
  blob: Blob,
): Promise<string> {
  const filename = `${crypto.randomUUID()}.webp`;
  const objectPath = path(tenantId, carId, filename);
  const { error } = await client.storage
    .from(CAR_IMAGES_BUCKET)
    .upload(objectPath, blob, { contentType: 'image/webp', upsert: false });
  if (error) throw error;
  const { data } = client.storage.from(CAR_IMAGES_BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}

// Recover the storage object path from a public URL (for deletion).
export function storagePathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${CAR_IMAGES_BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : url.slice(i + marker.length);
}

export async function deleteCarImageByUrl(client: SupabaseClient, url: string): Promise<void> {
  const objectPath = storagePathFromPublicUrl(url);
  if (!objectPath) return; // not a managed storage URL (e.g. legacy local path)
  await client.storage.from(CAR_IMAGES_BUCKET).remove([objectPath]);
}
