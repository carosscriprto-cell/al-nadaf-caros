'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Save, Lock, Palette, Building2, Search, Clock, Share2 } from 'lucide-react';
import { settingsSchema, type SettingsValues } from '@/lib/dashboard/settingsSchema';
import { updateTenantSettings } from '@/app/dashboard/settings/actions';
import { useDash } from '../DashboardI18n';

export default function SettingsForm({
  defaultValues,
  canEdit,
}: {
  defaultValues: SettingsValues;
  canEdit: boolean;
}) {
  const { t } = useDash();
  const st = t.st;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [savedAccent, setSavedAccent] = useState(defaultValues.color_accent);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues,
  });

  const accent = watch('color_accent');
  const primary = watch('color_primary');
  const secondary = watch('color_secondary');

  const onSubmit = (values: SettingsValues) => {
    if (!canEdit) return;
    startTransition(async () => {
      const res = await updateTenantSettings(values);
      if (res.ok) {
        toast.success(st.saved);
        setSavedAccent(values.color_accent);
        reset(values); // clears dirty state
        router.refresh();
      } else {
        toast.error(res.error === 'ONLY_OWNER' ? st.ownerOnly : res.error ?? st.saveFailed);
      }
    });
  };

  const disabled = !canEdit || pending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{st.title}</h1>
          <p className="mt-1 text-sm text-[#8a9099]">{st.subtitle}</p>
        </div>
        <button
          type="submit"
          disabled={disabled || !isDirty}
          className="flex items-center gap-2 rounded-xl bg-[#75ACE8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#75ACE8]/25 transition hover:bg-[#5f9ad9] disabled:opacity-50"
        >
          <Save size={16} /> {pending ? st.saving : st.save}
        </button>
      </div>

      {!canEdit && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Lock size={16} className="shrink-0" /> {st.ownerOnly}
        </div>
      )}

      {/* Identity */}
      <Section icon={Building2} title={st.secIdentity}>
        <Grid>
          <Field label={st.f.name} error={errors.name?.message}>
            <input {...register('name')} disabled={disabled} className={inp} />
          </Field>
          <Field label={st.f.name_ar}>
            <input {...register('name_ar')} disabled={disabled} dir="rtl" className={inp} />
          </Field>
          <Field label={st.f.phone}>
            <input {...register('phone')} disabled={disabled} dir="ltr" className={inp} />
          </Field>
          <Field label={st.f.whatsapp}>
            <input {...register('whatsapp')} disabled={disabled} dir="ltr" placeholder="+9665…" className={inp} />
          </Field>
          <Field label={st.f.email} error={errors.email?.message}>
            <input {...register('email')} disabled={disabled} dir="ltr" className={inp} />
          </Field>
        </Grid>
        <Grid>
          <Field label={st.f.address_en}>
            <input {...register('address_en')} disabled={disabled} className={inp} />
          </Field>
          <Field label={st.f.address_ar}>
            <input {...register('address_ar')} disabled={disabled} dir="rtl" className={inp} />
          </Field>
        </Grid>
      </Section>

      {/* Branding */}
      <Section icon={Palette} title={st.secBranding}>
        <div className="grid gap-4 sm:grid-cols-3">
          <ColorField label={st.f.color_primary} value={primary} onPick={(v) => setValue('color_primary', v, { shouldDirty: true })} reg={register('color_primary')} error={errors.color_primary?.message} disabled={disabled} />
          <ColorField label={st.f.color_secondary} value={secondary} onPick={(v) => setValue('color_secondary', v, { shouldDirty: true })} reg={register('color_secondary')} error={errors.color_secondary?.message} disabled={disabled} />
          <ColorField label={st.f.color_accent} value={accent} onPick={(v) => setValue('color_accent', v, { shouldDirty: true })} reg={register('color_accent')} error={errors.color_accent?.message} disabled={disabled} />
        </div>

        {/* Live accent preview — this is exactly what the storefront injects */}
        <div className="mt-4 rounded-xl border border-[#ececec] bg-[#fafbfc] p-4">
          <p className="mb-3 text-xs font-medium text-[#8a9099]">{st.livePreview}</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: accent }}>
              {st.previewButton}
            </span>
            <span className="rounded-lg border px-4 py-2 text-sm font-semibold" style={{ borderColor: accent, color: accent }}>
              {st.previewOutline}
            </span>
            {accent !== savedAccent && <span className="text-xs text-amber-600">{st.unsavedColor}</span>}
          </div>
        </div>

        <Grid>
          <Field label={st.f.logo_url} error={errors.logo_url?.message} hint={st.urlHint}>
            <input {...register('logo_url')} disabled={disabled} dir="ltr" placeholder="https://…" className={inp} />
          </Field>
          <Field label={st.f.favicon_url} error={errors.favicon_url?.message} hint={st.urlHint}>
            <input {...register('favicon_url')} disabled={disabled} dir="ltr" placeholder="https://…" className={inp} />
          </Field>
          <Field label={st.f.og_image_url} error={errors.og_image_url?.message} hint={st.urlHint}>
            <input {...register('og_image_url')} disabled={disabled} dir="ltr" placeholder="https://…" className={inp} />
          </Field>
        </Grid>
      </Section>

      {/* SEO */}
      <Section icon={Search} title={st.secSeo}>
        <Grid>
          <Field label={st.f.seo_title_en}>
            <input {...register('seo_title_en')} disabled={disabled} className={inp} />
          </Field>
          <Field label={st.f.seo_title_ar}>
            <input {...register('seo_title_ar')} disabled={disabled} dir="rtl" className={inp} />
          </Field>
        </Grid>
        <Grid>
          <Field label={st.f.seo_desc_en}>
            <textarea {...register('seo_desc_en')} disabled={disabled} rows={2} className={inp} />
          </Field>
          <Field label={st.f.seo_desc_ar}>
            <textarea {...register('seo_desc_ar')} disabled={disabled} dir="rtl" rows={2} className={inp} />
          </Field>
        </Grid>
      </Section>

      {/* Business hours */}
      <Section icon={Clock} title={st.secHours}>
        <Grid>
          <Field label={st.f.weekdays}>
            <input {...register('business_hours.weekdays')} disabled={disabled} placeholder={st.hoursPlaceholder} className={inp} />
          </Field>
          <Field label={st.f.weekends}>
            <input {...register('business_hours.weekends')} disabled={disabled} placeholder={st.hoursPlaceholder} className={inp} />
          </Field>
        </Grid>
      </Section>

      {/* Social */}
      <Section icon={Share2} title={st.secSocial}>
        <Grid>
          <Field label="Facebook" error={errors.social?.facebook?.message}>
            <input {...register('social.facebook')} disabled={disabled} dir="ltr" placeholder="https://facebook.com/…" className={inp} />
          </Field>
          <Field label="Instagram" error={errors.social?.instagram?.message}>
            <input {...register('social.instagram')} disabled={disabled} dir="ltr" placeholder="https://instagram.com/…" className={inp} />
          </Field>
          <Field label="X / Twitter" error={errors.social?.twitter?.message}>
            <input {...register('social.twitter')} disabled={disabled} dir="ltr" placeholder="https://x.com/…" className={inp} />
          </Field>
          <Field label="LinkedIn" error={errors.social?.linkedin?.message}>
            <input {...register('social.linkedin')} disabled={disabled} dir="ltr" placeholder="https://linkedin.com/…" className={inp} />
          </Field>
        </Grid>
      </Section>

      {/* Sticky-ish footer save (mirrors header) */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={disabled || !isDirty}
          className="flex items-center gap-2 rounded-xl bg-[#75ACE8] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#75ACE8]/25 transition hover:bg-[#5f9ad9] disabled:opacity-50"
        >
          <Save size={16} /> {pending ? st.saving : st.save}
        </button>
      </div>
    </form>
  );
}

const inp =
  'w-full rounded-xl border border-[#e7e8ea] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#75ACE8] focus:ring-4 focus:ring-[#75ACE8]/15 disabled:cursor-not-allowed disabled:bg-[#f7f7f7] disabled:text-[#9aa0a8]';

function Section({ icon: Icon, title, children }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#ececec] bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#75ACE8]/12 text-[#3d7cc0]">
          <Icon size={16} />
        </span>
        <h2 className="text-sm font-bold">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[#6b7178]">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-[#9aa0a8]">{hint}</p>}
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

function ColorField({
  label, value, onPick, reg, error, disabled,
}: {
  label: string;
  value: string;
  onPick: (v: string) => void;
  reg: ReturnType<ReturnType<typeof useForm<SettingsValues>>['register']>;
  error?: string;
  disabled: boolean;
}) {
  // Native color picker is permissive about value; only feed it valid hex.
  const safe = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value) ? value : '#000000';
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[#6b7178]">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={safe}
          onChange={(e) => onPick(e.target.value)}
          disabled={disabled}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-[#e7e8ea] bg-white disabled:cursor-not-allowed"
          aria-label={label}
        />
        <input {...reg} disabled={disabled} dir="ltr" className={inp} />
      </div>
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}
