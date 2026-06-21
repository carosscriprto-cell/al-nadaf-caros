'use client';

// components/dashboard/site/ContentForm.tsx — per-tenant editable section text.
// Bilingual (en/ar side by side), collapsible per section. Owner-only. Empty
// fields fall back to the static i18n defaults on the storefront. Server Action
// + zod (updateTenantContent).

import { useTransition } from 'react';
import { useForm, type UseFormRegister, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Save, Lock, FileEdit, ChevronDown } from 'lucide-react';
import { contentSchema, type ContentValues } from '@/lib/dashboard/contentSchema';
import { WHY_ITEMS, HOW_STEPS } from '@/lib/tenant/content';
import { updateTenantContent } from '@/app/dashboard/site/contentActions';
import { useDash } from '../DashboardI18n';

type Reg = UseFormRegister<ContentValues>;
type Path = FieldPath<ContentValues>;
const LANGS = ['en', 'ar'] as const;

export default function ContentForm({
  defaultValues,
  canEdit,
}: {
  defaultValues: ContentValues;
  canEdit: boolean;
}) {
  const { t } = useDash();
  const st = t.st;
  const ci = t.ci;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<ContentValues>({ resolver: zodResolver(contentSchema), defaultValues });

  const onSubmit = (values: ContentValues) => {
    if (!canEdit) return;
    startTransition(async () => {
      const res = await updateTenantContent(values);
      if (res.ok) {
        toast.success(st.saved);
        reset(values);
        router.refresh();
      } else {
        toast.error(res.error === 'ONLY_OWNER' ? st.ownerOnly : res.error ?? st.saveFailed);
      }
    });
  };

  const disabled = !canEdit || pending;
  const SaveBtn = (
    <button
      type="submit"
      disabled={disabled || !isDirty}
      className="flex items-center gap-2 rounded-xl bg-[#75ACE8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#75ACE8]/25 transition hover:bg-[#5f9ad9] disabled:opacity-50"
    >
      <Save size={16} /> {pending ? st.saving : st.save}
    </button>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto mt-8 max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#75ACE8]/12 text-[#3d7cc0]">
            <FileEdit size={16} />
          </span>
          <div>
            <h2 className="text-sm font-bold">{ci.heading}</h2>
            <p className="text-xs text-[#9aa0a8]">{ci.hint}</p>
          </div>
        </div>
        {SaveBtn}
      </div>

      {!canEdit && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Lock size={16} className="shrink-0" /> {st.ownerOnly}
        </div>
      )}

      <SectionEditor base="whyChooseUs" title={ci.secWhy} itemCount={WHY_ITEMS} itemLabel={ci.fItem} register={register} disabled={disabled} ci={ci} />
      <SectionEditor base="howItWorks" title={ci.secHow} itemCount={HOW_STEPS} itemLabel={ci.fStep} register={register} disabled={disabled} ci={ci} />

      {/* About — heading + body paragraphs */}
      <Collapsible title={ci.secAbout}>
        <div className="grid gap-5 lg:grid-cols-2">
          {LANGS.map((lang) => (
            <div key={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className="space-y-3">
              <LangTag label={lang === 'ar' ? ci.langAr : ci.langEn} />
              <Field label={ci.fHeading}>
                <input {...register(`about.${lang}.heading` as Path)} disabled={disabled} className={inp} />
              </Field>
              <Field label={ci.fBody} hint={ci.bodyHint}>
                <textarea {...register(`about.${lang}.body` as Path)} disabled={disabled} rows={6} className={inp} />
              </Field>
            </div>
          ))}
        </div>
      </Collapsible>

      <div className="flex justify-end">{SaveBtn}</div>
    </form>
  );
}

function SectionEditor({
  base, title, itemCount, itemLabel, register, disabled, ci,
}: {
  base: 'whyChooseUs' | 'howItWorks';
  title: string;
  itemCount: number;
  itemLabel: string;
  register: Reg;
  disabled: boolean;
  ci: Ci;
}) {
  return (
    <Collapsible title={title}>
      <div className="grid gap-5 lg:grid-cols-2">
        {LANGS.map((lang) => (
          <div key={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className="space-y-3">
            <LangTag label={lang === 'ar' ? ci.langAr : ci.langEn} />
            <Field label={ci.fHeading}>
              <input {...register(`${base}.${lang}.title` as Path)} disabled={disabled} className={inp} />
            </Field>
            <Field label={ci.fDescription}>
              <textarea {...register(`${base}.${lang}.description` as Path)} disabled={disabled} rows={2} className={inp} />
            </Field>
            <div className="space-y-2 border-t border-[#f0f1f3] pt-3">
              {Array.from({ length: itemCount }).map((_, i) => (
                <div key={i} className="space-y-2 rounded-xl border border-[#f0f1f3] bg-[#fafbfc] p-3">
                  <p className="text-[11px] font-semibold text-[#9aa0a8]">{itemLabel} {i + 1}</p>
                  <input {...register(`${base}.${lang}.items.${i}.title` as Path)} disabled={disabled} placeholder={ci.fItemTitle} className={inp} />
                  <textarea {...register(`${base}.${lang}.items.${i}.text` as Path)} disabled={disabled} rows={2} placeholder={ci.fItemText} className={inp} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Collapsible>
  );
}

type Ci = ReturnType<typeof useDash>['t']['ci'];

const inp =
  'w-full rounded-xl border border-[#e7e8ea] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#75ACE8] focus:ring-4 focus:ring-[#75ACE8]/15 disabled:cursor-not-allowed disabled:bg-[#f7f7f7] disabled:text-[#9aa0a8]';

function Collapsible({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group overflow-hidden rounded-2xl border border-[#ececec] bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className="text-sm font-bold">{title}</span>
        <ChevronDown size={16} className="text-[#9aa0a8] transition group-open:rotate-180" />
      </summary>
      <div className="border-t border-[#f0f1f3] p-5">{children}</div>
    </details>
  );
}

function LangTag({ label }: { label: string }) {
  return <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#b3b8bf]">{label}</p>;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[#6b7178]">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-[#9aa0a8]">{hint}</p>}
    </div>
  );
}
