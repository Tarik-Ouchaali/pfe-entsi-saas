import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    price: 'Gratuit',
    period: '',
    featured: false,
    features: ['5 crédits offerts', '1 utilisateur', 'Support email'],
    cta: 'Commencer gratuitement',
    href: '/register',
  },
  {
    name: 'Professional',
    price: '299 MAD',
    period: '/mois',
    featured: true,
    features: [
      '50 crédits/mois',
      '5 utilisateurs',
      'Support prioritaire',
      'Historique analyses',
    ],
    cta: 'Choisir Professional',
    href: '/register',
  },
  {
    name: 'Enterprise',
    price: 'Sur devis',
    period: '',
    featured: false,
    features: [
      'Crédits illimités',
      'Utilisateurs illimités',
      'Support dédié',
      'Formation incluse',
    ],
    cta: 'Nous contacter',
    href: '/contact',
  },
];

export default function PricingSection() {
  return (
    <section id="tarifs" className="py-20 lg:py-28 bg-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-4">
            Des tarifs adaptés à votre activité
          </h2>
          <div className="mx-auto w-16 h-1 bg-gold rounded-full" />
        </div>

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

              <div className="text-center mb-8">
                <h3 className="text-lg font-semibold text-navy mb-4">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-navy font-heading">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-text-muted">{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-text-muted">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
      </div>
    </section>
  );
}
