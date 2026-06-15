'use client';

// Reusable Caros confirm dialog built on Radix AlertDialog.
// Used for every destructive/irreversible action — never window.confirm().

import { useState } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Loader2 } from 'lucide-react';

type Props = {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  onConfirm: () => Promise<void> | void;
};

export default function Confirm({
  trigger,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive,
  onConfirm,
}: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#ececec] bg-white p-6 shadow-2xl focus:outline-none">
          <AlertDialog.Title className="text-lg font-bold text-[#1a1d21]">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-[#6b7178]">
            {description}
          </AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <button
                disabled={busy}
                className="rounded-xl border border-[#ececec] px-4 py-2.5 text-sm font-semibold text-[#6b7178] transition hover:bg-[#f0f1f3] disabled:opacity-50"
              >
                {cancelLabel}
              </button>
            </AlertDialog.Cancel>
            <button
              onClick={handleConfirm}
              disabled={busy}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60 ${
                destructive
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-[#75ACE8] hover:bg-[#5f9ad9]'
              }`}
            >
              {busy && <Loader2 size={15} className="animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
