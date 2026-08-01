import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  citizenEscalationRunErrorMessage,
  getCitizenEscalationHistory,
  runCitizenEscalations
} from '../services/citizenRequestService';

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
  const queryClient = useQueryClient();
  const [runMessage, setRunMessage] = useState<string | null>(null);
  const [runMessageKind, setRunMessageKind] = useState<'success' | 'warning' | 'error'>('success');
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['citizen-escalation-history', 50],
    queryFn: () => getCitizenEscalationHistory(50)
  });
  const runMutation = useMutation({
    mutationFn: runCitizenEscalations,
    onSuccess: async (result) => {
      setRunMessageKind('success');
      setRunMessage(`${result.scanned} demande(s) analysée(s), ${result.candidates} candidate(s), ${result.created} alerte(s) créée(s).`);
      await queryClient.invalidateQueries({ queryKey: ['citizen-escalation-history'] });
    },
    onError: (error) => {
      const message = citizenEscalationRunErrorMessage(error);
      setRunMessageKind(message.startsWith('Un cycle') ? 'warning' : 'error');
      setRunMessage(message);
    }
  });

  const handleManualRun = () => {
    const confirmed = window.confirm('Lancer maintenant un cycle d’escalade pour votre municipalité?');
    if (!confirmed) return;
    setRunMessage(null);
    runMutation.mutate();
  };

  const messageClassName = runMessageKind === 'success'
    ? 'border-green-200 bg-green-50 text-green-800'
    : runMessageKind === 'warning'
      ? 'border-amber-200 bg-amber-50 text-amber-900'
      : 'border-red-200 bg-red-50 text-red-800';

  return (
    <section className="p-6 space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historique des escalades citoyennes</h1>
          <p className="mt-1 text-sm text-gray-600">Suivi des cycles automatiques, des volumes traités et des erreurs par municipalité.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleManualRun} disabled={runMutation.isPending} className="rounded-lg bg-cityflow-600 px-4 py-2 text-sm font-medium text-white hover:bg-cityflow-700 focus:outline-none focus:ring-2 focus:ring-cityflow-500 disabled:cursor-not-allowed disabled:opacity-60">
            {runMutation.isPending ? 'Cycle en cours…' : 'Lancer un cycle'}
          </button>
          <button type="button" onClick={() => void refetch()} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cityflow-500">
            Actualiser
          </button>
        </div>
      </header>

      {runMessage ? (
        <div role={runMessageKind === 'error' ? 'alert' : 'status'} aria-live="polite" className={`rounded-lg border p-4 text-sm ${messageClassName}`}>
          {runMessage}
        </div>
      ) : null}

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
