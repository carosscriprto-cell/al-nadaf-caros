'use client';

// app/auth/login/page.tsx — Caros dashboard sign-in.
// Email/password only (accounts are provisioned per client — NO self-signup).
// Bilingual EN / AR (RTL). Caros brand: #F7F7F7 bg, #75ACE8 accent, Cairo type.

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

const i18n = {
  en: {
    title: 'Welcome back',
    subtitle: 'Sign in to manage your inventory',
    email: 'Email address',
    password: 'Password',
    signIn: 'Sign in',
    loading: 'Signing in…',
    errorInvalid: 'Invalid email or password',
    errorGeneral: 'Something went wrong. Please try again.',
    lang: 'العربية',
  },
  ar: {
    title: 'مرحباً بعودتك',
    subtitle: 'سجّل دخولك لإدارة مخزونك',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    signIn: 'تسجيل الدخول',
    loading: '…جارٍ الدخول',
    errorInvalid: 'البريد أو كلمة المرور غير صحيحة',
    errorGeneral: 'حدث خطأ ما. حاول مرة أخرى.',
    lang: 'English',
  },
} as const;

type Lang = keyof typeof i18n;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const [lang, setLang] = useState<Lang>('en');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = i18n[lang];
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const supabase = createBrowserClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  console.log(data);
  console.log(error);

  if (error) {
    console.error(error);
    setError(error.message);
    setLoading(false);
    return;
  }

 
    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div
      dir={dir}
      className="flex min-h-screen items-center justify-center bg-[#F7F7F7] p-6 font-[family-name:var(--font-cairo)] text-[#1a1d21]"
    >
      <button
        onClick={() => setLang((l) => (l === 'en' ? 'ar' : 'en'))}
        className="fixed top-6 ltr:right-6 rtl:left-6 rounded-full border border-black/10 bg-white px-4 py-1.5 text-xs font-medium text-[#5b6168] shadow-sm transition hover:border-[#75ACE8]/40 hover:text-[#1a1d21]"
      >
        {t.lang}
      </button>

      <div className="w-full max-w-[400px]">
        {/* Brand */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#75ACE8] text-xl font-bold text-white shadow-lg shadow-[#75ACE8]/25">
            C
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="mt-1.5 text-sm text-[#8a9099]">{t.subtitle}</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-[0_8px_40px_rgba(15,23,42,0.06)]">
          <form onSubmit={handleLogin} className="space-y-5">
            <Field label={t.email} icon={<Mail size={16} />}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="company@caros.app"
                className="w-full rounded-xl border border-black/10 bg-[#F7F7F7] py-3 text-sm outline-none transition placeholder:text-[#b3b8bf] focus:border-[#75ACE8] focus:bg-white focus:ring-4 focus:ring-[#75ACE8]/15 ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5"
              />
            </Field>

            <Field label={t.password} icon={<Lock size={16} />}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-black/10 bg-[#F7F7F7] py-3 text-sm outline-none transition placeholder:text-[#b3b8bf] focus:border-[#75ACE8] focus:bg-white focus:ring-4 focus:ring-[#75ACE8]/15 ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5"
              />
            </Field>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#75ACE8] py-3 text-sm font-semibold text-white shadow-lg shadow-[#75ACE8]/25 transition hover:bg-[#5f9ad9] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> {t.loading}
                </>
              ) : (
                <>
                  {t.signIn}
                  <ArrowRight size={16} className="rtl:rotate-180" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-[#b3b8bf]">
          Caros © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#8a9099]">
        {label}
      </label>
      <div className="relative">
        <span
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-[#b3b8bf] ltr:left-3.5 rtl:right-3.5"
          aria-hidden
        >
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}
