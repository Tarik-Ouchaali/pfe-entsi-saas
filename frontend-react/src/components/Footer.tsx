import Link from 'next/link';

const footerColumns = [
  {
    title: 'Produit',
    links: [
      { label: 'Fonctionnalités', href: '#fonctionnalites' },
      { label: 'Tarifs', href: '#tarifs' },
      { label: 'Démo', href: '#comment-ca-marche' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'Guide DAO', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'FAQ', href: '#' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { label: 'CGU', href: '#' },
      { label: 'Politique de confidentialité', href: '#' },
      { label: 'Mentions légales', href: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0B2148] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                <path d="M20 2L4 10v12c0 9.33 6.83 18.05 16 20 9.17-1.95 16-10.67 16-20V10L20 2z" fill="#1A4FA0" />
                <path d="M20 6L8 12v9c0 7.47 5.13 14.44 12 16 6.87-1.56 12-8.53 12-16v-9L20 6z" fill="#0F2D5E" />
                <path d="M17 20l-3-3-1.5 1.5L17 23l8-8-1.5-1.5L17 20z" fill="#C9A84C" />
              </svg>
              <span className="text-lg font-bold tracking-tight">
                ENTSI <span className="text-white/70">Conformité AO</span>
              </span>
            </Link>
            <p className="text-sm text-white/50 max-w-xs leading-relaxed">
              L&apos;IA au service de vos marchés publics
            </p>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/60 hover:text-gold transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact info */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap gap-6 text-sm text-white/50">
              <a href="mailto:contact@entsi.ma" className="hover:text-gold transition-colors flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                contact@entsi.ma
              </a>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                +212 5XX-XXXXXX
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Casablanca, Maroc
              </span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-white/40">
            © 2026 ENTSI Conformité AO. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
