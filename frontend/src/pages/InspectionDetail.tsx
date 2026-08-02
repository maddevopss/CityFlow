import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Select } from '../components/forms/Select';
import { Textarea } from '../components/forms/Textarea';
import { useInspectionDetail } from '../hooks/useInspections';
import type { InspectionOutcome } from '../types';

const outcomeLabels: Record<InspectionOutcome, string> = {
  COMPLIANT: 'Conforme',
  NON_COMPLIANT: 'Non conforme',
  FOLLOW_UP_REQUIRED: 'Suivi requis'
};

const InspectionDetail: React.FC = () => {
  const { id = '' } = useParams();
  const [outcome, setOutcome] = useState<InspectionOutcome>('COMPLIANT');
  const [findings, setFindings] = useState('');

  const {
    inspection,
    isLoading,
    isError,
    completeInspection,
    isCompleting
  } = useInspectionDetail(id);

  if (isLoading) {
    return <div className="flex justify-center p-8"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cityflow-600" /></div>;
  }

  if (isError || !inspection) {
    return <div className="p-6"><div className="rounded-lg bg-red-50 p-4 text-red-800">Inspection introuvable ou inaccessible.</div></div>;
  }

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
            completeInspection({ outcome, findings });
          }}
          className="space-y-4 rounded-lg bg-white p-6 shadow"
        >
          <h2 className="text-lg font-semibold text-gray-900">Terminer l’inspection</h2>
          <Select
            label="Résultat"
            value={outcome}
            onChange={event => setOutcome(event.target.value as InspectionOutcome)}
            options={Object.entries(outcomeLabels).map(([value, label]) => ({ value, label }))}
          />
          <Textarea
            label="Constats"
            required
            minLength={3}
            rows={6}
            value={findings}
            onChange={event => setFindings(event.target.value)}
          />
          <Button type="submit" disabled={isCompleting || findings.trim().length < 3} isLoading={isCompleting}>
            {isCompleting ? 'Enregistrement…' : 'Terminer l’inspection'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default InspectionDetail;
