'use client';

// app/auth/login/page.tsx
// ─────────────────────────────────────────────────────────────
// صفحة تسجيل الدخول — Email/Password + Magic Link
// ثنائية اللغة EN/AR
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Car, Mail, Lock, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

// ─── Translations ─────────────────────────────────────────────
const i18n = {
  en: {
    title:          'Welcome back',
    subtitle:       'Sign in to manage your inventory',
    email:          'Email address',
    password:       'Password',
    signIn:         'Sign in',
    magicLink:      'Send magic link',
    magicLinkSent:  'Check your email',
    magicLinkDesc:  'We sent a sign-in link to',
    orDivider:      'or',
    switchMagic:    'Sign in without password',
    switchPassword: 'Sign in with password',
    loading:        'Signing in...',
    errorInvalid:   'Invalid email or password',
    errorGeneral:   'Something went wrong. Please try again.',
    lang:           'العربية',
  },
  ar: {
    title:          'مرحباً بعودتك',
    subtitle:       'سجّل دخولك لإدارة مخزونك',
    email:          'البريد الإلكتروني',
    password:       'كلمة المرور',
    signIn:         'تسجيل الدخول',
    magicLink:      'إرسال رابط الدخول',
    magicLinkSent:  'تحقق من بريدك',
    magicLinkDesc:  'أرسلنا رابط الدخول إلى',
    orDivider:      'أو',
    switchMagic:    'الدخول بدون كلمة مرور',
    switchPassword: 'الدخول بكلمة المرور',
    loading:        'جارٍ الدخول...',
    errorInvalid:   'البريد أو كلمة المرور غير صحيحة',
    errorGeneral:   'حدث خطأ ما. حاول مرة أخرى.',
    lang:           'English',
  },
} as const;

type Lang = keyof typeof i18n;

export default function LoginPage() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const redirectTo  = searchParams.get('redirectTo') || '/dashboard';

  const [lang,        setLang]        = useState<Lang>('en');
  const [mode,        setMode]        = useState<'password' | 'magic'>('password');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [magicSent,   setMagicSent]   = useState(false);

  const t   = i18n[lang];
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const supabase = createBrowserClient();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(
        error.message.includes('Invalid')
          ? t.errorInvalid
          : t.errorGeneral
      );
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}${redirectTo}`,
      },
    });

    if (error) {
      setError(t.errorGeneral);
      setLoading(false);
      return;
    }

    setMagicSent(true);
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen bg-[#0a0a14] flex items-center justify-center p-4"
      dir={dir}
    >
      {/* Language toggle */}
      <button
        onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')}
        className="fixed top-5 right-5 text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 rounded-lg px-3 py-1.5"
      >
        {t.lang}
      </button>

      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-600/20">
            <Car size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">{t.title}</h1>
          <p className="text-sm text-white/40 mt-1">{t.subtitle}</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">

          {/* Magic link sent state */}
          {magicSent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">
                {t.magicLinkSent}
              </h2>
              <p className="text-sm text-white/40">
                {t.magicLinkDesc}
              </p>
              <p className="text-sm text-violet-400 mt-1 font-medium">
                {email}
              </p>
              <button
                onClick={() => { setMagicSent(false); setEmail(''); }}
                className="mt-6 text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                ← {lang === 'en' ? 'Use different email' : 'استخدم بريداً آخر'}
              </button>
            </div>
          ) : (
            <form
              onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink}
              className="space-y-4"
            >
              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-1.5">
                  {t.email}
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
                    style={{ left: dir === 'rtl' ? 'auto' : '12px', right: dir === 'rtl' ? '12px' : 'auto' }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="name@company.com"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all"
                    style={{
                      paddingLeft:  dir === 'rtl' ? '12px' : '36px',
                      paddingRight: dir === 'rtl' ? '36px' : '12px',
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              {mode === 'password' && (
                <div>
                  <label className="block text-xs font-medium text-white/40 uppercase tracking-widest mb-1.5">
                    {t.password}
                  </label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
                      style={{ left: dir === 'rtl' ? 'auto' : '12px', right: dir === 'rtl' ? '12px' : 'auto' }}
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-all"
                      style={{
                        paddingLeft:  dir === 'rtl' ? '12px' : '36px',
                        paddingRight: dir === 'rtl' ? '36px' : '12px',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-semibold text-white transition-all"
              >
                {loading ? (
                  <><Loader2 size={15} className="animate-spin" /> {t.loading}</>
                ) : mode === 'password' ? (
                  <>{t.signIn} <ArrowRight size={15} /></>
                ) : (
                  <>{t.magicLink} <ArrowRight size={15} /></>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-white/20">{t.orDivider}</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              {/* Mode switch */}
              <button
                type="button"
                onClick={() => { setMode(m => m === 'password' ? 'magic' : 'password'); setError(''); }}
                className="w-full text-xs text-white/40 hover:text-white/70 transition-colors py-1"
              >
                {mode === 'password' ? t.switchMagic : t.switchPassword}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-white/20 mt-6">
          Caros Dashboard © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}