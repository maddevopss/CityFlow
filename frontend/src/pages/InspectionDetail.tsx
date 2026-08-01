import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../components/common/Button';
import { completeInspection, getInspectionById } from '../services/inspectionService';
import type { InspectionOutcome } from '../types';

const outcomeLabels: Record<InspectionOutcome, string> = {
  COMPLIANT: 'Conforme',
  NON_COMPLIANT: 'Non conforme',
  FOLLOW_UP_REQUIRED: 'Suivi requis'
};

const InspectionDetail: React.FC = () => {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const [outcome, setOutcome] = useState<InspectionOutcome>('COMPLIANT');
  const [findings, setFindings] = useState('');

  const inspectionQuery = useQuery({
    queryKey: ['inspection', id],
    queryFn: () => getInspectionById(id),
    enabled: Boolean(id)
  });

  const completeMutation = useMutation({
    mutationFn: () => completeInspection(id, { outcome, findings }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['inspection', id] }),
        queryClient.invalidateQueries({ queryKey: ['inspections'] })
      ]);
      toast.success('Inspection terminée');
    },
    onError: () => toast.error('Impossible de terminer l’inspection')
  });

  if (inspectionQuery.isLoading) {
    return <div className="flex justify-center p-8"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cityflow-600" /></div>;
  }

  if (inspectionQuery.isError || !inspectionQuery.data) {
    return <div className="p-6"><div className="rounded-lg bg-red-50 p-4 text-red-800">Inspection introuvable ou inaccessible.</div></div>;
  }

  const inspection = inspectionQuery.data;

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link to="/inspections" className="text-sm text-cityflow-700 hover:underline">← Retour aux inspections</Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Inspection — {inspection.address}</h1>
      </div>

      <section className="grid gap-4 rounded-lg bg-white p-6 shadow md:grid-cols-2">
        <div><span className="text-sm text-gray-500">Date prévue</span><p className="font-medium">{new Date(inspection.scheduledAt).toLocaleString('fr-CA')}</p></div>
        <div><span className="text-sm text-gray-500">Statut</span><p className="font-medium">{inspection.status}</p></div>
        <div><span className="text-sm text-gray-500">Type</span><p className="font-medium">{inspection.inspectionType}</p></div>
        <div><span className="text-sm text-gray-500">Permis</span><p className="font-medium">{inspection.permitId || 'Non lié'}</p></div>
        <div className="md:col-span-2"><span className="text-sm text-gray-500">Notes</span><p className="whitespace-pre-wrap font-medium">{inspection.notes || 'Aucune note'}</p></div>
        {inspection.status === 'COMPLETED' && (
          <>
            <div><span className="text-sm text-gray-500">Résultat</span><p className="font-medium">{inspection.outcome ? outcomeLabels[inspection.outcome] : '-'}</p></div>
            <div><span className="text-sm text-gray-500">Terminée le</span><p className="font-medium">{inspection.completedAt ? new Date(inspection.completedAt).toLocaleString('fr-CA') : '-'}</p></div>
            <div className="md:col-span-2"><span className="text-sm text-gray-500">Constats</span><p className="whitespace-pre-wrap font-medium">{inspection.findings}</p></div>
          </>
        )}
      </section>

      {inspection.status === 'SCHEDULED' && (
        <form
          onSubmit={event => {
            event.preventDefault();
            completeMutation.mutate();
          }}
          className="space-y-4 rounded-lg bg-white p-6 shadow"
        >
          <h2 className="text-lg font-semibold text-gray-900">Terminer l’inspection</h2>
          <label className="block text-sm font-medium text-gray-700">
            Résultat
            <select value={outcome} onChange={event => setOutcome(event.target.value as InspectionOutcome)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2">
              {Object.entries(outcomeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Constats
            <textarea required minLength={3} rows={6} value={findings} onChange={event => setFindings(event.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
          </label>
          <Button type="submit" disabled={completeMutation.isPending || findings.trim().length < 3}>
            {completeMutation.isPending ? 'Enregistrement…' : 'Terminer l’inspection'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default InspectionDetail;
