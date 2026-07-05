'use client';

// components/dashboard/site/ContentForm.tsx — per-tenant editable section text.
// Bilingual (en/ar side by side), collapsible per section. Owner-only. Empty
// fields fall back to the static i18n defaults on the storefront. Server Action
// + zod (updateTenantContent).

import { useEffect, useTransition } from 'react';
import {
  useForm,
  useFieldArray,
  type UseFormRegister,
  type Control,
  type FieldPath,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Lock, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { contentSchema, type ContentValues } from '@/lib/dashboard/contentSchema';
import { WHY_ITEMS, HOW_STEPS, MAX_FAQ } from '@/lib/tenant/content';
import { updateTenantContent } from '@/app/(system)/dashboard/site/contentActions';
import { useDash } from '../DashboardI18n';
import type { EditorArea, FormMeta } from './SiteEditor';

type Reg = UseFormRegister<ContentValues>;
type Path = FieldPath<ContentValues>;
const LANGS = ['en', 'ar'] as const;

export default function ContentForm({
  defaultValues,
  canEdit,
  enableFinancing,
  area,
  formId,
  onMeta,
}: {
  defaultValues: ContentValues;
  canEdit: boolean;
  enableFinancing: boolean;
  // Editor split (layout only): home content vs the About sub-page. Both stay
  // mounted so react-hook-form retains every field and one submit still writes
  // the full tenants.content object.
  area: EditorArea;
  formId: string;
  onMeta: (meta: FormMeta) => void;
}) {
  const { t } = useDash();
  const st = t.st;
  const ci = t.ci;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    control,
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

  // Surface dirty/pending to the SiteEditor's shared sticky save bar.
  useEffect(() => {
    onMeta({ isDirty, pending });
  }, [isDirty, pending, onMeta]);

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Home-sections area — hero + section content + banners + FAQ */}
      {area === 'home' && (
        <div className="space-y-4">
          {/* Hero — badge + headline + sub-headline (all optional overrides) */}
          <Collapsible title={ci.secHero}>
            <DefaultHint text={ci.defaultHint} />
            <div className="grid gap-5 lg:grid-cols-2">
              {LANGS.map((lang) => (
                <div key={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className="space-y-3">
                  <LangTag label={lang === 'ar' ? ci.langAr : ci.langEn} />
                  <Field label={ci.fBadge}>
                    <input {...register(`hero.${lang}.badge` as Path)} disabled={disabled} className={inp} />
                  </Field>
                  <Field label={ci.fHeadline1}>
                    <input {...register(`hero.${lang}.headline.line1` as Path)} disabled={disabled} className={inp} />
                  </Field>
                  <Field label={ci.fHeadline2}>
                    <input {...register(`hero.${lang}.headline.line2` as Path)} disabled={disabled} className={inp} />
                  </Field>
                  <Field label={ci.fSubheadline}>
                    <textarea {...register(`hero.${lang}.subheadline` as Path)} disabled={disabled} rows={2} className={inp} />
                  </Field>
                </div>
              ))}
            </div>
          </Collapsible>

          <SectionEditor base="whyChooseUs" title={ci.secWhy} itemCount={WHY_ITEMS} itemLabel={ci.fItem} register={register} disabled={disabled} ci={ci} />
          <SectionEditor base="howItWorks" title={ci.secHow} itemCount={HOW_STEPS} itemLabel={ci.fStep} register={register} disabled={disabled} ci={ci} />

          {/* Financing + Final CTA banners — title + description + button label.
              Financing is locked (with a hint) when the plan has no financing — it
              can't appear on the storefront, so its copy isn't editable. Saved copy
              is preserved (round-trips via defaultValues; the inputs are hidden). */}
          <CtaEditor
            base="financing"
            title={ci.secFinancing}
            register={register}
            disabled={disabled}
            ci={ci}
            lockedHint={enableFinancing ? undefined : st.sectionGatedFinancing}
          />
          <CtaEditor base="finalCta" title={ci.secFinalCta} register={register} disabled={disabled} ci={ci} />

          {/* FAQ — dynamic q/a rows per language (shared dealer set, H2c) */}
          <Collapsible title={ci.secFaq}>
            <DefaultHint text={ci.defaultHint} />
            <div className="grid gap-5 lg:grid-cols-2">
              {LANGS.map((lang) => (
                <FaqLangList
                  key={lang}
                  lang={lang}
                  control={control}
                  register={register}
                  disabled={disabled}
                  ci={ci}
                />
              ))}
            </div>
          </Collapsible>
        </div>
      )}

      {/* Sub-pages area — About page copy */}
      {area === 'subpages' && (
        <div className="space-y-4">
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
        </div>
      )}
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

// Financing / Final-CTA banners share the same shape (title + desc + cta). When
// `lockedHint` is set the section is feature-gated off the storefront, so we show
// the hint instead of inputs (saved copy is preserved via the form's defaultValues).
function CtaEditor({
  base, title, register, disabled, ci, lockedHint,
}: {
  base: 'financing' | 'finalCta';
  title: string;
  register: Reg;
  disabled: boolean;
  ci: Ci;
  lockedHint?: string;
}) {
  if (lockedHint) {
    return (
      <Collapsible title={title}>
        <LockedNotice text={lockedHint} />
      </Collapsible>
    );
  }
  return (
    <Collapsible title={title}>
      <DefaultHint text={ci.defaultHint} />
      <div className="grid gap-5 lg:grid-cols-2">
        {LANGS.map((lang) => (
          <div key={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className="space-y-3">
            <LangTag label={lang === 'ar' ? ci.langAr : ci.langEn} />
            <Field label={ci.fTitle}>
              <input {...register(`${base}.${lang}.title` as Path)} disabled={disabled} className={inp} />
            </Field>
            <Field label={ci.fDesc}>
              <textarea {...register(`${base}.${lang}.desc` as Path)} disabled={disabled} rows={2} className={inp} />
            </Field>
            <Field label={ci.fButton}>
              <input {...register(`${base}.${lang}.cta` as Path)} disabled={disabled} className={inp} />
            </Field>
          </div>
        ))}
      </div>
    </Collapsible>
  );
}

// One language column of the shared dealer FAQ — dynamic q/a rows (useFieldArray),
// capped at MAX_FAQ. Empty list = storefront falls back to the type-aware default.
function FaqLangList({
  lang, control, register, disabled, ci,
}: {
  lang: (typeof LANGS)[number];
  control: Control<ContentValues>;
  register: Reg;
  disabled: boolean;
  ci: Ci;
}) {
  // en/ar rows share an identical shape; cast the dynamic name to one concrete path.
  const { fields, append, remove } = useFieldArray({ control, name: `faq.${lang}` as 'faq.en' });
  const atMax = fields.length >= MAX_FAQ;

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="space-y-3">
      <LangTag label={lang === 'ar' ? ci.langAr : ci.langEn} />

      {fields.length === 0 && <p className="text-[11px] text-[#9aa0a8]">{ci.faqEmpty}</p>}

      {fields.map((field, i) => (
        <div key={field.id} className="space-y-2 rounded-xl border border-[#f0f1f3] bg-[#fafbfc] p-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-[#9aa0a8]">{ci.faqRow} {i + 1}</p>
            <button
              type="button"
              onClick={() => remove(i)}
              disabled={disabled}
              className="flex items-center gap-1 text-[11px] font-medium text-[#c0504d] transition hover:text-[#a13c39] disabled:opacity-50"
            >
              <Trash2 size={13} /> {ci.faqRemove}
            </button>
          </div>
          <input
            {...register(`faq.${lang}.${i}.q` as Path)}
            disabled={disabled}
            placeholder={ci.fQuestion}
            className={inp}
          />
          <textarea
            {...register(`faq.${lang}.${i}.a` as Path)}
            disabled={disabled}
            rows={2}
            placeholder={ci.fAnswer}
            className={inp}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ q: '', a: '' })}
        disabled={disabled || atMax}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#d4d6d9] py-2 text-xs font-semibold text-[#6b7178] transition hover:border-[#75ACE8] hover:text-[#3d7cc0] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus size={14} /> {ci.faqAdd}
      </button>
      {atMax && <p className="text-[11px] text-[#9aa0a8]">{ci.faqMax}</p>}
    </div>
  );
}

function DefaultHint({ text }: { text: string }) {
  return <p className="mb-4 text-[11px] text-[#9aa0a8]">{text}</p>;
}

// Shown in place of a section's editor when the section is feature-gated off the
// storefront (e.g. financing on a plan without it). No inputs → nothing to edit.
function LockedNotice({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[#ececec] bg-[#fafbfc] px-4 py-3 text-xs text-[#9aa0a8]">
      <Lock size={14} className="shrink-0" /> {text}
    </div>
  );
}

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
