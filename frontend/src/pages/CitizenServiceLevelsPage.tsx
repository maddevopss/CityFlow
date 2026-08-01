import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  citizenRequestDetailPath,
  getCitizenRequestServiceLevels,
  type CitizenServiceLevel,
} from '../services/citizenRequestService';

const LEVELS: Array<{ value: CitizenServiceLevel | ''; label: string }> = [
  { value: '', label: 'Tous les délais' },
  { value: 'ON_TRACK', label: 'Conformes' },
  { value: 'AT_RISK', label: 'À risque' },
  { value: 'BREACHED', label: 'Dépassés' },
  { value: 'COMPLETED', label: 'Terminés' },
];

const levelLabel: Record<CitizenServiceLevel, string> = {
  ON_TRACK: 'Conforme',
  AT_RISK: 'À risque',
  BREACHED: 'Délai dépassé',
  COMPLETED: 'Terminé',
};

const CitizenServiceLevelsPage: React.FC = () => {
  const [level, setLevel] = useState<CitizenServiceLevel | ''>('');
  const serviceLevels = useQuery({
    queryKey: ['citizen-request-service-levels', level],
    queryFn: () => getCitizenRequestServiceLevels(level || undefined),
  });

  return (
    <main className="space-y-6" aria-labelledby="citizen-service-levels-title">
      <header>
        <h1 id="citizen-service-levels-title" className="text-2xl font-semibold">Délais des demandes citoyennes</h1>
        <p className="text-sm text-slate-600">Repérer les dossiers à risque et ceux dont l’échéance est dépassée.</p>
      </header>

      <label className="grid max-w-sm gap-1">
        <span>Afficher</span>
        <select className="rounded border px-3 py-2" value={level} onChange={(event) => setLevel(event.target.value as CitizenServiceLevel | '')}>
          {LEVELS.map((option) => <option key={option.value || 'all'} value={option.value}>{option.label}</option>)}
        </select>
      </label>

      {serviceLevels.isLoading && <p>Chargement des délais…</p>}
      {serviceLevels.isError && <p role="alert" className="text-red-700">Les délais ne peuvent pas être chargés.</p>}
      {serviceLevels.data && <>
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Résumé des niveaux de service">
          {LEVELS.filter((item) => item.value).map((item) => <article key={item.value} className="rounded-lg border bg-white p-4"><p className="text-sm text-slate-600">{item.label}</p><strong className="text-2xl">{serviceLevels.data.summary[item.value as CitizenServiceLevel] ?? 0}</strong></article>)}
        </section>
        <section className="overflow-x-auto rounded-lg border bg-white" aria-label="Demandes et échéances">
          <table className="min-w-full divide-y">
            <thead><tr className="text-left text-sm text-slate-600"><th className="p-3">Demande</th><th className="p-3">État du délai</th><th className="p-3">Échéance</th><th className="p-3">Temps restant</th><th className="p-3"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody className="divide-y">{serviceLevels.data.items.map((item) => <tr key={item.id}><td className="p-3"><strong className="block">{item.title}</strong><span className="text-sm text-slate-600">{item.category} · {item.status}</span></td><td className="p-3"><span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">{levelLabel[item.serviceLevel.level]}</span></td><td className="p-3"><time dateTime={item.serviceLevel.dueAt}>{new Date(item.serviceLevel.dueAt).toLocaleString()}</time></td><td className="p-3">{item.serviceLevel.level === 'COMPLETED' ? '—' : `${item.serviceLevel.hoursRemaining} h`}</td><td className="p-3 text-right"><Link className="rounded border px-3 py-2 text-sm font-medium hover:bg-slate-50" to={citizenRequestDetailPath(item.id)}>Ouvrir</Link></td></tr>)}</tbody>
          </table>
          {serviceLevels.data.items.length === 0 && <p className="p-4">Aucune demande ne correspond à ce filtre.</p>}
        </section>
      </>}
    </main>
  );
};

export default CitizenServiceLevelsPage;
