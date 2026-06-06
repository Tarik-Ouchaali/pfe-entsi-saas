import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-navy/[0.03] blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gold/[0.05] blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.08] px-4 py-1.5 mb-6">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5L8 1z" fill="#C9A84C"/>
              </svg>
              <span className="text-xs font-semibold text-gold tracking-wide uppercase">
                Plateforme certifiée marchés publics Maroc
              </span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.25rem] font-bold leading-[1.15] tracking-tight text-navy mb-6">
              Automatisez la conformité de vos dossiers d&apos;appels d&apos;offres
            </h1>

            <p className="text-lg leading-relaxed text-text-muted mb-8">
              Analysez vos DAO, vérifiez vos documents et générez votre mémoire technique en quelques minutes grâce à l&apos;intelligence artificielle.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-navy/25 hover:bg-navy-light transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                Essayer gratuitement
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6">
              {[
                { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', label: 'Données sécurisées' },
                { icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', label: 'Résultats en 5 min' },
                { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Conforme réglementation marocaine' },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-2 text-sm text-text-muted">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A4FA0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={badge.icon} />
                  </svg>
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Dashboard mockup SVG */}
          <div className="hidden lg:flex justify-center">
            <svg width="520" height="400" viewBox="0 0 520 400" fill="none" className="drop-shadow-2xl">
              {/* Main card */}
              <rect x="30" y="20" width="460" height="360" rx="16" fill="white" stroke="#E2E4EA" strokeWidth="1"/>
              {/* Title bar */}
              <rect x="30" y="20" width="460" height="50" rx="16" fill="#F8F9FC"/>
              <rect x="30" y="54" width="460" height="16" fill="#F8F9FC"/>
              <circle cx="58" cy="45" r="6" fill="#E74C3C"/>
              <circle cx="78" cy="45" r="6" fill="#F39C12"/>
              <circle cx="98" cy="45" r="6" fill="#2ECC71"/>
              <rect x="200" y="38" width="120" height="14" rx="7" fill="#E2E4EA"/>
              {/* Sidebar */}
              <rect x="30" y="70" width="120" height="310" fill="#0F2D5E" rx="0"/>
              <rect x="30" y="360" width="120" height="20" rx="0 0 16 0" fill="#0F2D5E"/>
              <rect x="46" y="90" width="88" height="10" rx="5" fill="#1A4FA0"/>
              <rect x="46" y="115" width="72" height="8" rx="4" fill="rgba(255,255,255,0.2)"/>
              <rect x="46" y="138" width="80" height="8" rx="4" fill="rgba(255,255,255,0.2)"/>
              <rect x="46" y="161" width="64" height="8" rx="4" fill="rgba(255,255,255,0.2)"/>
              <rect x="46" y="184" width="76" height="8" rx="4" fill="rgba(255,255,255,0.15)"/>
              {/* Main content area */}
              {/* Stats row */}
              <rect x="170" y="86" width="95" height="60" rx="8" fill="#F8F9FC" stroke="#E2E4EA" strokeWidth="0.5"/>
              <rect x="275" y="86" width="95" height="60" rx="8" fill="#F8F9FC" stroke="#E2E4EA" strokeWidth="0.5"/>
              <rect x="380" y="86" width="95" height="60" rx="8" fill="#F8F9FC" stroke="#E2E4EA" strokeWidth="0.5"/>
              <text x="217" y="112" textAnchor="middle" fill="#0F2D5E" fontSize="18" fontWeight="700">98%</text>
              <text x="217" y="130" textAnchor="middle" fill="#4A4A6A" fontSize="8">Conformité</text>
              <text x="322" y="112" textAnchor="middle" fill="#1A4FA0" fontSize="18" fontWeight="700">24</text>
              <text x="322" y="130" textAnchor="middle" fill="#4A4A6A" fontSize="8">DAO analysés</text>
              <text x="427" y="112" textAnchor="middle" fill="#C9A84C" fontSize="18" fontWeight="700">5m</text>
              <text x="427" y="130" textAnchor="middle" fill="#4A4A6A" fontSize="8">Temps moyen</text>
              {/* Chart area */}
              <rect x="170" y="162" width="200" height="120" rx="8" fill="white" stroke="#E2E4EA" strokeWidth="0.5"/>
              <text x="180" y="180" fill="#1A1A2E" fontSize="10" fontWeight="600">Analyses récentes</text>
              {/* Bar chart */}
              <rect x="190" y="240" width="20" height="30" rx="3" fill="#0F2D5E"/>
              <rect x="218" y="220" width="20" height="50" rx="3" fill="#1A4FA0"/>
              <rect x="246" y="230" width="20" height="40" rx="3" fill="#0F2D5E"/>
              <rect x="274" y="210" width="20" height="60" rx="3" fill="#1A4FA0"/>
              <rect x="302" y="200" width="20" height="70" rx="3" fill="#C9A84C"/>
              <rect x="330" y="225" width="20" height="45" rx="3" fill="#0F2D5E"/>
              {/* Checklist */}
              <rect x="380" y="162" width="95" height="120" rx="8" fill="white" stroke="#E2E4EA" strokeWidth="0.5"/>
              <text x="390" y="180" fill="#1A1A2E" fontSize="9" fontWeight="600">Conformité</text>
              <rect x="390" y="192" width="10" height="10" rx="2" fill="#2ECC71"/>
              <rect x="406" y="194" width="56" height="6" rx="3" fill="#E2E4EA"/>
              <rect x="390" y="210" width="10" height="10" rx="2" fill="#2ECC71"/>
              <rect x="406" y="212" width="48" height="6" rx="3" fill="#E2E4EA"/>
              <rect x="390" y="228" width="10" height="10" rx="2" fill="#2ECC71"/>
              <rect x="406" y="230" width="52" height="6" rx="3" fill="#E2E4EA"/>
              <rect x="390" y="246" width="10" height="10" rx="2" fill="#E74C3C"/>
              <rect x="406" y="248" width="44" height="6" rx="3" fill="#E2E4EA"/>
              <rect x="390" y="264" width="10" height="10" rx="2" fill="#2ECC71"/>
              <rect x="406" y="266" width="60" height="6" rx="3" fill="#E2E4EA"/>
              {/* Bottom section */}
              <rect x="170" y="298" width="305" height="68" rx="8" fill="white" stroke="#E2E4EA" strokeWidth="0.5"/>
              <text x="184" y="318" fill="#1A1A2E" fontSize="10" fontWeight="600">Mémoire technique générée</text>
              <rect x="184" y="328" width="180" height="8" rx="4" fill="#0F2D5E"/>
              <rect x="184" y="342" width="120" height="6" rx="3" fill="#E2E4EA"/>
              <rect x="184" y="354" width="160" height="6" rx="3" fill="#E2E4EA"/>
              {/* Gold accent badge */}
              <rect x="400" y="312" width="60" height="24" rx="12" fill="#C9A84C"/>
              <text x="430" y="328" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">Conforme</text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
