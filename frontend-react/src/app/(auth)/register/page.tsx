'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface FormErrors {
  raison_sociale?: string;
  ice?: string;
  nom?: string;
  prenom?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  general?: string;
}

const validators = {
  raison_sociale: (v: string): string | undefined => {
    if (!v.trim()) return 'La raison sociale est requise.';
    if (!/^[a-zA-ZÀ-ÿ0-9\s&'.\-]{3,255}$/.test(v))
      return 'La raison sociale contient des caractères non autorisés.';
  },
  ice: (v: string): string | undefined => {
    if (!v.trim()) return "L'ICE est requis.";
    if (!/^[0-9]{15}$/.test(v))
      return "L'ICE doit contenir exactement 15 chiffres.";
  },
  nom: (v: string): string | undefined => {
    if (!v.trim()) return 'Le nom est requis.';
    if (!/^[a-zA-ZÀ-ÿ\s'\-]{2,50}$/.test(v))
      return 'Le nom contient des caractères non autorisés.';
  },
  prenom: (v: string): string | undefined => {
    if (!v.trim()) return 'Le prénom est requis.';
    if (!/^[a-zA-ZÀ-ÿ\s'\-]{2,50}$/.test(v))
      return 'Le prénom contient des caractères non autorisés.';
  },
  email: (v: string): string | undefined => {
    if (!v.trim()) return "L'adresse e-mail est requise.";
    if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(v))
      return "Le format de l'adresse e-mail est invalide.";
  },
  password: (v: string): string | undefined => {
    if (!v) return 'Le mot de passe est requis.';
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_+\-])[A-Za-z\d@$!%*?&.#^()_+\-]{8,}$/.test(
        v
      )
    )
      return 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.';
  },
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    raison_sociale: '',
    ice: '',
    nom: '',
    prenom: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
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
    const r = validators.raison_sociale(form.raison_sociale);
    if (r) errs.raison_sociale = r;
    const i = validators.ice(form.ice);
    if (i) errs.ice = i;
    const n = validators.nom(form.nom);
    if (n) errs.nom = n;
    const p = validators.prenom(form.prenom);
    if (p) errs.prenom = p;
    const e = validators.email(form.email);
    if (e) errs.email = e;
    const pw = validators.password(form.password);
    if (pw) errs.password = pw;
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
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...form,
          email: form.email.toLowerCase(),
        }),
      });
      const data = await res.json();
      if (res.status === 201) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        router.push('/verify-email');
      } else {
        const apiErrors: FormErrors = {};
        if (data.errors) {
          for (const [key, msgs] of Object.entries(data.errors)) {
            apiErrors[key as keyof FormErrors] = (msgs as string[])[0];
          }
        }
        if (data.message) apiErrors.general = data.message;
        setErrors(apiErrors);
      }
    } catch {
      setErrors({ general: 'Erreur de connexion au serveur.' });
    } finally {
      setLoading(false);
    }
  };

  const fields: {
    name: keyof typeof form;
    label: string;
    type: string;
    placeholder: string;
  }[] = [
    { name: 'raison_sociale', label: "Raison sociale de l'entreprise", type: 'text', placeholder: 'SARL Exemple Maroc' },
    { name: 'ice', label: 'ICE (15 chiffres)', type: 'text', placeholder: '000000000000000' },
    { name: 'nom', label: 'Nom', type: 'text', placeholder: 'Votre nom' },
    { name: 'prenom', label: 'Prénom', type: 'text', placeholder: 'Votre prénom' },
    { name: 'email', label: 'Adresse e-mail', type: 'email', placeholder: 'nom@entreprise.ma' },
    { name: 'password', label: 'Mot de passe', type: 'password', placeholder: '••••••••' },
    { name: 'password_confirmation', label: 'Confirmer le mot de passe', type: 'password', placeholder: '••••••••' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-lg">
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
            Créer votre compte
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Commencez à automatiser vos appels d&apos;offres
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          {errors.general && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.map((f) => (
              <div key={f.name}>
                <label htmlFor={f.name} className="block text-sm font-medium text-text mb-1.5">
                  {f.label}
                </label>
                <input
                  id={f.name}
                  name={f.name}
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.name]}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm text-text placeholder:text-text-muted/50 outline-none transition-all focus:ring-2 focus:ring-navy/20 focus:border-navy ${
                    errors[f.name] ? 'border-red-400 focus:ring-red-200 focus:border-red-400' : 'border-border'
                  }`}
                />
                {errors[f.name] && (
                  <p className="mt-1.5 text-xs text-red-600">{errors[f.name]}</p>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-navy py-3 text-sm font-semibold text-white shadow-md shadow-navy/20 transition-all hover:bg-navy-light hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? 'Chargement...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="font-semibold text-navy hover:text-navy-light transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
