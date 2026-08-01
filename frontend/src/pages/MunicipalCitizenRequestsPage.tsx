import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  bulkAssignCitizenRequests,
  getMunicipalCitizenRequestSummary,
  getMunicipalCitizenRequests,
  type CitizenRequestStatus,
} from '../services/citizenRequestService';

const STATUSES: Array<{ value: CitizenRequestStatus | ''; label: string }> = [
  { value: '', label: 'Tous les statuts' },
  { value: 'SUBMITTED', label: 'Soumises' },
  { value: 'ACKNOWLEDGED', label: 'Reçues' },
  { value: 'IN_REVIEW', label: 'En analyse' },
  { value: 'PLANNED', label: 'Planifiées' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'RESOLVED', label: 'Résolues' },
  { value: 'CLOSED', label: 'Fermées' },
];

const MunicipalCitizenRequestsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<CitizenRequestStatus | ''>('');
  const [category, setCategory] = useState('');
  const [assignedTeam, setAssignedTeam] = useState('');
  const [query, setQuery] = useState('');
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [team, setTeam] = useState('');

  const filters = useMemo(() => ({
    status: status || undefined,
    category: category.trim() || undefined,
    assignedTeam: assignedTeam.trim() || undefined,
    q: query.trim() || undefined,
    unassigned: unassignedOnly || undefined,
    page,
    pageSize: 25,
  }), [status, category, assignedTeam, query, unassignedOnly, page]);

  const summary = useQuery({ queryKey: ['municipal-citizen-requests', 'summary'], queryFn: getMunicipalCitizenRequestSummary });
  const requests = useQuery({ queryKey: ['municipal-citizen-requests', filters], queryFn: () => getMunicipalCitizenRequests(filters) });
  const assignment = useMutation({
    mutationFn: () => bulkAssignCitizenRequests(selectedIds, team),
    onSuccess: async () => {
      setSelectedIds([]);
      setTeam('');
      await queryClient.invalidateQueries({ queryKey: ['municipal-citizen-requests'] });
    },
  });

  const visibleIds = requests.data?.items.map((item) => item.id) ?? [];
  const selectableIds = requests.data?.items.filter((item) => !['RESOLVED', 'CLOSED'].includes(item.status)).map((item) => item.id) ?? [];
  const allVisibleSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id));
  const toggleVisible = () => setSelectedIds((current) => allVisibleSelected ? current.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...current, ...selectableIds])).slice(0, 50));
  const toggleRequest = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id].slice(0, 50));

  return (
    <main className="space-y-6" aria-labelledby="municipal-citizen-title">
      <header><h1 id="municipal-citizen-title" className="text-2xl font-semibold">Demandes citoyennes</h1><p className="text-sm text-slate-600">Trier, rechercher et affecter les demandes reçues par la municipalité.</p></header>
      {summary.isLoading && <p>Chargement du résumé…</p>}
      {summary.isError && <p role="alert" className="text-red-700">Le résumé ne peut pas être chargé.</p>}
      {summary.data && <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Résumé des demandes citoyennes"><article className="rounded-lg border bg-white p-4"><p className="text-sm text-slate-600">Total</p><strong className="text-2xl">{summary.data.total}</strong></article><article className="rounded-lg border bg-white p-4"><p className="text-sm text-slate-600">Non affectées</p><strong className="text-2xl">{summary.data.unassigned}</strong></article><article className="rounded-lg border bg-white p-4"><p className="text-sm text-slate-600">Ouvertes depuis 7 jours</p><strong className="text-2xl">{summary.data.overdue}</strong></article><article className="rounded-lg border bg-white p-4"><p className="text-sm text-slate-600">En cours</p><strong className="text-2xl">{summary.data.byStatus.IN_PROGRESS ?? 0}</strong></article></section>}
      <section className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2 xl:grid-cols-5" aria-label="Filtres"><label className="grid gap-1"><span>Recherche</span><input className="rounded border px-3 py-2" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Titre ou description" /></label><label className="grid gap-1"><span>Statut</span><select className="rounded border px-3 py-2" value={status} onChange={(event) => { setStatus(event.target.value as CitizenRequestStatus | ''); setPage(1); }}>{STATUSES.map((option) => <option key={option.value || 'all'} value={option.value}>{option.label}</option>)}</select></label><label className="grid gap-1"><span>Catégorie</span><input className="rounded border px-3 py-2" value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} /></label><label className="grid gap-1"><span>Équipe</span><input className="rounded border px-3 py-2" value={assignedTeam} onChange={(event) => { setAssignedTeam(event.target.value); setPage(1); }} /></label><label className="flex items-end gap-2 pb-2"><input type="checkbox" checked={unassignedOnly} onChange={(event) => { setUnassignedOnly(event.target.checked); setPage(1); }} /> Seulement non affectées</label></section>
      <section className="rounded-lg border bg-white" aria-label="Liste des demandes"><div className="flex flex-wrap items-end gap-3 border-b p-4"><label className="grid min-w-64 flex-1 gap-1"><span>Affecter la sélection à</span><input className="rounded border px-3 py-2" value={team} onChange={(event) => setTeam(event.target.value)} placeholder="Nom de l’équipe" maxLength={120} /></label><button type="button" className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50" disabled={!selectedIds.length || team.trim().length < 2 || assignment.isPending} onClick={() => assignment.mutate()}>{assignment.isPending ? 'Affectation…' : `Affecter (${selectedIds.length})`}</button>{assignment.isError && <p role="alert" className="w-full text-red-700">L’affectation n’a pas pu être enregistrée.</p>}</div>
        {requests.isLoading && <p className="p-4">Chargement des demandes…</p>}{requests.isError && <p role="alert" className="p-4 text-red-700">Les demandes ne peuvent pas être chargées.</p>}{requests.data && <><div className="overflow-x-auto"><table className="min-w-full divide-y"><thead><tr className="text-left text-sm text-slate-600"><th className="p-3"><input type="checkbox" aria-label="Sélectionner les demandes visibles" checked={allVisibleSelected} onChange={toggleVisible} /></th><th className="p-3">Demande</th><th className="p-3">Catégorie</th><th className="p-3">Statut</th><th className="p-3">Équipe</th><th className="p-3">Mise à jour</th></tr></thead><tbody className="divide-y">{requests.data.items.map((item) => <tr key={item.id}><td className="p-3"><input type="checkbox" aria-label={`Sélectionner ${item.title}`} checked={selectedIds.includes(item.id)} onChange={() => toggleRequest(item.id)} disabled={['RESOLVED', 'CLOSED'].includes(item.status)} /></td><td className="p-3"><strong className="block">{item.title}</strong><span className="line-clamp-2 text-sm text-slate-600">{item.description}</span></td><td className="p-3">{item.category}</td><td className="p-3">{item.status}</td><td className="p-3">{item.assignedTeam || 'Non affectée'}</td><td className="p-3"><time dateTime={item.updatedAt}>{new Date(item.updatedAt).toLocaleString()}</time></td></tr>)}</tbody></table></div>{requests.data.items.length === 0 && <p className="p-4">Aucune demande ne correspond aux filtres.</p>}<nav className="flex items-center justify-between border-t p-4" aria-label="Pagination des demandes citoyennes"><button type="button" className="rounded border px-3 py-2 disabled:opacity-50" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Précédent</button><span>Page {page} sur {Math.max(1, requests.data.pagination.totalPages)}</span><button type="button" className="rounded border px-3 py-2 disabled:opacity-50" disabled={page >= requests.data.pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Suivant</button></nav></>}
      </section>
    </main>
  );
};

export default MunicipalCitizenRequestsPage;
