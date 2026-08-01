import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCitizenEscalationHistory } from '../services/citizenRequestService';

const formatDate = (value: string) => new Intl.DateTimeFormat('fr-CA', {
  dateStyle: 'medium',
  timeStyle: 'short'
}).format(new Date(value));

const formatInterval = (intervalMs: number) => {
  const hours = Math.round(intervalMs / (60 * 60 * 1000));
  if (hours >= 24 && hours % 24 === 0) return `tous les ${hours / 24} jour${hours / 24 > 1 ? 's' : ''}`;
  return `toutes les ${Math.max(1, hours)} heure${hours > 1 ? 's' : ''}`;
};

const CitizenEscalationHistoryPage: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['citizen-escalation-history', 50],
    queryFn: () => getCitizenEscalationHistory(50)
  });

  return (
    <section className="p-6 space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historique des escalades citoyennes</h1>
          <p className="mt-1 text-sm text-gray-600">Suivi des cycles automatiques, des volumes traités et des erreurs par municipalité.</p>
        </div>
        <button type="button" onClick={() => void refetch()} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cityflow-500">
          Actualiser
        </button>
      </header>

      {data?.retention ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          Configuration effective : conservation pendant <strong>{data.retention.retentionDays} jours</strong>, avec nettoyage {formatInterval(data.retention.intervalMs)}.
        </div>
      ) : null}

      {isLoading ? <p className="text-sm text-gray-600">Chargement de l’historique…</p> : null}
      {isError ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">Impossible de charger l’historique des escalades.</div> : null}

      {!isLoading && !isError ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-4 py-3">Fin du cycle</th>
                <th className="px-4 py-3">État</th>
                <th className="px-4 py-3">Analysées</th>
                <th className="px-4 py-3">Candidates</th>
                <th className="px-4 py-3">Alertes</th>
                <th className="px-4 py-3">Durée</th>
                <th className="px-4 py-3">Erreur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(data?.items ?? []).map((run) => (
                <tr key={run.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">{formatDate(run.completedAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${run.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {run.status === 'SUCCESS' ? 'Réussi' : 'Échec'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{run.scanned}</td>
                  <td className="px-4 py-3 text-gray-700">{run.candidates}</td>
                  <td className="px-4 py-3 text-gray-700">{run.notificationsCreated}</td>
                  <td className="px-4 py-3 text-gray-700">{Math.max(0, run.durationMs)} ms</td>
                  <td className="max-w-sm px-4 py-3 text-gray-700">{run.errorMessage || '—'}</td>
                </tr>
              ))}
              {(data?.items.length ?? 0) === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Aucun cycle enregistré.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
};

export default CitizenEscalationHistoryPage;
