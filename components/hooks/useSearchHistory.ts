'use client';

import { useEffect, useState } from 'react';

export default function useSearchHistory(
  storageKey: string,
  maxItems = 5
) {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setHistory(JSON.parse(raw));
      }
    } catch {
      setHistory([]);
    }
  }, [storageKey]);

  const saveHistory = (value: string) => {
    const cleaned = value.trim();
    if (!cleaned) return;

    setHistory((current) => {
      const next = [cleaned, ...current.filter((item) => item !== cleaned)].slice(
        0,
        maxItems
      );

      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore storage failure
      }

      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore storage failure
    }
  };

  return {
    history,
    saveHistory,
    clearHistory,
  };
}
