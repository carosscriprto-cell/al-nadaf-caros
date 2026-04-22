'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  Car,
  Fuel,
  Tag,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';

type CarItem = {
  id: string | number;
  name: string;
  brand?: string;
  model?: string;
  price: number;
  listingType?: 'rent' | 'sale' | 'both';
  fuelType?: string;
  transmission?: string;
  category?: string;
};

interface Props {
  cars: CarItem[];
  onSearch?: (q: string, filters: Partial<CarItem>) => void;
}

/* -------------------- utils -------------------- */

function normalize(str: string) {
  return str.toLowerCase().trim();
}

// fuzzy match simple (typo tolerant)
function fuzzyMatch(query: string, target: string) {
  query = normalize(query);
  target = normalize(target);

  if (target.includes(query)) return 1;

  let score = 0;
  let i = 0;

  for (const char of query) {
    const idx = target.indexOf(char, i);
    if (idx === -1) return 0;
    score++;
    i = idx + 1;
  }

  return score / target.length;
}

/* -------------------- component -------------------- */

export default function HomeVehicleSearchForm({ cars, onSearch }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  /* -------- history -------- */
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('search-history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  function saveHistory(q: string) {
    const updated = [q, ...history.filter((h) => h !== q)].slice(0, 5);
    setHistory(updated);
    localStorage.setItem('search-history', JSON.stringify(updated));
  }

  /* -------- trending -------- */
  const trending = ['Toyota', 'BMW', 'Mercedes', 'Audi', 'Range Rover'];

  /* -------- smart suggestions -------- */
  const suggestions = useMemo(() => {
    if (!query) return [];

    return cars
      .map((car) => ({
        text: `${car.brand ?? ''} ${car.model ?? ''}`.trim(),
        score: fuzzyMatch(query, `${car.brand} ${car.model} ${car.name}`),
        car,
      }))
      .filter((c) => c.score > 0.2)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [query, cars]);

  /* -------- keyboard nav -------- */
  const items = [
    ...suggestions.map((s) => s.text),
    ...history,
    ...trending,
  ];

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;

    if (e.key === 'ArrowDown') {
      setIndex((i) => Math.min(i + 1, items.length - 1));
    }

    if (e.key === 'ArrowUp') {
      setIndex((i) => Math.max(i - 1, 0));
    }

    if (e.key === 'Enter') {
      const value = items[index];
      setQuery(value);
      setOpen(false);
      saveHistory(value);
      onSearch?.(value, {});
    }

    if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  /* -------- submit -------- */
  function handleSearch(value = query) {
    if (!value) return;
    saveHistory(value);
    setOpen(false);
    onSearch?.(value, {});
  }

  return (
    <div className="relative w-full max-w-3xl">
      {/* INPUT */}
      <div
        className="flex items-center gap-3 rounded-3xl border bg-background/80 px-5 py-4 backdrop-blur-xl shadow-xl"
        onClick={() => setOpen(true)}
      >
        <Search className="text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search Toyota, BMW, SUV, Diesel..."
          className="w-full bg-transparent outline-none"
        />
        <Sparkles className="text-accent" />
      </div>

      {/* DROPDOWN */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute z-50 mt-3 w-full overflow-hidden rounded-3xl border bg-card shadow-2xl"
          >
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-3">
                <p className="mb-2 text-xs text-muted-foreground">
                  Smart suggestions
                </p>

                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => handleSearch(s.text)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 hover:bg-accent/10 ${
                      index === i ? 'bg-accent/10' : ''
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      {s.text}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                ))}
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div className="border-t p-3">
                <p className="mb-2 text-xs text-muted-foreground">
                  Recent searches
                </p>

                {history.map((h, i) => (
                  <div
                    key={i}
                    onClick={() => handleSearch(h)}
                    className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 hover:bg-muted"
                  >
                    <Clock className="h-4 w-4" />
                    {h}
                  </div>
                ))}
              </div>
            )}

            {/* Trending */}
            <div className="border-t p-3">
              <p className="mb-2 text-xs text-muted-foreground">
                Trending
              </p>

              <div className="flex flex-wrap gap-2">
                {trending.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearch(t)}
                    className="rounded-full border px-3 py-1 text-xs hover:bg-accent/10"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}