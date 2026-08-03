import { Link } from "react-router-dom";

const features = [
  ["Décisions vérifiables", "Centralisez permis, inspections et événements routiers avec un historique clair."],
  ["Coordination municipale", "Donnez aux équipes une même information à jour, structurée et exploitable."],
  ["Information citoyenne", "Diffusez les impacts routiers pertinents sans exposer les données internes."],
];

export default function PublicHomePage() {
  return (
    <div>
      <section className="bg-slate-950 px-4 py-20 text-white sm:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-sky-300">Gestion dynamique de la voirie</p>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">La circulation municipale, comprise et coordonnée au même endroit.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">CityFlow transforme les permis, les inspections et les changements de chantier en information routière fiable pour les équipes municipales, les citoyens et les partenaires.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex min-h-11 items-center justify-center rounded-md bg-sky-500 px-5 py-3 font-semibold text-slate-950 hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-white" to="/signup">Créer un compte</Link>
            <Link className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-500 px-5 py-3 font-semibold hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-white" to="/login">Se connecter</Link>
          </div>
        </div>
      </section>
      <section aria-labelledby="problem-title" className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 id="problem-title" className="text-3xl font-bold text-slate-950">Moins de silos. Moins d’incertitude. Plus de continuité.</h2>
          <p className="mt-4 max-w-3xl text-lg text-slate-700">Les changements routiers traversent plusieurs services. CityFlow relie les décisions, les preuves et la diffusion afin que chaque intervenant travaille avec le bon contexte.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {features.map(([title, description]) => <article key={title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="text-xl font-semibold text-slate-950">{title}</h3><p className="mt-3 text-slate-700">{description}</p></article>)}
          </div>
        </div>
      </section>
      <section className="bg-slate-100 px-4 py-16"><div className="mx-auto max-w-6xl"><h2 className="text-3xl font-bold text-slate-950">Conçu pour les municipalités et leurs partenaires</h2><p className="mt-4 max-w-3xl text-lg text-slate-700">Agents municipaux, gestionnaires, inspecteurs, entrepreneurs et citoyens disposent chacun d’un parcours adapté, sans mélanger les responsabilités ni les données.</p></div></section>
    </div>
  );
}
