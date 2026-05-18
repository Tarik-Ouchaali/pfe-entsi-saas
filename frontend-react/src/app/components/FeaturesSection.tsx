const features = [
  {
    title: 'Analyse automatique des DAO',
    description: 'Extraction intelligente des exigences depuis vos PDFs',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A4FA0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    title: 'Vérification de conformité',
    description: 'Matching sémantique exigences vs documents entreprise',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A4FA0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4" />
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: 'Génération de mémoire technique',
    description: 'Mémoire structurée générée automatiquement',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A4FA0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    title: 'Bibliothèque de documents',
    description: 'Centralisez vos pièces avec versioning automatique',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A4FA0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    title: 'Multi-entreprises sécurisé',
    description: 'Isolation complète des données par entreprise',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A4FA0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
  },
  {
    title: 'Gain de temps 80%',
    description: 'Réduisez drastiquement la préparation de vos dossiers',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A4FA0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export default function FeaturesSection() {
  return (
    <section id="fonctionnalites" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-4">
            Tout ce dont vous avez besoin pour répondre aux appels d&apos;offres
          </h2>
          <div className="mx-auto w-16 h-1 bg-gold rounded-full" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative rounded-xl border border-border bg-white p-7 transition-all duration-300 hover:shadow-xl hover:shadow-navy/[0.06] hover:-translate-y-1 hover:border-navy-light/20"
            >
              <div className="mb-4 inline-flex rounded-lg bg-navy/[0.06] p-3 transition-colors group-hover:bg-navy/[0.1]">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-navy mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed text-text-muted">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
