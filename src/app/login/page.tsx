'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Gift, LoaderCircle, Mail, LockKeyhole, UserRound } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { importGuestWishes } from '@/lib/storage';

type AuthMode = 'login' | 'signup' | 'reset' | 'update';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setMessage(null);
    setError(null);
  };

  const openDashboardAfterLogin = async () => {
    try {
      const imported = await importGuestWishes();
      router.push(`/dashboard?imported=${imported}`);
    } catch (importError: unknown) {
      console.error('Could not import local birthday drafts after login:', importError);
      router.push('/dashboard?importFailed=1');
    }
  };

  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('update');
        setError(null);
        setMessage(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!isSupabaseConfigured || !supabase) {
      setError('Account sign-in is unavailable until Supabase is configured.');
      return;
    }

    if ((mode === 'signup' || mode === 'update') && password !== confirmPassword) {
      setError('Your passwords do not match.');
      return;
    }

    if (mode !== 'reset' && password.length < 8) {
      setError('Your password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName.trim() } },
        });
        if (signUpError) throw signUpError;

        if (data.session) {
          await openDashboardAfterLogin();
          return;
        }
        changeMode('login');
        setMessage('Account created. Check your email to verify your address, then sign in.');
      } else if (mode === 'reset') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/login`,
        });
        if (resetError) throw resetError;
        setMessage('If an account exists for that email, we sent a password reset link.');
      } else if (mode === 'update') {
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
        setPassword('');
        setConfirmPassword('');
        changeMode('login');
        setMessage('Your password has been updated. You can now sign in with your new password.');
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (loginError) throw loginError;
        await openDashboardAfterLogin();
      }
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'We could not complete that request. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const heading =
    mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Reset your password' : mode === 'update' ? 'Choose a new password' : 'Welcome back';
  const submitLabel =
    mode === 'signup' ? 'Create Account' : mode === 'reset' ? 'Send Reset Link' : mode === 'update' ? 'Update Password' : 'Login';

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-10 text-slate-800">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[32px] border border-rose-100 bg-white shadow-2xl md:grid-cols-2">
          <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-amber-400 p-10 text-white md:flex">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/15 blur-2xl" />
            <Link href="/" className="relative flex items-center gap-3 font-black">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
                <Gift className="h-6 w-6" />
              </span>
              <span>BirthdayMagic</span>
            </Link>
            <div className="relative py-12">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-white/80">Keep every moment</p>
              <h1 className="text-4xl font-black leading-tight">Your birthday surprises, all in one place.</h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-white/85">
                Sign in to revisit your creations, check page views, and share the celebrations you have made.
              </p>
            </div>
            <p className="relative text-xs font-semibold text-white/80">Made with a little extra love ✨</p>
          </div>

          <div className="p-6 sm:p-10 md:p-12">
            <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-rose-600">
              <ArrowLeft className="h-4 w-4" /> Back to BirthdayMagic
            </Link>

            <div className="mb-7 md:hidden">
              <Link href="/" className="inline-flex items-center gap-2 font-black text-slate-900">
                <Gift className="h-6 w-6 text-rose-500" /> BirthdayMagic
              </Link>
            </div>

            <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-rose-500">
              {mode === 'signup' ? 'Start your free account' : mode === 'reset' || mode === 'update' ? 'Account recovery' : 'Your creations await'}
            </p>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">{heading}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {mode === 'signup'
                ? 'Save your birthday websites and find them here anytime.'
                : mode === 'reset'
                  ? 'We will email you a secure link to choose a new password.'
                  : mode === 'update'
                    ? 'Enter a new password for your account.'
                  : 'Log in to see how many surprises you have sent.'}
            </p>

            {!isSupabaseConfigured && (
              <div role="status" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Account features need Supabase credentials. Local guest creation remains available.
              </div>
            )}
            {message && <div role="status" className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div>}
            {error && <div role="alert" className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === 'signup' && (
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">Full name</span>
                  <span className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-rose-400">
                    <UserRound className="h-4 w-4 text-slate-400" />
                    <input required autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full border-0 bg-transparent py-3 text-sm outline-none" placeholder="Your name" />
                  </span>
                </label>
              )}

              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">Email address</span>
                <span className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-rose-400">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full border-0 bg-transparent py-3 text-sm outline-none" placeholder="you@example.com" />
                </span>
              </label>

              {mode !== 'reset' && (
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">Password</span>
                  <span className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-rose-400">
                    <LockKeyhole className="h-4 w-4 text-slate-400" />
                    <input required minLength={8} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full border-0 bg-transparent py-3 text-sm outline-none" placeholder="At least 8 characters" />
                  </span>
                </label>
              )}

              {(mode === 'signup' || mode === 'update') && (
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">Confirm password</span>
                  <span className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-rose-400">
                    <LockKeyhole className="h-4 w-4 text-slate-400" />
                    <input required minLength={8} type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full border-0 bg-transparent py-3 text-sm outline-none" placeholder="Repeat your password" />
                  </span>
                </label>
              )}

              {mode === 'login' && (
                <div className="text-right">
                  <button type="button" onClick={() => changeMode('reset')} className="text-xs font-bold text-rose-600 hover:underline">Forgot password?</button>
                </div>
              )}

              <button type="submit" disabled={isSubmitting || !isSupabaseConfigured} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 py-3.5 text-sm font-black text-white shadow-lg shadow-rose-500/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50">
                {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {submitLabel}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              {mode === 'signup' ? (
                <>Already have an account? <button type="button" onClick={() => changeMode('login')} className="font-bold text-rose-600 hover:underline">Login</button></>
              ) : mode === 'reset' || mode === 'update' ? (
                <button type="button" onClick={() => changeMode('login')} className="font-bold text-rose-600 hover:underline">Back to login</button>
              ) : (
                <>New to BirthdayMagic? <button type="button" onClick={() => changeMode('signup')} className="font-bold text-rose-600 hover:underline">Create an account</button></>
              )}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
