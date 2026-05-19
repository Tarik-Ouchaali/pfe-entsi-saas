'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface FormErrors {
  password?: string;
  password_confirmation?: string;
  general?: string;
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [form, setForm] = useState({ password: '', password_confirmation: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('auth_token')) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      delete next.general;
      return next;
    });
  };

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!form.password)
      errs.password = 'Le mot de passe est requis.';
    else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_+\-])[A-Za-z\d@$!%*?&.#^()_+\-]{8,}$/.test(
        form.password
      )
    )
      errs.password =
        'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.';
    if (!form.password_confirmation)
      errs.password_confirmation = 'La confirmation du mot de passe est requise.';
    else if (form.password !== form.password_confirmation)
      errs.password_confirmation =
        'La confirmation du mot de passe ne correspond pas.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (!token || !email) {
      setErrors({ general: 'Lien de réinitialisation invalide ou expiré.' });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          token,
          email: email.toLowerCase(),
          password: form.password,
          password_confirmation: form.password_confirmation,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setErrors({ general: data.message || 'Erreur lors de la réinitialisation.' });
      }
    } catch {
      setErrors({ general: 'Erreur de connexion au serveur.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none" className="transition-transform group-hover:scale-105">
              <path d="M20 2L4 10v12c0 9.33 6.83 18.05 16 20 9.17-1.95 16-10.67 16-20V10L20 2z" fill="#0F2D5E" />
              <path d="M20 6L8 12v9c0 7.47 5.13 14.44 12 16 6.87-1.56 12-8.53 12-16v-9L20 6z" fill="#1A4FA0" />
              <path d="M17 20l-3-3-1.5 1.5L17 23l8-8-1.5-1.5L17 20z" fill="#C9A84C" />
            </svg>
            <span className="text-lg font-bold text-navy tracking-tight">
              ENTSI <span className="text-navy-light">Conformité AO</span>
            </span>
          </Link>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-navy">
            Réinitialiser le mot de passe
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Choisissez un nouveau mot de passe sécurisé
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          {success ? (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-navy mb-2">Mot de passe réinitialisé</h2>
              <p className="text-sm text-text-muted mb-6">
                Votre mot de passe a été modifié avec succès.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-navy/20 transition-all hover:bg-navy-light hover:shadow-lg hover:-translate-y-0.5"
              >
                Se connecter
              </Link>
            </div>
          ) : (
            <>
              {errors.general && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-text mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm text-text placeholder:text-text-muted/50 outline-none transition-all focus:ring-2 focus:ring-navy/20 focus:border-navy ${
                      errors.password ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : 'border-border'
                    }`}
                  />
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password_confirmation" className="block text-sm font-medium text-text mb-1.5">
                    Confirmer le mot de passe
                  </label>
                  <input
                    id="password_confirmation"
                    type="password"
                    placeholder="••••••••"
                    value={form.password_confirmation}
                    onChange={(e) => handleChange('password_confirmation', e.target.value)}
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm text-text placeholder:text-text-muted/50 outline-none transition-all focus:ring-2 focus:ring-navy/20 focus:border-navy ${
                      errors.password_confirmation ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : 'border-border'
                    }`}
                  />
                  {errors.password_confirmation && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.password_confirmation}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-navy py-3 text-sm font-semibold text-white shadow-md shadow-navy/20 transition-all hover:bg-navy-light hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? 'Chargement...' : 'Réinitialiser le mot de passe'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-text-muted">
                <Link href="/login" className="font-semibold text-navy hover:text-navy-light transition-colors">
                  Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-sm text-text-muted">Chargement...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
