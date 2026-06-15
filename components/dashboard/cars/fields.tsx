'use client';

// Reusable Caros form field primitives (full-page car form).
import { useState } from 'react';
import { X, Plus } from 'lucide-react';

const base =
  'w-full rounded-xl border bg-[#F7F7F7] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#75ACE8] focus:bg-white focus:ring-4 focus:ring-[#75ACE8]/15';

export function Section({ title, hint, children, cols = 3 }: { title: string; hint?: string; children: React.ReactNode; cols?: 1 | 2 | 3 }) {
  const grid = cols === 1 ? 'grid-cols-1' : cols === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3';
  return (
    <section className="rounded-2xl border border-[#ececec] bg-white p-5 lg:p-6">
      <div className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#1a1d21]">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-[#9aa0a8]">{hint}</p>}
      </div>
      <div className={`grid gap-4 ${grid}`}>{children}</div>
    </section>
  );
}

function Label({ label, err, full }: { label: string; err?: string; full?: boolean }) {
  return (
    <span className={`mb-1 block text-xs font-medium text-[#6b7178] ${full ? '' : ''}`}>
      {label} {err && <span className="text-red-500">· {err}</span>}
    </span>
  );
}

export function TextField({ label, value, onChange, err, full, placeholder }: { label: string; value: string; onChange: (v: string) => void; err?: string; full?: boolean; placeholder?: string }) {
  return (
    <label className={`block ${full ? 'col-span-full' : ''}`}>
      <Label label={label} err={err} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${base} placeholder:text-[#b3b8bf] ${err ? 'border-red-300' : 'border-[#e7e8ea]'}`} />
    </label>
  );
}

export function NumField({ label, value, onChange, err, placeholder }: { label: string; value?: number; onChange: (v: number | undefined) => void; err?: string; placeholder?: string }) {
  return (
    <label className="block">
      <Label label={label} err={err} />
      <input type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))} placeholder={placeholder} className={`${base} placeholder:text-[#b3b8bf] ${err ? 'border-red-300' : 'border-[#e7e8ea]'}`} />
    </label>
  );
}

export function SelField({ label, value, onChange, opts, fmt, allowEmpty }: { label: string; value: string; onChange: (v: string) => void; opts: readonly string[]; fmt: (v: string) => string; allowEmpty?: boolean }) {
  return (
    <label className="block">
      <Label label={label} />
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${base} border-[#e7e8ea]`}>
        {allowEmpty && <option value="">—</option>}
        {opts.map((o) => <option key={o} value={o}>{fmt(o)}</option>)}
      </select>
    </label>
  );
}

export function TextareaField({ label, value, onChange, err, placeholder }: { label: string; value: string; onChange: (v: string) => void; err?: string; placeholder?: string }) {
  return (
    <label className="col-span-full block">
      <Label label={label} err={err} />
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={placeholder} className={`${base} resize-y placeholder:text-[#b3b8bf] ${err ? 'border-red-300' : 'border-[#e7e8ea]'}`} />
    </label>
  );
}

export function SwitchField({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#e7e8ea] bg-[#F7F7F7] px-3.5 py-2.5">
      <span className="text-sm"><span className="font-medium text-[#1a1d21]">{label}</span>{hint && <span className="mt-0.5 block text-xs text-[#9aa0a8]">{hint}</span>}</span>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-[#75ACE8]' : 'bg-[#cbd0d6]'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'ltr:left-[22px] rtl:right-[22px]' : 'ltr:left-0.5 rtl:right-0.5'}`} />
      </button>
    </div>
  );
}

// Chip / tag input for string[] content fields (features, safety, pros…).
export function TagInput({ label, values, onChange, hint }: { label: string; values: string[]; onChange: (v: string[]) => void; hint?: string }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft('');
  };
  return (
    <div className="col-span-full">
      <Label label={label} />
      <div className="flex flex-wrap gap-2 rounded-xl border border-[#e7e8ea] bg-[#F7F7F7] p-2.5">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-[#1a1d21] shadow-sm">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="text-[#b3b8bf] hover:text-red-500"><X size={12} /></button>
          </span>
        ))}
        <div className="flex flex-1 items-center gap-1">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
            placeholder={hint}
            className="min-w-[120px] flex-1 bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-[#b3b8bf]"
          />
          {draft.trim() && <button type="button" onClick={add} className="rounded-md p-1 text-[#75ACE8] hover:bg-white"><Plus size={14} /></button>}
        </div>
      </div>
    </div>
  );
}
