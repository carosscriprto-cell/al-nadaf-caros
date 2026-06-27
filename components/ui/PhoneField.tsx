'use client';

// components/ui/PhoneField.tsx — reusable phone input (E2).
// A country-code dropdown (searchable) + a national-number field. Persists the
// FULL value as canonical E.164-style `+<dial><national>` via onChange. The
// number always renders LTR (even in ar/RTL layout); the dropdown follows the
// page layout. Label/error are owned by the call site so this drops into the
// existing Field wrappers. No external deps.

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import {
  COUNTRY_CODES,
  composePhone,
  normalizeNational,
  splitPhone,
  type CountryCode,
} from '@/lib/constants/countryCodes';

type Props = {
  value: string;                 // stored full value (e.g. "+963944123456" or legacy free text)
  onChange: (full: string) => void;
  locale?: 'ar' | 'en';
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  invalid?: boolean;
  id?: string;
};

export default function PhoneField({
  value,
  onChange,
  locale = 'en',
  disabled,
  placeholder,
  className = '',
  invalid,
  id,
}: Props) {
  // Initial split only — subsequent external changes are handled by the effect.
  const [country, setCountry] = useState<CountryCode>(() => splitPhone(value).country);
  const [national, setNational] = useState<string>(() => splitPhone(value).national);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const composedRef = useRef<string>(composePhone(country, national));

  // Keep in sync with external changes (form reset/clear/load) AND canonicalize
  // a legacy value on mount (e.g. "0944…" → "+9630944…") so validation passes.
  useEffect(() => {
    const incoming = (value ?? '').trim();
    if (incoming === composedRef.current) return; // our own emit echoed back → ignore
    const p = splitPhone(incoming);
    const canonical = composePhone(p.country, p.national);
    setCountry(p.country);
    setNational(p.national);
    composedRef.current = canonical;
    if (canonical !== incoming) onChange(canonical); // normalize stored value
  }, [value, onChange]);

  const emit = (c: CountryCode, nat: string) => {
    const full = composePhone(c, nat);
    composedRef.current = full;
    onChange(full);
  };

  const onPickCountry = (c: CountryCode) => {
    setCountry(c);
    setOpen(false);
    setQuery('');
    emit(c, national);
  };

  const onNationalChange = (raw: string) => {
    // Pasting a full international number (+963…/00963…) into the national field
    // re-splits into country + national instead of doubling the dial code.
    const t = raw.trim();
    if (t.startsWith('+') || t.startsWith('00')) {
      const p = splitPhone(t);
      setCountry(p.country);
      setNational(p.national);
      emit(p.country, p.national);
      return;
    }
    // Typed/pasted national digits → same rule as load (digits-only + trunk-0).
    const nat = normalizeNational(raw);
    setNational(nat);
    emit(country, nat);
  };

  const label = (c: CountryCode) => (locale === 'ar' ? c.nameAr : c.name);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRY_CODES;
    return COUNTRY_CODES.filter(
      (c) =>
        c.dial.includes(q) ||
        c.iso.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.nameAr.includes(query.trim()),
    );
  }, [query]);

  const borderCls = invalid ? 'border-red-400' : 'border-border';

  return (
    <div className={`relative flex items-stretch gap-2 ${className}`}>
      {/* Country-code dropdown (follows page layout) */}
      <div className="relative shrink-0">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={`flex h-full items-center gap-1 rounded-xl border ${borderCls} bg-muted px-3 text-sm text-foreground outline-none transition focus:border-accent disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <span dir="ltr" className="font-medium">+{country.dial}</span>
          <span className="text-xs text-muted-foreground">{country.iso}</span>
          <ChevronDown size={14} className="text-muted-foreground" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute z-50 mt-1 max-h-64 w-64 overflow-auto rounded-xl border border-border bg-background p-1.5 shadow-xl ltr:left-0 rtl:right-0">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={locale === 'ar' ? 'ابحث…' : 'Search…'}
                className="mb-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm outline-none focus:border-accent"
              />
              {filtered.map((c) => (
                <button
                  key={c.iso}
                  type="button"
                  onClick={() => onPickCountry(c)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-start text-sm hover:bg-muted"
                >
                  <span dir="ltr" className="w-12 shrink-0 font-medium text-muted-foreground">+{c.dial}</span>
                  <span className="flex-1 truncate">{label(c)}</span>
                  {c.iso === country.iso && <Check size={14} className="text-accent" />}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-2.5 py-3 text-center text-xs text-muted-foreground">
                  {locale === 'ar' ? 'لا نتائج' : 'No results'}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* National number — always LTR, even in RTL layout */}
      <input
        id={id}
        type="tel"
        inputMode="tel"
        dir="ltr"
        value={national}
        disabled={disabled}
        onChange={(e) => onNationalChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        className={`min-w-0 flex-1 rounded-xl border ${borderCls} bg-muted px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-accent placeholder:text-muted-foreground/60 disabled:cursor-not-allowed disabled:opacity-60`}
      />
    </div>
  );
}
