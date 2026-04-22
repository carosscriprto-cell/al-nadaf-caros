'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useUiLoading } from '@/components/providers/UiLoadingProvider';

export default function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const { startThemeLoading } = useUiLoading();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => {
        if (isSwitching) return;
        setIsSwitching(true);
        startThemeLoading(180);
        setTheme(isDark ? 'light' : 'dark');
        window.setTimeout(() => setIsSwitching(false), 220);
      }}
      className="ml-4 cursor-pointer p-2 rounded-lg border border-white/20 bg-background/60 text-foreground hover:bg-background/80 transition-colors flex items-center disabled:cursor-wait disabled:opacity-70"
      aria-label="Toggle dark mode"
      disabled={isSwitching}
    >
      {isDark ? (
        <Sun className="h-5 w-5 transition-transform duration-300" />
      ) : (
        <Moon className="h-5 w-5 transition-transform duration-300" />
      )}
    </button>
  );
}
