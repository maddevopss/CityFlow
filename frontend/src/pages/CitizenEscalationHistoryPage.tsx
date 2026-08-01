import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { citizenEscalationRunErrorMessage, getCitizenEscalationHistory, runCitizenEscalations } from '../services/citizenRequestService';
import { citizenEscalationSourceLabel, citizenEscalationSourceTone } from '../features/citizenEscalations/presentation';
import { filterEscalationRuns } from '../features/citizenEscalations/filters';
import { summarizeEscalationRuns } from '../features/citizenEscalations/summary';

const formatDate = (value: string) => new Intl.DateTimeFormat('fr-CA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

const CitizenEscalationHistoryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [runMessage, setRunMessage] = useState<string | null>(null);
  const [runMessageKind, setRunMessageKind] = useState<'success' | 'warning' | 'error'>('success');
  const [source, setSource] = useState('');
  const [status, setStatus] = useState<'' | 'SUCCESS' | 'FAILED'>('');
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['citizen-escalation-history', 50],
    queryFn: () => getCitizenEscalationHistory(50),
    refetchInterval: runMessageKind === 'warning' ? 3000 : false
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

  const items = filterEscalationRuns(data?.items ?? [], { source: source || undefined, status: status || undefined });
  const summary = summarizeEscalationRuns(items);
  const handleManualRun = () => {
    if (!window.confirm('Lancer maintenant un cycle d’escalade pour votre municipalité?')) return;
    setRunMessage(null);
    runMutation.mutate();
  };
  const messageClassName = runMessageKind === 'success' ? 'border-green-200 bg-green-50 text-green-800' : runMessageKind === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-red-200 bg-red-50 text-red-800';

  return (
    <section className="p-6 space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Historique des escalades citoyennes</h1><p className="mt-1 text-sm text-gray-600">Suivi des cycles automatiques et manuels par municipalité.</p></div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleManualRun} disabled={runMutation.isPending} className="rounded-lg bg-cityflow-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">{runMutation.isPending ? 'Cycle en cours…' : 'Lancer un cycle'}</button>
          <button type="button" onClick={() => void refetch()} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">Actualiser</button>
        </div>
      </header>

      {runMessage ? <div role={runMessageKind === 'error' ? 'alert' : 'status'} aria-live="polite" className={`rounded-lg border p-4 text-sm ${messageClassName}`}>{runMessage}{runMessageKind === 'warning' ? ' La page se rafraîchit automatiquement.' : ''}</div> : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Object.entries({ Cycles: summary.total, Réussis: summary.successful, Échecs: summary.failed, Alertes: summary.notificationsCreated, 'Durée moy.': `${summary.averageDurationMs} ms` }).map(([label, value]) => <div key={label} className="rounded-lg border bg-white p-4"><div className="text-xs uppercase text-gray-500">{label}</div><div className="mt-1 text-xl font-semibold">{value}</div></div>)}
      </div>

      <div className="flex flex-wrap gap-3 rounded-lg border bg-white p-4">
        <label className="text-sm">Source <select value={source} onChange={(event) => setSource(event.target.value)} className="ml-2 rounded border px-2 py-1"><option value="">Toutes</option><option value="SCHEDULED">Planifié</option><option value="MANUAL">Manuel</option></select></label>
        <label className="text-sm">État <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="ml-2 rounded border px-2 py-1"><option value="">Tous</option><option value="SUCCESS">Réussi</option><option value="FAILED">Échec</option></select></label>
      </div>

      {isLoading ? <p>Chargement…</p> : null}
      {isError ? <div className="rounded border border-red-200 bg-red-50 p-4 text-red-800">Impossible de charger l’historique.</div> : null}
      {!isLoading && !isError ? <div className="overflow-x-auto rounded-lg border bg-white"><table className="min-w-full divide-y text-sm"><thead className="bg-gray-50 text-left text-xs uppercase text-gray-600"><tr><th className="px-4 py-3">Fin</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">État</th><th className="px-4 py-3">Analysées</th><th className="px-4 py-3">Candidates</th><th className="px-4 py-3">Alertes</th><th className="px-4 py-3">Durée</th><th className="px-4 py-3">Erreur</th></tr></thead><tbody className="divide-y">{items.map((run) => <tr key={run.id}><td className="px-4 py-3">{formatDate(run.completedAt)}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${citizenEscalationSourceTone(run.source)}`}>{citizenEscalationSourceLabel(run.source)}</span></td><td className="px-4 py-3">{run.status === 'SUCCESS' ? 'Réussi' : 'Échec'}</td><td className="px-4 py-3">{run.scanned}</td><td className="px-4 py-3">{run.candidates}</td><td className="px-4 py-3">{run.notificationsCreated}</td><td className="px-4 py-3">{Math.max(0, run.durationMs)} ms</td><td className="px-4 py-3">{run.errorMessage || '—'}</td></tr>)}{items.length === 0 ? <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Aucun cycle correspondant.</td></tr> : null}</tbody></table></div> : null}
    </section>
  );
};

export default CitizenEscalationHistoryPage;
