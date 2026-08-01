import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../components/common/Button';
import { createInspection, getInspections } from '../services/inspectionService';
import type { CreateInspectionInput, InspectionStatus, InspectionType } from '../types';

const statusLabels: Record<InspectionStatus, string> = {
  SCHEDULED: 'Planifiée',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée'
};

const typeLabels: Record<InspectionType, string> = {
  PRE_WORK: 'Avant travaux',
  IN_PROGRESS: 'En cours de travaux',
  FINAL: 'Finale',
  COMPLAINT: 'À la suite d’une plainte'
};

const InspectionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<InspectionStatus | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateInspectionInput>({
    scheduledAt: '',
    address: '',
    inspectionType: 'PRE_WORK',
    permitId: '',
    notes: ''
  });

  const inspectionsQuery = useQuery({
    queryKey: ['inspections', status],
    queryFn: () => getInspections(status || undefined)
  });

  const createMutation = useMutation({
    mutationFn: createInspection,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['inspections'] });
      setShowForm(false);
      setForm({ scheduledAt: '', address: '', inspectionType: 'PRE_WORK', permitId: '', notes: '' });
      toast.success('Inspection planifiée');
    },
    onError: () => toast.error('Impossible de planifier l’inspection')
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    createMutation.mutate({
      ...form,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
      permitId: form.permitId || null,
      notes: form.notes || null
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inspections</h1>
          <p className="mt-1 text-sm text-gray-600">Planifier et suivre les inspections municipales.</p>
        </div>
        <Button onClick={() => setShowForm(current => !current)}>
          {showForm ? 'Fermer' : '+ Planifier une inspection'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="grid gap-4 rounded-lg bg-white p-6 shadow md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">
            Date et heure
            <input
              required
              type="datetime-local"
              value={form.scheduledAt}
              onChange={event => setForm({ ...form, scheduledAt: event.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Type
            <select
              value={form.inspectionType}
              onChange={event => setForm({ ...form, inspectionType: event.target.value as InspectionType })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            >
              {Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-gray-700 md:col-span-2">
            Adresse
            <input
              required
              minLength={3}
              value={form.address}
              onChange={event => setForm({ ...form, address: event.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Identifiant du permis (optionnel)
            <input
              value={form.permitId || ''}
              onChange={event => setForm({ ...form, permitId: event.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Notes
            <textarea
              value={form.notes || ''}
              onChange={event => setForm({ ...form, notes: event.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <div className="md:col-span-2">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Planification…' : 'Planifier'}
            </Button>
          </div>
        </form>
      )}

      <div className="flex items-center gap-3">
        <label htmlFor="inspection-status" className="text-sm font-medium text-gray-700">Statut</label>
        <select
          id="inspection-status"
          value={status}
          onChange={event => setStatus(event.target.value as InspectionStatus | '')}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Tous</option>
          {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      {inspectionsQuery.isLoading ? (
        <div className="flex justify-center p-8"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cityflow-600" /></div>
      ) : inspectionsQuery.isError ? (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">Impossible de charger les inspections.</div>
      ) : inspectionsQuery.data?.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center text-gray-600 shadow">Aucune inspection pour ce filtre.</div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50"><tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Adresse</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Action</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-200">
                {inspectionsQuery.data?.map(inspection => (
                  <tr key={inspection.id}>
                    <td className="px-6 py-4 text-sm text-gray-700">{new Date(inspection.scheduledAt).toLocaleString('fr-CA')}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{inspection.address}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{typeLabels[inspection.inspectionType]}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{statusLabels[inspection.status]}</td>
                    <td className="px-6 py-4 text-sm"><Link className="text-cityflow-700 hover:underline" to={`/inspections/${inspection.id}`}>Consulter</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionsPage;
