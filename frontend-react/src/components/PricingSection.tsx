import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    price: 'Gratuit',
    period: '',
    featured: false,
    credits: '5 crédits offerts',
    features: ['Accès plateforme', 'Support email', '1 analyse DAO incluse'],
    cta: 'Commencer gratuitement',
    href: '/register',
  },
  {
    name: 'Professional',
    price: '299 MAD',
    period: '/mois',
    featured: true,
    credits: '50 crédits/mois',
    features: [
      '50 crédits mensuels',
      'Support prioritaire',
      'Historique analyses',
      'API access',
    ],
    cta: 'Choisir Professional',
    href: '/register',
  },
  {
    name: 'Business',
    price: '799 MAD',
    period: '/mois',
    featured: false,
    credits: '150 crédits/mois',
    features: [
      '150 crédits mensuels',
      'Support dédié',
      'Formation incluse',
      'Utilisateurs illimités',
    ],
    cta: 'Choisir Business',
    href: '/register',
  },
];

const packs = [
  { name: 'Pack S', credits: 10, price: '89 MAD' },
  { name: 'Pack M', credits: 30, price: '249 MAD' },
  { name: 'Pack L', credits: 100, price: '749 MAD' },
];

export default function PricingSection() {
  return (
    <section id="tarifs" className="py-20 lg:py-28 bg-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section title */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-4">
            Des tarifs adaptés à votre activité
          </h2>
          <div className="mx-auto w-16 h-1 bg-gold rounded-full" />
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl bg-white p-8 transition-all duration-300 hover:-translate-y-1 ${
                plan.featured
                  ? 'border-2 border-gold shadow-xl shadow-gold/10 scale-[1.03]'
                  : 'border border-border hover:shadow-lg hover:shadow-navy/[0.06]'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold px-4 py-1 text-xs font-bold text-white uppercase tracking-wide">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5L8 1z" fill="white"/>
                    </svg>
                    Recommandé
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-navy mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-4xl font-bold text-navy font-heading">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-text-muted">{plan.period}</span>
                  )}
                </div>
                <span className="inline-block rounded-full bg-navy/[0.06] px-3 py-1 text-xs font-medium text-navy">
                  {plan.credits}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-text-muted">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                      <circle cx="8" cy="8" r="8" fill={plan.featured ? '#C9A84C' : '#1A4FA0'} opacity="0.15"/>
                      <path d="M5 8l2 2 4-4" stroke={plan.featured ? '#C9A84C' : '#1A4FA0'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block w-full rounded-lg py-3 text-center text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                  plan.featured
                    ? 'bg-gold text-white shadow-md shadow-gold/25 hover:bg-gold-hover hover:shadow-lg'
                    : 'bg-navy/[0.06] text-navy hover:bg-navy/[0.1]'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-text-muted">
          1 crédit = 1 analyse DAO &nbsp;|&nbsp; 2 crédits = 1 mémoire technique
        </p>

        {/* Credit Packs Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="font-heading text-2xl sm:text-3xl font-bold text-navy mb-3">
              Besoin de plus de crédits ?
            </h3>
            <p className="text-text-muted text-sm">
              Achetez des crédits supplémentaires à tout moment, sans engagement
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {packs.map((pack) => (
              <div
                key={pack.name}
                className="group relative rounded-xl border border-border bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-navy/[0.06] hover:border-navy-light/20"
              >
                <h4 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-3">
                  {pack.name}
                </h4>
                <div className="text-4xl font-bold text-navy font-heading mb-2">
                  {pack.credits}
                </div>
                <p className="text-xs text-text-muted mb-4">crédits</p>
                <span className="inline-block rounded-full bg-gold px-4 py-1.5 text-sm font-bold text-white mb-4">
                  {pack.price}
                </span>
                <p className="text-xs text-text-muted mb-5">
                  Crédits permanents — n&apos;expirent jamais
                </p>
                <Link
                  href="/register"
                  className="block w-full rounded-lg bg-navy/[0.06] py-2.5 text-sm font-semibold text-navy transition-all hover:bg-navy/[0.1] hover:-translate-y-0.5"
                >
                  Acheter
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
