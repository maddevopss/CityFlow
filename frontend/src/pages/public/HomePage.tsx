import { Link } from "react-router-dom";

const benefits = [
  ["Informer clairement", "Centralisez les entraves et changements qui touchent les déplacements."],
  ["Coordonner les équipes", "Reliez permis, inspections et interventions dans un même parcours traçable."],
  ["Répondre aux citoyens", "Suivez les demandes et communiquez des mises à jour compréhensibles."],
];

export default function HomePage() {
  return (
    <>
      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-sky-300">Gestion municipale de la mobilité</p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              La bonne information routière, au bon moment.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              CityFlow aide les municipalités à gérer les événements routiers, permis, inspections et demandes citoyennes dans une source officielle et traçable.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="rounded-lg bg-sky-500 px-5 py-3 font-bold text-slate-950 hover:bg-sky-400">
                Créer un compte
              </Link>
              <Link to="/contact" className="rounded-lg border border-slate-600 px-5 py-3 font-bold text-white hover:bg-slate-900">
                Parler à notre équipe
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <p className="text-sm font-semibold text-sky-300">Vue opérationnelle unifiée</p>
            <dl className="mt-6 grid grid-cols-2 gap-4">
              {[['Événements', 'Temps réel'], ['Permis', 'Traçables'], ['Inspections', 'Planifiées'], ['Demandes', 'Suivies']].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-800 p-4">
                  <dt className="text-sm text-slate-400">{label}</dt>
                  <dd className="mt-1 text-xl font-bold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black tracking-tight">Une base solide pour mieux servir le territoire</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {benefits.map(([title, description]) => (
            <article key={title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
