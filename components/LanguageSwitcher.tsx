'use client';

import { Globe, ChevronDown } from 'lucide-react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import {
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';

import { useUiLoading } from '@/components/providers/UiLoadingProvider';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
] as const;

type LanguageSwitcherProps = {
  direction?: 'down' | 'up';
};

export default function LanguageSwitcher({
  direction = 'down',
}: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params?.locale || 'en';
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { startRouteLoading } = useUiLoading();

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === currentLocale || isPending) {
      setIsOpen(false);
      return;
    }

    const segments = pathname.split('/');

    if (languages.some((language) => language.code === segments[1])) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }

    startRouteLoading(450);
    startTransition(() => {
      router.push(segments.join('/'), { scroll: false });
    });
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  const currentLanguage = languages.find(
    (language) => language.code === currentLocale
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        disabled={isPending}
        className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors duration-200 hover:border-accent/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-wait disabled:opacity-70"
        aria-label="Switch language"
        aria-expanded={isOpen}
      >
        <Globe className="h-4 w-4 text-foreground/60" />
        <span>{currentLanguage?.label}</span>
        <ChevronDown
          className={`h-4 w-4 text-foreground/60 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 z-50 w-30 rounded-md border border-border bg-background shadow-lg ${
            direction === 'up'
              ? 'bottom-full mb-2'
              : 'top-full mt-2'
          }`}
        >
          {languages.map((language) => (
            <button
              key={language.code}
              type="button"
              onClick={() => handleLanguageChange(language.code)}
              disabled={isPending}
              className={`w-full px-3 py-2 text-left text-sm font-medium transition-colors duration-200 first:rounded-t-md last:rounded-b-md hover:bg-accent hover:text-white disabled:cursor-wait disabled:opacity-70 ${
                language.code === currentLocale
                  ? 'bg-accent/10'
                  : 'text-foreground'
              }`}
            >
              {language.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
