import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../components/common/Button';
import { createWorkOrder, getWorkOrders, startWorkOrder, type CreateWorkOrderInput, type WorkPriority, type WorkStatus } from '../services/workOrderService';

const emptyForm: CreateWorkOrderInput = { title: '', description: '', workType: 'CORRECTIVE', priority: 'NORMAL', estimatedCost: null };
const statusLabels: Record<WorkStatus, string> = { DRAFT: 'Brouillon', PLANNED: 'Planifié', ASSIGNED: 'Affecté', IN_PROGRESS: 'En cours', BLOCKED: 'Bloqué', COMPLETED: 'Terminé', VERIFIED: 'Vérifié', CLOSED: 'Fermé', CANCELLED: 'Annulé' };

const WorkOrdersPage: React.FC = () => {
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<WorkStatus | ''>('');
  const [priority, setPriority] = useState<WorkPriority | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateWorkOrderInput>(emptyForm);
  const query = useQuery({ queryKey: ['work-orders', page, q, status, priority], queryFn: () => getWorkOrders({ page, pageSize: 25, q: q || undefined, status: status || undefined, priority: priority || undefined }) });
  const createMutation = useMutation({ mutationFn: createWorkOrder, onSuccess: async () => { await client.invalidateQueries({ queryKey: ['work-orders'] }); setForm(emptyForm); setShowForm(false); toast.success('Ordre de travail créé'); }, onError: () => toast.error('Création impossible') });
  const startMutation = useMutation({ mutationFn: startWorkOrder, onSuccess: async () => { await client.invalidateQueries({ queryKey: ['work-orders'] }); toast.success('Intervention démarrée'); }, onError: () => toast.error('Démarrage impossible') });

  return <div className="p-6 space-y-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h1 className="text-2xl font-bold">Travaux publics</h1><p className="text-sm text-gray-600">Ordres de travail, interventions et entretien.</p></div><Button onClick={() => setShowForm(value => !value)}>{showForm ? 'Fermer' : '+ Nouvel ordre'}</Button></div>
    {showForm && <form onSubmit={event => { event.preventDefault(); createMutation.mutate(form); }} className="grid gap-4 rounded-lg bg-white p-6 shadow md:grid-cols-2">
      <label className="text-sm font-medium md:col-span-2">Titre<input required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label>
      <label className="text-sm font-medium">Type<select value={form.workType} onChange={event => setForm({ ...form, workType: event.target.value as CreateWorkOrderInput['workType'] })} className="mt-1 w-full rounded border px-3 py-2"><option>CORRECTIVE</option><option>PREVENTIVE</option><option>EMERGENCY</option><option>INSPECTION</option></select></label>
      <label className="text-sm font-medium">Priorité<select value={form.priority} onChange={event => setForm({ ...form, priority: event.target.value as WorkPriority })} className="mt-1 w-full rounded border px-3 py-2"><option>LOW</option><option>NORMAL</option><option>HIGH</option><option>URGENT</option><option>EMERGENCY</option></select></label>
      <label className="text-sm font-medium md:col-span-2">Description<textarea required value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label>
      <label className="text-sm font-medium">Coût estimé<input type="number" min="0" value={form.estimatedCost ?? ''} onChange={event => setForm({ ...form, estimatedCost: event.target.value ? Number(event.target.value) : null })} className="mt-1 w-full rounded border px-3 py-2" /></label>
      <div className="md:col-span-2"><Button type="submit">Créer</Button></div>
    </form>}
    <div className="grid gap-3 md:grid-cols-3"><input placeholder="Rechercher" value={q} onChange={event => { setQ(event.target.value); setPage(1); }} className="rounded border px-3 py-2" /><select value={status} onChange={event => setStatus(event.target.value as WorkStatus | '')} className="rounded border px-3 py-2"><option value="">Tous statuts</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select value={priority} onChange={event => setPriority(event.target.value as WorkPriority | '')} className="rounded border px-3 py-2"><option value="">Toutes priorités</option><option>LOW</option><option>NORMAL</option><option>HIGH</option><option>URGENT</option><option>EMERGENCY</option></select></div>
    <div className="overflow-hidden rounded-lg bg-white shadow"><div className="overflow-x-auto"><table className="min-w-full divide-y"><thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left">Numéro</th><th className="px-4 py-3 text-left">Travail</th><th className="px-4 py-3 text-left">Priorité</th><th className="px-4 py-3 text-left">État</th><th className="px-4 py-3 text-left">Coûts</th><th className="px-4 py-3 text-left">Action</th></tr></thead><tbody className="divide-y">{query.data?.items.map(item => <tr key={item.id}><td className="px-4 py-3 font-medium">{item.publicNumber}</td><td className="px-4 py-3">{item.title}<div className="text-xs text-gray-500">{item.workType}</div></td><td className="px-4 py-3">{item.priority}</td><td className="px-4 py-3">{statusLabels[item.status]}</td><td className="px-4 py-3">{item.actualCost ?? item.estimatedCost ?? '—'}</td><td className="px-4 py-3">{item.status === 'ASSIGNED' && <button onClick={() => startMutation.mutate(item.id)} className="text-cityflow-700 hover:underline">Démarrer</button>}</td></tr>)}</tbody></table></div><div className="flex justify-between border-t p-4"><button disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Précédent</button><span>Page {query.data?.pagination.page || 1} / {query.data?.pagination.totalPages || 1}</span><button disabled={!query.data || page >= query.data.pagination.totalPages} onClick={() => setPage(value => value + 1)}>Suivant</button></div></div>
  </div>;
};

export default WorkOrdersPage;
