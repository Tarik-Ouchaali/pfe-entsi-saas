'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('auth_token')) {
      router.replace('/login');
    }
  }, [router]);

  const handleResend = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/auth/email/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'E-mail de vérification renvoyé avec succès.' });
      } else {
        setMessage({ type: 'error', text: data.message || "Impossible de renvoyer l'e-mail." });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    router.push('/login');
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
        </div>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>

          <h1 className="font-heading text-2xl font-bold text-navy mb-3">
            Vérifiez votre e-mail
          </h1>
          <p className="text-sm text-text-muted leading-relaxed mb-6">
            Un lien de vérification a été envoyé à votre adresse e-mail.
            Veuillez consulter votre boîte de réception et cliquer sur le lien pour activer votre compte.
          </p>

          {message && (
            <div
              className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            onClick={handleResend}
            disabled={loading}
            className="w-full rounded-lg bg-navy py-3 text-sm font-semibold text-white shadow-md shadow-navy/20 transition-all hover:bg-navy-light hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? 'Chargement...' : "Renvoyer l'e-mail"}
          </button>

          <button
            onClick={handleLogout}
            className="mt-4 w-full rounded-lg border border-border py-2.5 text-sm font-medium text-text-muted transition-all hover:bg-bg hover:text-navy"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
}
