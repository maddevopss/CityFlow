import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../components/common/Button';
import { createPermitApplication, getPermitApplications, submitPermitApplication, type CreatePermitInput, type PermitStatus } from '../services/permitApplicationService';

const statusLabels: Record<PermitStatus, string> = {
  DRAFT: 'Brouillon', SUBMITTED: 'Soumise', UNDER_REVIEW: 'En révision', INFORMATION_REQUIRED: 'Information requise', APPROVED: 'Approuvée', REJECTED: 'Refusée', ISSUED: 'Délivrée', SUSPENDED: 'Suspendue', EXPIRED: 'Expirée', CLOSED: 'Fermée'
};

const emptyForm: CreatePermitInput = { applicantName: '', applicantEmail: '', permitType: 'CONSTRUCTION', address: '', description: '' };

const PermitApplicationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<PermitStatus | ''>('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreatePermitInput>(emptyForm);

  const query = useQuery({ queryKey: ['permit-applications', page, status, q], queryFn: () => getPermitApplications({ page, pageSize: 25, status: status || undefined, q: q || undefined }) });
  const createMutation = useMutation({ mutationFn: createPermitApplication, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['permit-applications'] }); setForm(emptyForm); setShowForm(false); toast.success('Demande de permis créée'); }, onError: () => toast.error('Création impossible') });
  const submitMutation = useMutation({ mutationFn: submitPermitApplication, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['permit-applications'] }); toast.success('Demande soumise'); }, onError: () => toast.error('Soumission impossible') });

  return <div className="p-6 space-y-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div><h1 className="text-2xl font-bold text-gray-900">Permis et autorisations</h1><p className="text-sm text-gray-600">Créer, réviser et délivrer les demandes municipales.</p></div>
      <Button onClick={() => setShowForm(value => !value)}>{showForm ? 'Fermer' : '+ Nouvelle demande'}</Button>
    </div>

    {showForm && <form onSubmit={event => { event.preventDefault(); createMutation.mutate(form); }} className="grid gap-4 rounded-lg bg-white p-6 shadow md:grid-cols-2">
      <label className="text-sm font-medium">Demandeur<input required value={form.applicantName} onChange={event => setForm({ ...form, applicantName: event.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label>
      <label className="text-sm font-medium">Courriel<input required type="email" value={form.applicantEmail} onChange={event => setForm({ ...form, applicantEmail: event.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label>
      <label className="text-sm font-medium">Type<select value={form.permitType} onChange={event => setForm({ ...form, permitType: event.target.value })} className="mt-1 w-full rounded border px-3 py-2"><option>CONSTRUCTION</option><option>OCCUPATION</option><option>DEMOLITION</option><option>EVENT</option></select></label>
      <label className="text-sm font-medium">Adresse<input required value={form.address} onChange={event => setForm({ ...form, address: event.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label>
      <label className="text-sm font-medium md:col-span-2">Description<textarea required value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label>
      <div className="md:col-span-2"><Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? 'Création…' : 'Créer la demande'}</Button></div>
    </form>}

    <div className="flex flex-col gap-3 sm:flex-row">
      <input placeholder="Rechercher par numéro, demandeur ou adresse" value={q} onChange={event => { setQ(event.target.value); setPage(1); }} className="flex-1 rounded border px-3 py-2" />
      <select value={status} onChange={event => { setStatus(event.target.value as PermitStatus | ''); setPage(1); }} className="rounded border px-3 py-2"><option value="">Tous les statuts</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
    </div>

    {query.isLoading ? <div className="p-8 text-center">Chargement…</div> : query.isError ? <div className="rounded bg-red-50 p-4 text-red-800">Impossible de charger les demandes.</div> : <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-xs uppercase">Numéro</th><th className="px-4 py-3 text-left text-xs uppercase">Demandeur</th><th className="px-4 py-3 text-left text-xs uppercase">Type</th><th className="px-4 py-3 text-left text-xs uppercase">Statut</th><th className="px-4 py-3 text-left text-xs uppercase">Action</th></tr></thead><tbody className="divide-y divide-gray-100">{query.data?.items.map(item => <tr key={item.id}><td className="px-4 py-3 font-medium">{item.publicNumber}</td><td className="px-4 py-3">{item.applicantName}<div className="text-xs text-gray-500">{item.address}</div></td><td className="px-4 py-3">{item.permitType}</td><td className="px-4 py-3">{statusLabels[item.status]}</td><td className="px-4 py-3">{['DRAFT', 'INFORMATION_REQUIRED'].includes(item.status) && <button onClick={() => submitMutation.mutate(item.id)} className="text-cityflow-700 hover:underline">Soumettre</button>}</td></tr>)}</tbody></table></div>
      <div className="flex items-center justify-between border-t p-4 text-sm"><button disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Précédent</button><span>Page {query.data?.pagination.page || 1} sur {query.data?.pagination.totalPages || 1}</span><button disabled={!query.data || page >= query.data.pagination.totalPages} onClick={() => setPage(value => value + 1)}>Suivant</button></div>
    </div>}
  </div>;
};

export default PermitApplicationsPage;
