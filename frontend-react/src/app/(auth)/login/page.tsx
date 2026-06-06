'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

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
    if (!form.email.trim()) errs.email = "L'adresse e-mail est requise.";
    else if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(form.email))
      errs.email = "Le format de l'adresse e-mail est invalide.";
    if (!form.password) errs.password = 'Le mot de passe est requis.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email: form.email.toLowerCase(),
          password: form.password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        if (data.user.role === 'SuperAdmin') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      } else if (res.status === 403) {
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
        if (data.user) {
          localStorage.setItem('auth_user', JSON.stringify(data.user));
        }
        router.push('/verify-email');
      } else {
        setErrors({ general: data.message || 'Identifiants incorrects.' });
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
            Connexion
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Accédez à votre espace de conformité
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          {errors.general && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text mb-1.5">
                Adresse e-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="nom@entreprise.ma"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm text-text placeholder:text-text-muted/50 outline-none transition-all focus:ring-2 focus:ring-navy/20 focus:border-navy ${errors.email ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : 'border-border'
                  }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-text">
                  Mot de passe
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-navy-light hover:text-navy transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm text-text placeholder:text-text-muted/50 outline-none transition-all focus:ring-2 focus:ring-navy/20 focus:border-navy ${errors.password ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : 'border-border'
                  }`}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-navy py-3 text-sm font-semibold text-white shadow-md shadow-navy/20 transition-all hover:bg-navy-light hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? 'Chargement...' : 'Se connecter'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            Pas encore de compte ?{' '}
            <Link href="/register" className="font-semibold text-navy hover:text-navy-light transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
