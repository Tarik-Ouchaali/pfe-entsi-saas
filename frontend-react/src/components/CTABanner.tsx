import Link from 'next/link';

export default function CTABanner() {
  return (
    <section id="contact" className="relative py-20 lg:py-24 overflow-hidden bg-navy">
      {/* Decorative shapes */}
      <div className="absolute inset-0 -z-0">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-navy-light/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-gold/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
          Prêt à transformer votre processus d&apos;appels d&apos;offres ?
        </h2>
        <p className="text-lg text-white/70 mb-8 leading-relaxed">
          Rejoignez plus de 500 entreprises marocaines qui font confiance à ENTSI Conformité AO
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-8 py-4 text-sm font-bold text-white shadow-lg shadow-gold/30 transition-all hover:bg-gold-hover hover:shadow-xl hover:-translate-y-0.5"
        >
          Commencer gratuitement
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </section>
  );
}
