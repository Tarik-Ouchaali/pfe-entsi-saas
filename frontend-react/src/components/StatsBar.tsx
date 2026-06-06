export default function StatsBar() {
  const stats = [
    { value: '500+', label: 'entreprises inscrites' },
    { value: '10 000+', label: 'DAO analysés' },
    { value: '98%', label: 'taux de conformité' },
    { value: '5 min', label: "temps d'analyse moyen" },
  ];

  return (
    <section className="bg-navy py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-gold font-heading mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-white/70">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
