'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('auth_token')) {
      router.replace('/dashboard');
    }
  }, [router]);

  const validate = (): string | undefined => {
    if (!email.trim()) return "L'adresse e-mail est requise.";
    if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email))
      return "Le format de l'adresse e-mail est invalide.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    setError('');
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });
    } catch {
      // Silently handle — always show same message
    } finally {
      setLoading(false);
      setSubmitted(true);
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
            Mot de passe oublié
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Entrez votre e-mail pour recevoir un lien de réinitialisation
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <p className="text-sm text-text-muted leading-relaxed mb-6">
                Si l&apos;email existe, un lien vous sera envoyé.
                Vérifiez votre boîte de réception.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-navy/20 transition-all hover:bg-navy-light hover:shadow-lg hover:-translate-y-0.5"
              >
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text mb-1.5">
                    Adresse e-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="nom@entreprise.ma"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm text-text placeholder:text-text-muted/50 outline-none transition-all focus:ring-2 focus:ring-navy/20 focus:border-navy ${
                      error ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : 'border-border'
                    }`}
                  />
                  {error && (
                    <p className="mt-1.5 text-xs text-red-600">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-navy py-3 text-sm font-semibold text-white shadow-md shadow-navy/20 transition-all hover:bg-navy-light hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? 'Chargement...' : 'Envoyer le lien'}
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
