'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { DashCar } from '@/lib/dashboard/cars';
import { updateCarPrice, bulkAdjustPrice } from '@/app/dashboard/cars/actions';
import { useDash } from '../DashboardI18n';
import Confirm from '../ui/Confirm';

const fieldCls =
  'w-full rounded-xl border border-[#e7e8ea] bg-[#F7F7F7] px-3 py-2.5 text-sm outline-none transition focus:border-[#75ACE8] focus:bg-white focus:ring-4 focus:ring-[#75ACE8]/15';

// ─── Per-row quick price edit ─────────────────────────────────────────────────
export function PriceEditDialog({ car, trigger, onSuccess }: { car: DashCar; trigger: React.ReactNode; onSuccess: () => void }) {
  const { t } = useDash();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const isSale = car.listing_type === 'sale' || car.listing_type === 'both';
  const isRent = car.listing_type === 'rent' || car.listing_type === 'both';
  const [total, setTotal] = useState<string>(car.price_total?.toString() ?? '');
  const [daily, setDaily] = useState<string>(car.price_daily?.toString() ?? '');
  const [monthly, setMonthly] = useState<string>(car.price_monthly?.toString() ?? '');

  const save = async () => {
    setBusy(true);
    const payload: { id: string; price_total?: number | null; price_daily?: number | null; price_monthly?: number | null } = { id: car.id };
    if (isSale) payload.price_total = total === '' ? null : Number(total);
    if (isRent) {
      payload.price_daily = daily === '' ? null : Number(daily);
      payload.price_monthly = monthly === '' ? null : Number(monthly);
    }
    const res = await updateCarPrice(payload);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(t.vehicleUpdated);
    setOpen(false);
    onSuccess();
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#ececec] bg-white p-6 shadow-2xl focus:outline-none">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-base font-bold">
              {t.editPrice} · <span className="capitalize text-[#6b7178]">{car.brand} {car.model}</span>
            </Dialog.Title>
            <Dialog.Close className="rounded-lg p-1.5 text-[#9aa0a8] hover:bg-[#f0f1f3]"><X size={16} /></Dialog.Close>
          </div>

          <div className="space-y-3">
            {!isSale && !isRent && <p className="text-sm text-[#8a9099]">{t.noPriceForType}</p>}
            {isSale && (
              <Field label={`${t.salePrice} (${car.currency})`}>
                <input type="number" value={total} onChange={(e) => setTotal(e.target.value)} className={fieldCls} />
              </Field>
            )}
            {isRent && (
              <>
                <Field label={`${t.rentalDaily} (${car.currency})`}>
                  <input type="number" value={daily} onChange={(e) => setDaily(e.target.value)} className={fieldCls} />
                </Field>
                <Field label={`${t.monthlyPrice} (${car.currency})`}>
                  <input type="number" value={monthly} onChange={(e) => setMonthly(e.target.value)} className={fieldCls} />
                </Field>
              </>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close className="rounded-xl border border-[#ececec] px-4 py-2.5 text-sm font-semibold text-[#6b7178] hover:bg-[#f0f1f3]">{t.cancel}</Dialog.Close>
            <button onClick={save} disabled={busy} className="flex items-center gap-2 rounded-xl bg-[#75ACE8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5f9ad9] disabled:opacity-60">
              {busy && <Loader2 size={15} className="animate-spin" />}{t.save}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── Bulk price adjustment ────────────────────────────────────────────────────
export function BulkPriceDialog({ ids, trigger, onSuccess }: { ids: string[]; trigger: React.ReactNode; onSuccess: () => void }) {
  const { t, lang } = useDash();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'amount' | 'percent'>('amount');
  const [direction, setDirection] = useState<'increase' | 'decrease'>('increase');
  const [value, setValue] = useState<string>('');
  const n = ids.length;

  const apply = async () => {
    const num = Number(value);
    if (!num || num <= 0) { toast.error(t.value); return; }
    const res = await bulkAdjustPrice({ ids, mode, direction, value: num });
    if (!res.ok) { toast.error(res.error); return; }
    toast.success(`${t.willUpdate} ${res.updated ?? 0} ${t.vehicles}`);
    setOpen(false);
    setValue('');
    onSuccess();
  };

  const Seg = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${active ? 'bg-white text-[#1a1d21] shadow-sm' : 'text-[#8a9099] hover:text-[#1a1d21]'}`}>{children}</button>
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#ececec] bg-white p-6 shadow-2xl focus:outline-none">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-base font-bold">{t.adjustPrice}</Dialog.Title>
            <Dialog.Close className="rounded-lg p-1.5 text-[#9aa0a8] hover:bg-[#f0f1f3]"><X size={16} /></Dialog.Close>
          </div>

          <div className="space-y-3">
            <div className="flex gap-1 rounded-xl bg-[#f0f1f3] p-1">
              <Seg active={mode === 'amount'} onClick={() => setMode('amount')}>{t.byAmount}</Seg>
              <Seg active={mode === 'percent'} onClick={() => setMode('percent')}>{t.byPercent}</Seg>
            </div>
            <div className="flex gap-1 rounded-xl bg-[#f0f1f3] p-1">
              <Seg active={direction === 'increase'} onClick={() => setDirection('increase')}>{t.increase}</Seg>
              <Seg active={direction === 'decrease'} onClick={() => setDirection('decrease')}>{t.decrease}</Seg>
            </div>
            <Field label={`${t.value}${mode === 'percent' ? ' (%)' : ''}`}>
              <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className={fieldCls} placeholder={mode === 'percent' ? '10' : '2000'} />
            </Field>
            <p className="text-xs leading-relaxed text-[#9aa0a8]">{t.applyHint}</p>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close className="rounded-xl border border-[#ececec] px-4 py-2.5 text-sm font-semibold text-[#6b7178] hover:bg-[#f0f1f3]">{t.cancel}</Dialog.Close>
            <Confirm
              trigger={
                <button className="rounded-xl bg-[#75ACE8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5f9ad9]">{t.apply}</button>
              }
              title={t.adjustPrice}
              description={`${t.willUpdate} ${n} ${t.vehicles}. ${lang === 'ar' ? '' : ''}`.trim()}
              confirmLabel={t.apply}
              cancelLabel={t.cancel}
              onConfirm={apply}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-[#6b7178]">{label}</span>
      {children}
    </label>
  );
}
