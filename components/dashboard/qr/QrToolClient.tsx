'use client';

// QR tool — car picker + QR preview + SVG/PNG downloads + print card.
// The QR encodes the stable short link {origin}/c/{car_id} (survives slug
// changes); downloads are named by slug only for human readability.

import { useMemo, useRef, useState } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Check, Copy, Download, Printer, Search } from 'lucide-react';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import type { Tables } from '@/lib/supabase/database.types';
import { useDash } from '../DashboardI18n';

// The subset of the cars row the QR tool needs (page selects exactly these).
export type QrCar = Pick<
  Tables<'cars'>,
  'id' | 'slug' | 'brand' | 'model' | 'year' | 'thumbnail' | 'status' | 'available'
>;

type Props = {
  cars: QrCar[];
  origin: string;
  tenantName: string;
  tenantNameAr: string | null;
  logoUrl: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  sold: 'bg-red-50 text-red-700 border-red-200',
  reserved: 'bg-amber-50 text-amber-700 border-amber-200',
};

const PREVIEW_SIZE = 320;
const PNG_SIZE = 1024;
const PRINT_SIZE = 440;
const LOGO_SIZE = 56; // at PREVIEW_SIZE; scaled proportionally elsewhere

function triggerDownload(href: string, filename: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function QrToolClient({ cars, origin, tenantName, tenantNameAr, logoUrl }: Props) {
  const { t, lang, dir, el } = useDash();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showLogo, setShowLogo] = useState(false);
  const [copied, setCopied] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const displayName = lang === 'ar' ? tenantNameAr || tenantName : tenantName;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cars;
    return cars.filter((c) => `${c.brand} ${c.model} ${c.year}`.toLowerCase().includes(q));
  }, [cars, query]);

  const selected = useMemo(
    () => cars.find((c) => c.id === selectedId) ?? null,
    [cars, selectedId],
  );

  const url = selected ? `${origin}/c/${selected.id}` : '';
  const withLogo = showLogo && !!logoUrl;
  const level = withLogo ? 'H' : 'M';
  const logoFor = (size: number) =>
    withLogo && logoUrl
      ? {
          src: logoUrl,
          width: Math.round((LOGO_SIZE / PREVIEW_SIZE) * size),
          height: Math.round((LOGO_SIZE / PREVIEW_SIZE) * size),
          excavate: true,
          crossOrigin: 'anonymous' as const,
        }
      : undefined;

  const copyUrl = async () => {
    try {
      // navigator.clipboard needs a secure context — unavailable on plain-HTTP
      // dev origins (dealer2.lvh.me), so fall back to the legacy path there.
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard denied — the URL is still select-all text */
    }
  };

  const downloadSvg = () => {
    const node = svgRef.current;
    if (!node || !selected) return;
    const source = new XMLSerializer().serializeToString(node);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    triggerDownload(blobUrl, `qr-${selected.slug}.svg`);
    URL.revokeObjectURL(blobUrl);
  };

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas || !selected) return;
    try {
      triggerDownload(canvas.toDataURL('image/png'), `qr-${selected.slug}.png`);
    } catch (err) {
      // A logo host without CORS taints the canvas; nothing to download then.
      console.error('QR PNG export failed (tainted canvas?)', err);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-[#1a1d21]">{t.qrCodes}</h1>
      <p className="mt-1 text-sm text-[#6b7178]">{t.qr.subtitle}</p>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* ── Car picker ─────────────────────────────────────── */}
        <section className="rounded-2xl border border-[#ececec] bg-white">
          <div className="border-b border-[#ececec] p-3">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-[#9aa0a8] ltr:left-3 rtl:right-3"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.qr.search}
                className="w-full rounded-xl border border-[#e7e8ea] bg-white py-2.5 text-sm outline-none focus:border-[#75ACE8] ltr:pl-9 ltr:pr-3 rtl:pl-3 rtl:pr-9"
              />
            </div>
          </div>
          <ul className="max-h-[26rem] overflow-y-auto p-2">
            {filtered.map((car) => {
              const active = car.id === selectedId;
              const status = car.status ?? 'available';
              return (
                <li key={car.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(car.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-start transition ${
                      active ? 'bg-[#75ACE8]/12' : 'hover:bg-[#f0f1f3]'
                    }`}
                  >
                    <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-[#f0f1f3]">
                      <ImageWithFallback
                        src={car.thumbnail ?? ''}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <span
                      className={`min-w-0 flex-1 truncate text-sm font-semibold capitalize ${
                        active ? 'text-[#3d7cc0]' : 'text-[#1a1d21]'
                      }`}
                    >
                      {car.brand} {car.model} {car.year}
                    </span>
                    <span
                      className={`inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        STATUS_STYLES[status] ?? 'border-[#e7e8ea] bg-[#f7f7f7] text-[#6b7178]'
                      }`}
                    >
                      {el('status', status)}
                    </span>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-[#9aa0a8]">
                {cars.length === 0 ? t.noCars : t.qr.noResults}
              </li>
            )}
          </ul>
        </section>

        {/* ── QR panel ───────────────────────────────────────── */}
        <section className="rounded-2xl border border-[#ececec] bg-white p-6">
          {!selected ? (
            <p className="py-16 text-center text-sm text-[#9aa0a8]">{t.qr.selectPrompt}</p>
          ) : (
            <div className="flex flex-col items-center gap-5">
              <p className="text-base font-bold capitalize text-[#1a1d21]">
                {selected.brand} {selected.model} {selected.year}
              </p>

              {!selected.available && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-xs text-amber-700">
                  {t.qr.notPublic}
                </p>
              )}

              <div className="rounded-2xl border border-[#ececec] bg-white p-4">
                <QRCodeSVG
                  ref={svgRef}
                  value={url}
                  size={PREVIEW_SIZE}
                  level={level}
                  imageSettings={logoFor(PREVIEW_SIZE)}
                />
              </div>

              {logoUrl && (
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[#6b7178]">
                  <input
                    type="checkbox"
                    checked={showLogo}
                    onChange={(e) => setShowLogo(e.target.checked)}
                    className="h-4 w-4 rounded border-[#e7e8ea] accent-[#75ACE8]"
                  />
                  {t.qr.showLogo}
                </label>
              )}

              <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-[#e7e8ea] bg-[#fafbfc] px-3 py-2">
                <span className="text-xs font-semibold text-[#9aa0a8]">{t.qr.shortLink}</span>
                <code dir="ltr" className="min-w-0 flex-1 select-all truncate text-xs text-[#1a1d21]">
                  {url}
                </code>
                <button
                  type="button"
                  onClick={copyUrl}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[#3d7cc0] transition hover:bg-[#75ACE8]/12"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? t.qr.copied : t.qr.copy}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={downloadSvg}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#e7e8ea] px-4 py-2.5 text-sm font-semibold text-[#6b7178] transition hover:bg-[#f0f1f3] hover:text-[#1a1d21]"
                >
                  <Download size={15} /> {t.qr.downloadSvg}
                </button>
                <button
                  type="button"
                  onClick={downloadPng}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#e7e8ea] px-4 py-2.5 text-sm font-semibold text-[#6b7178] transition hover:bg-[#f0f1f3] hover:text-[#1a1d21]"
                >
                  <Download size={15} /> {t.qr.downloadPng}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#75ACE8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#75ACE8]/25 transition hover:bg-[#5f9ad9]"
                >
                  <Printer size={15} /> {t.qr.print}
                </button>
              </div>

              {/* Hidden hi-res canvas — source for the PNG download. */}
              <div className="hidden" aria-hidden>
                <QRCodeCanvas
                  ref={canvasRef}
                  value={url}
                  size={PNG_SIZE}
                  level={level}
                  imageSettings={logoFor(PNG_SIZE)}
                />
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ── Print card — screen-hidden; the ONLY thing print shows ── */}
      {selected && (
        <div id="qr-print-card" dir={dir} aria-hidden className="hidden">
          <div className="flex flex-col items-center gap-6 text-center">
            <QRCodeSVG value={url} size={PRINT_SIZE} level={level} imageSettings={logoFor(PRINT_SIZE)} />
            <p className="text-3xl font-bold capitalize text-black">
              {selected.brand} {selected.model} {selected.year}
            </p>
            <p className="text-xl text-black">{displayName}</p>
          </div>
        </div>
      )}
      {/* Scoped to this page: the component (and its <style>) unmounts on nav. */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #qr-print-card, #qr-print-card * { visibility: visible !important; }
          #qr-print-card {
            display: flex !important;
            position: fixed;
            inset: 0;
            align-items: center;
            justify-content: center;
            background: #fff;
          }
        }
      `}</style>
    </div>
  );
}
