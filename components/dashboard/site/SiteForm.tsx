'use client';

// components/dashboard/site/SiteForm.tsx — the Site management tab.
// Owner-edits page/button toggles (tenants.pages) + the relocated home-sections
// order/visibility control (tenants.sections). Owner-only (RLS-gated server-side;
// non-owners see a read-only banner). Server Action + zod.

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Save, Lock, FileText, LayoutList, ArrowUp, ArrowDown, Eye, EyeOff, Check, Minus,
} from 'lucide-react';
import { siteSchema, type SiteValues } from '@/lib/dashboard/siteSchema';
import { isSectionLocked, type HomeSectionKey } from '@/lib/tenant/sections';
import { updateTenantSite } from '@/app/dashboard/site/actions';
import { useDash } from '../DashboardI18n';

export default function SiteForm({
  defaultValues,
  canEdit,
  enableRental,
}: {
  defaultValues: SiteValues;
  canEdit: boolean;
  enableRental: boolean;
}) {
  const { t } = useDash();
  const st = t.st;
  const si = t.si;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isDirty },
  } = useForm<SiteValues>({ resolver: zodResolver(siteSchema), defaultValues });

  const pages = watch('pages');
  const setPage = (k: keyof SiteValues['pages'], v: boolean) =>
    setValue(`pages.${k}`, v, { shouldDirty: true });

  const sections = watch('sections') ?? [];
  const setSections = (next: SiteValues['sections']) => setValue('sections', next, { shouldDirty: true });
  const moveSection = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= sections.length) return;
    const next = [...sections];
    [next[i], next[j]] = [next[j], next[i]];
    setSections(next);
  };
  const toggleSection = (i: number) =>
    setSections(sections.map((s, idx) => (idx === i ? { ...s, enabled: !s.enabled } : s)));

  const onSubmit = (values: SiteValues) => {
    if (!canEdit) return;
    startTransition(async () => {
      const res = await updateTenantSite(values);
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{si.title}</h1>
          <p className="mt-1 text-sm text-[#8a9099]">{si.subtitle}</p>
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

      {/* Pages & buttons */}
      <Section icon={FileText} title={si.secPages} hint={si.pagesHint}>
        <ToggleRow
          label={si.aboutPage} hint={si.aboutHint}
          checked={pages.about} onChange={(v) => setPage('about', v)} disabled={disabled}
        />
        <ToggleRow
          label={si.leadAvailability} hint={si.leadAvailabilityHint}
          checked={pages.leadAvailability} onChange={(v) => setPage('leadAvailability', v)} disabled={disabled}
        />
        <ToggleRow
          label={si.leadViewing} hint={si.leadViewingHint}
          checked={pages.leadViewing} onChange={(v) => setPage('leadViewing', v)} disabled={disabled}
        />

        {/* Auto-gated (read-only) — controlled by the rental feature flag */}
        <div className="mt-1 border-t border-[#f0f1f3] pt-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#b3b8bf]">{si.autoTitle}</p>
          <AutoRow label={si.servicesPage} on={enableRental} si={si} />
          <AutoRow label={si.bookingFlow} on={enableRental} si={si} />
        </div>
      </Section>

      {/* Home sections — relocated from Settings */}
      <Section icon={LayoutList} title={st.secSections} hint={st.sectionsHint}>
        <div className="space-y-2">
          {sections.map((s, i) => {
            const locked = isSectionLocked(s.key as HomeSectionKey);
            return (
              <div
                key={s.key}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                  s.enabled ? 'border-[#ececec] bg-white' : 'border-[#f0f0f0] bg-[#fafbfc] opacity-70'
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <button type="button" onClick={() => moveSection(i, -1)} disabled={disabled || i === 0} aria-label={st.moveUp}
                    className="rounded p-0.5 text-[#9aa0a8] transition hover:bg-[#f0f1f3] hover:text-[#1a1d21] disabled:opacity-30">
                    <ArrowUp size={14} />
                  </button>
                  <button type="button" onClick={() => moveSection(i, 1)} disabled={disabled || i === sections.length - 1} aria-label={st.moveDown}
                    className="rounded p-0.5 text-[#9aa0a8] transition hover:bg-[#f0f1f3] hover:text-[#1a1d21] disabled:opacity-30">
                    <ArrowDown size={14} />
                  </button>
                </div>

                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#75ACE8]/10 text-[11px] font-bold text-[#3d7cc0]">
                  {i + 1}
                </span>

                <span className="flex-1 text-sm font-medium">{st.sectionLabels[s.key] ?? s.key}</span>

                {locked ? (
                  <span className="text-[11px] text-[#9aa0a8]">{st.sectionLocked}</span>
                ) : (
                  <button type="button" onClick={() => toggleSection(i)} disabled={disabled} aria-pressed={s.enabled}
                    className="flex items-center gap-1.5 rounded-lg border border-[#e7e8ea] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#6b7178] transition hover:border-[#75ACE8]/40 disabled:opacity-50">
                    {s.enabled ? <Eye size={14} className="text-emerald-500" /> : <EyeOff size={14} className="text-[#b3b8bf]" />}
                    {s.enabled ? '' : st.sectionHidden}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Section>

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

function Section({ icon: Icon, title, hint, children }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#ececec] bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
      <div className="mb-1 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#75ACE8]/12 text-[#3d7cc0]">
          <Icon size={16} />
        </span>
        <h2 className="text-sm font-bold">{title}</h2>
      </div>
      {hint && <p className="mb-4 ms-10 text-xs text-[#9aa0a8]">{hint}</p>}
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

function ToggleRow({ label, hint, checked, onChange, disabled }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void; disabled: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#ececec] px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#3a3f45]">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-[#9aa0a8]">{hint}</p>}
      </div>
      <Switch checked={checked} onChange={onChange} disabled={disabled} label={label} />
    </div>
  );
}

function Switch({ checked, onChange, disabled, label }: { checked: boolean; onChange: (v: boolean) => void; disabled: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50 ${checked ? 'bg-[#75ACE8]' : 'bg-[#d7dbe0]'}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${checked ? 'ltr:translate-x-[22px] rtl:-translate-x-[22px]' : 'ltr:translate-x-0.5 rtl:-translate-x-0.5'}`} />
    </button>
  );
}

// Read-only state for auto-gated journeys (driven by the rental feature flag).
function AutoRow({ label, on, si }: { label: string; on: boolean; si: { autoOn: string; autoOff: string } }) {
  return (
    <div className="flex items-center justify-between gap-4 px-1 py-1.5">
      <span className="text-sm text-[#6b7178]">{label}</span>
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${on ? 'bg-emerald-50 text-emerald-700' : 'bg-[#f0f1f3] text-[#9aa0a8]'}`}>
        {on ? <Check size={12} /> : <Minus size={12} />} {on ? si.autoOn : si.autoOff}
      </span>
    </div>
  );
}
