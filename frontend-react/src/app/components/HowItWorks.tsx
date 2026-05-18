const steps = [
  {
    num: '01',
    title: 'Créez votre compte',
    description: 'Inscrivez votre entreprise en 2 minutes',
  },
  {
    num: '02',
    title: 'Uploadez votre DAO',
    description: "Déposez le dossier d'appel d'offres en PDF",
  },
  {
    num: '03',
    title: 'Analyse IA',
    description: 'Notre IA extrait et analyse toutes les exigences',
  },
  {
    num: '04',
    title: 'Résultats instantanés',
    description: 'Rapport de conformité + mémoire technique',
  },
];

export default function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-navy mb-4">
            Comment ça marche
          </h2>
          <div className="mx-auto w-16 h-1 bg-gold rounded-full" />
        </div>

        <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-navy/20 via-navy-light/30 to-gold/40" />

          {steps.map((step) => (
            <div key={step.num} className="relative text-center group">
              {/* Circle number */}
              <div className="relative z-10 mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full border-2 border-navy/10 bg-bg transition-all duration-300 group-hover:border-gold group-hover:shadow-lg group-hover:shadow-gold/10">
                <span className="text-2xl font-bold text-navy font-heading">{step.num}</span>
              </div>
              <h3 className="text-lg font-semibold text-navy mb-2">{step.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
