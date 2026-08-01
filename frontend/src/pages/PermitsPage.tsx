import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPermitDetail, listPermits, PermitStatus } from '../services/permitService';

const statuses: Array<{ value: '' | PermitStatus; label: string }> = [
  { value: '', label: 'Tous les états' },
  { value: 'DRAFT', label: 'Brouillon' },
  { value: 'SUBMITTED', label: 'Soumis' },
  { value: 'APPROVED', label: 'Approuvé' },
  { value: 'ACTIVE', label: 'Actif' },
  { value: 'REJECTED', label: 'Refusé' },
  { value: 'CLOSED', label: 'Fermé' }
];

function formatDate(value?: string | null) {
  return value ? new Intl.DateTimeFormat('fr-CA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
}

const PermitsPage: React.FC = () => {
  const [status, setStatus] = useState<'' | PermitStatus>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const filters = useMemo(() => ({ status, q: search || undefined, page, pageSize: 20 }), [status, search, page]);

  const permitsQuery = useQuery({
    queryKey: ['permits', filters],
    queryFn: () => listPermits(filters)
  });

  const detailQuery = useQuery({
    queryKey: ['permit', selectedId],
    queryFn: () => getPermitDetail(selectedId as string),
    enabled: Boolean(selectedId)
  });

  return (
    <main className="space-y-6 p-4 md:p-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Permis municipaux</h1>
        <p className="mt-1 text-sm text-gray-600">Consultez les permis reçus, leur état, leur historique et les inspections liées.</p>
      </header>

      <section className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-[1fr_220px_auto]" aria-label="Filtres des permis">
        <label className="text-sm font-medium text-gray-700">
          Recherche
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Numéro ou type de permis" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
        </label>
        <label className="text-sm font-medium text-gray-700">
          État
          <select value={status} onChange={(event) => { setStatus(event.target.value as '' | PermitStatus); setPage(1); }} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
            {statuses.map((item) => <option key={item.value || 'all'} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <button type="button" onClick={() => permitsQuery.refetch()} className="self-end rounded-lg bg-cityflow-600 px-4 py-2 font-medium text-white hover:bg-cityflow-700">Actualiser</button>
      </section>

      {permitsQuery.isError ? <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">Impossible de charger les permis.</p> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white" aria-label="Registre des permis">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500"><tr><th className="px-4 py-3">Permis</th><th className="px-4 py-3">État</th><th className="px-4 py-3">Début</th><th className="px-4 py-3">Mise à jour</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {permitsQuery.isLoading ? <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Chargement…</td></tr> : null}
                {permitsQuery.data?.items.map((permit) => (
                  <tr key={permit.id} onClick={() => setSelectedId(permit.id)} className={`cursor-pointer hover:bg-cityflow-50 ${selectedId === permit.id ? 'bg-cityflow-50' : ''}`}>
                    <td className="px-4 py-3"><span className="font-semibold text-gray-900">{permit.sourceRef}</span><span className="block text-gray-500">{permit.subtype}</span></td>
                    <td className="px-4 py-3">{statuses.find((item) => item.value === permit.status)?.label || permit.status}</td>
                    <td className="px-4 py-3">{formatDate(permit.startTime)}</td>
                    <td className="px-4 py-3">{formatDate(permit.updatedAt)}</td>
                  </tr>
                ))}
                {!permitsQuery.isLoading && permitsQuery.data?.items.length === 0 ? <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Aucun permis trouvé.</td></tr> : null}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm">
            <span>{permitsQuery.data?.pagination.total ?? 0} permis</span>
            <div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded border px-3 py-1 disabled:opacity-40">Précédent</button><button disabled={!permitsQuery.data || page >= permitsQuery.data.pagination.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Suivant</button></div>
          </div>
        </section>

        <aside className="rounded-xl border border-gray-200 bg-white p-5" aria-live="polite">
          {!selectedId ? <p className="text-gray-500">Sélectionnez un permis pour afficher sa fiche.</p> : null}
          {detailQuery.isLoading ? <p className="text-gray-500">Chargement du détail…</p> : null}
          {detailQuery.isError ? <p role="alert" className="text-red-700">Impossible de charger ce permis.</p> : null}
          {detailQuery.data ? (
            <div className="space-y-6">
              <div><p className="text-xs uppercase tracking-wide text-gray-500">Permis</p><h2 className="text-xl font-bold text-gray-900">{detailQuery.data.permit.sourceRef}</h2><p className="text-sm text-gray-600">{detailQuery.data.permit.subtype}</p></div>
              <dl className="grid grid-cols-2 gap-3 text-sm"><div><dt className="text-gray-500">État</dt><dd className="font-medium">{detailQuery.data.permit.status}</dd></div><div><dt className="text-gray-500">Entrepreneur</dt><dd className="font-medium">{String(detailQuery.data.permit.details.contractor || '—')}</dd></div><div><dt className="text-gray-500">Début</dt><dd>{formatDate(detailQuery.data.permit.startTime)}</dd></div><div><dt className="text-gray-500">Fin</dt><dd>{formatDate(detailQuery.data.permit.endTime)}</dd></div></dl>
              <section><h3 className="font-semibold text-gray-900">Historique</h3><ol className="mt-2 space-y-2">{detailQuery.data.history.map((entry) => <li key={entry.id} className="rounded-lg bg-gray-50 p-3 text-sm"><span className="font-medium">{entry.action}</span><span className="block text-gray-500">{entry.previousStatus || '—'} → {entry.newStatus || '—'} · {formatDate(entry.occurredAt)}</span></li>)}</ol>{detailQuery.data.history.length === 0 ? <p className="mt-2 text-sm text-gray-500">Aucun historique disponible.</p> : null}</section>
              <section><h3 className="font-semibold text-gray-900">Inspections liées</h3><ul className="mt-2 space-y-2">{detailQuery.data.inspections.map((inspection) => <li key={inspection.id} className="rounded-lg border border-gray-200 p-3 text-sm"><span className="font-medium">{inspection.inspectionType}</span><span className="block text-gray-500">{inspection.status} · {formatDate(inspection.scheduledAt)}</span></li>)}</ul>{detailQuery.data.inspections.length === 0 ? <p className="mt-2 text-sm text-gray-500">Aucune inspection liée.</p> : null}</section>
            </div>
          ) : null}
        </aside>
      </div>
    </main>
  );
};

export default PermitsPage;
