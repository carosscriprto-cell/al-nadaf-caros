'use client';

// components/dashboard/site/SiteEditor.tsx — layout shell for the Site editor.
// Splits the editor into two labeled areas (tabs) — "Home page sections" and
// "Sub-pages" — and coordinates ONE sticky "Save changes" bar across the two
// underlying forms. No business-logic/gating change: SiteForm still writes
// tenants.sections + tenants.pages (updateTenantSite) and ContentForm still
// writes tenants.content (updateTenantContent). Both forms stay mounted so
// react-hook-form retains every value across tab switches; a save submits only
// the dirty form(s).

import { useCallback, useState } from 'react';
import { Lock, LayoutList, FileText, Save } from 'lucide-react';
import type { SiteValues } from '@/lib/dashboard/siteSchema';
import type { ContentValues } from '@/lib/dashboard/contentSchema';
import { useDash } from '../DashboardI18n';
import StickyActionBar from '../StickyActionBar';
import SiteForm from './SiteForm';
import ContentForm from './ContentForm';

export type EditorArea = 'home' | 'subpages';
export type FormMeta = { isDirty: boolean; pending: boolean };

export default function SiteEditor({
  siteDefaults,
  contentDefaults,
  canEdit,
  enableRental,
  enableFinancing,
}: {
  siteDefaults: SiteValues;
  contentDefaults: ContentValues;
  canEdit: boolean;
  enableRental: boolean;
  enableFinancing: boolean;
}) {
  const { t } = useDash();
  const st = t.st;
  const si = t.si;

  const [area, setArea] = useState<EditorArea>('home');
  const [siteMeta, setSiteMeta] = useState<FormMeta>({ isDirty: false, pending: false });
  const [contentMeta, setContentMeta] = useState<FormMeta>({ isDirty: false, pending: false });

  const onSiteMeta = useCallback((m: FormMeta) => setSiteMeta(m), []);
  const onContentMeta = useCallback((m: FormMeta) => setContentMeta(m), []);

  const anyDirty = siteMeta.isDirty || contentMeta.isDirty;
  const anyPending = siteMeta.pending || contentMeta.pending;

  // One button, both underlying forms. Submit only what changed so nothing is
  // written needlessly (each requestSubmit runs that form's own zod + action).
  const saveAll = () => {
    if (!canEdit) return;
    if (siteMeta.isDirty)
      (document.getElementById('site-form') as HTMLFormElement | null)?.requestSubmit();
    if (contentMeta.isDirty)
      (document.getElementById('content-form') as HTMLFormElement | null)?.requestSubmit();
  };

  const tabs: { key: EditorArea; label: string; icon: typeof LayoutList }[] = [
    { key: 'home', label: st.areaHome, icon: LayoutList },
    { key: 'subpages', label: st.areaSubpages, icon: FileText },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-24 lg:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{si.title}</h1>
        <p className="mt-1 text-sm text-[#8a9099]">{si.subtitle}</p>
      </div>

      {!canEdit && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Lock size={16} className="shrink-0" /> {st.ownerOnly}
        </div>
      )}

      {/* Shared sticky save — top on desktop, bottom on mobile */}
      <StickyActionBar>
        {anyDirty && (
          <span className="me-auto text-xs font-semibold text-[#c07f2e]">{st.unsavedColor}</span>
        )}
        <button
          type="button"
          onClick={saveAll}
          disabled={!canEdit || anyPending || !anyDirty}
          className="flex items-center gap-2 rounded-xl bg-[#75ACE8] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#75ACE8]/25 transition hover:bg-[#5f9ad9] disabled:opacity-50"
        >
          <Save size={16} /> {anyPending ? st.saving : st.save}
        </button>
      </StickyActionBar>

      {/* Area tabs */}
      <div>
        <div className="flex gap-1 rounded-xl bg-[#f0f1f3] p-1" role="tablist">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = area === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setArea(tab.key)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  active ? 'bg-white text-[#1a1d21] shadow-sm' : 'text-[#8a9099] hover:text-[#1a1d21]'
                }`}
              >
                <Icon size={15} /> {tab.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 px-1 text-xs text-[#9aa0a8]">
          {area === 'home' ? st.areaHomeHint : st.areaSubpagesHint}
        </p>
      </div>

      {/* Both forms stay mounted; each renders only the active area's sections. */}
      <SiteForm
        area={area}
        formId="site-form"
        onMeta={onSiteMeta}
        defaultValues={siteDefaults}
        canEdit={canEdit}
        enableRental={enableRental}
        enableFinancing={enableFinancing}
      />
      <ContentForm
        area={area}
        formId="content-form"
        onMeta={onContentMeta}
        defaultValues={contentDefaults}
        canEdit={canEdit}
        enableFinancing={enableFinancing}
      />
    </div>
  );
}
