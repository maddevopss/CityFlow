import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getExecutiveDashboard } from '../services/executiveDashboardService';

const ExecutiveDashboardPage: React.FC = () => {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const initialFrom = useMemo(() => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), []);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(today);
  const query = useQuery({ queryKey: ['executive-dashboard', from, to], queryFn: () => getExecutiveDashboard({ from: new Date(`${from}T00:00:00`).toISOString(), to: new Date(`${to}T23:59:59`).toISOString() }) });
  const data = query.data;
  const cards = data ? [
    { title: 'Inspections', primary: data.modules.inspections.completed, label: 'terminées', secondary: `${data.modules.inspections.nonCompliant} non conformes` },
    { title: 'Permis', primary: data.modules.permits.issued, label: 'délivrés', secondary: `${data.modules.permits.pending} en attente` },
    { title: 'Actifs', primary: data.modules.assets.total, label: 'enregistrés', secondary: `${data.modules.assets.critical} critiques · ${data.modules.assets.outOfService} hors service` },
    { title: 'Travaux publics', primary: data.modules.publicWorks.backlog, label: 'dans l’arriéré', secondary: `${data.modules.publicWorks.actualCost.toLocaleString('fr-CA')} $ de coûts réels` },
    { title: 'Signalements', primary: data.modules.citizenReports.open, label: 'ouverts', secondary: `${data.modules.citizenReports.resolved} résolus` }
  ] : [];
  return <div className="p-6 space-y-6"><div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><h1 className="text-2xl font-bold">Tableau de bord exécutif</h1><p className="text-sm text-gray-600">Vue transversale des opérations municipales.</p></div><div className="flex gap-3"><label className="text-sm font-medium">Du<input type="date" value={from} max={to} onChange={event => setFrom(event.target.value)} className="ml-2 rounded border px-3 py-2" /></label><label className="text-sm font-medium">Au<input type="date" value={to} min={from} onChange={event => setTo(event.target.value)} className="ml-2 rounded border px-3 py-2" /></label></div></div>{query.isLoading ? <div className="p-8 text-center">Calcul des indicateurs…</div> : query.isError ? <div className="rounded bg-red-50 p-4 text-red-800">Impossible de charger les indicateurs.</div> : <><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{cards.map(card => <section key={card.title} className="rounded-lg bg-white p-5 shadow"><h2 className="text-sm font-medium text-gray-500">{card.title}</h2><div className="mt-2 text-3xl font-bold text-gray-900">{card.primary}</div><div className="text-sm text-gray-600">{card.label}</div><div className="mt-3 text-xs text-gray-500">{card.secondary}</div></section>)}</div><div className="rounded-lg bg-white p-5 shadow"><h2 className="font-semibold">Fraîcheur et portée</h2><dl className="mt-3 grid gap-3 text-sm md:grid-cols-3"><div><dt className="text-gray-500">Généré le</dt><dd>{new Date(data!.generatedAt).toLocaleString('fr-CA')}</dd></div><div><dt className="text-gray-500">Période</dt><dd>{new Date(data!.period.from).toLocaleDateString('fr-CA')} au {new Date(data!.period.to).toLocaleDateString('fr-CA')}</dd></div><div><dt className="text-gray-500">Municipalité</dt><dd>#{data!.municipalityId}</dd></div></dl></div></>}</div>;
};

export default ExecutiveDashboardPage;
