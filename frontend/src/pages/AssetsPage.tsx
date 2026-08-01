import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../components/common/Button';
import { createAsset, getAssets, type AssetCategory, type AssetCriticality, type AssetStatus, type CreateAssetInput } from '../services/assetService';

const emptyForm: CreateAssetInput = { publicCode: '', name: '', category: 'BUILDING', status: 'ACTIVE', criticality: 'MEDIUM', address: '', description: '' };
const categoryLabels: Record<AssetCategory, string> = { PARK: 'Parc', BUILDING: 'Bâtiment', VEHICLE: 'Véhicule', EQUIPMENT: 'Équipement' };
const statusLabels: Record<AssetStatus, string> = { PLANNED: 'Planifié', ACTIVE: 'Actif', OUT_OF_SERVICE: 'Hors service', DISPOSED: 'Disposé' };

const AssetsPage: React.FC = () => {
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<AssetCategory | ''>('');
  const [status, setStatus] = useState<AssetStatus | ''>('');
  const [criticality, setCriticality] = useState<AssetCriticality | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateAssetInput>(emptyForm);

  const query = useQuery({ queryKey: ['assets', page, q, category, status, criticality], queryFn: () => getAssets({ page, pageSize: 25, q: q || undefined, category: category || undefined, status: status || undefined, criticality: criticality || undefined }) });
  const mutation = useMutation({ mutationFn: createAsset, onSuccess: async () => { await client.invalidateQueries({ queryKey: ['assets'] }); setForm(emptyForm); setShowForm(false); toast.success('Actif créé'); }, onError: () => toast.error('Création impossible') });

  return <div className="p-6 space-y-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h1 className="text-2xl font-bold">Actifs municipaux</h1><p className="text-sm text-gray-600">Parcs, bâtiments, véhicules et équipements.</p></div><Button onClick={() => setShowForm(value => !value)}>{showForm ? 'Fermer' : '+ Ajouter un actif'}</Button></div>
    {showForm && <form onSubmit={event => { event.preventDefault(); mutation.mutate(form); }} className="grid gap-4 rounded-lg bg-white p-6 shadow md:grid-cols-2">
      <label className="text-sm font-medium">Code public<input required value={form.publicCode} onChange={event => setForm({ ...form, publicCode: event.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label>
      <label className="text-sm font-medium">Nom<input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label>
      <label className="text-sm font-medium">Catégorie<select value={form.category} onChange={event => setForm({ ...form, category: event.target.value as AssetCategory })} className="mt-1 w-full rounded border px-3 py-2">{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="text-sm font-medium">Criticité<select value={form.criticality} onChange={event => setForm({ ...form, criticality: event.target.value as AssetCriticality })} className="mt-1 w-full rounded border px-3 py-2"><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option></select></label>
      <label className="text-sm font-medium md:col-span-2">Adresse<input value={form.address || ''} onChange={event => setForm({ ...form, address: event.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label>
      <label className="text-sm font-medium md:col-span-2">Description<textarea value={form.description || ''} onChange={event => setForm({ ...form, description: event.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label>
      <div className="md:col-span-2"><Button type="submit" disabled={mutation.isPending}>Créer</Button></div>
    </form>}
    <div className="grid gap-3 md:grid-cols-4"><input placeholder="Rechercher" value={q} onChange={event => { setQ(event.target.value); setPage(1); }} className="rounded border px-3 py-2" /><select value={category} onChange={event => setCategory(event.target.value as AssetCategory | '')} className="rounded border px-3 py-2"><option value="">Toutes catégories</option>{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select value={status} onChange={event => setStatus(event.target.value as AssetStatus | '')} className="rounded border px-3 py-2"><option value="">Tous statuts</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select value={criticality} onChange={event => setCriticality(event.target.value as AssetCriticality | '')} className="rounded border px-3 py-2"><option value="">Toutes criticités</option><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option></select></div>
    <div className="overflow-hidden rounded-lg bg-white shadow"><div className="overflow-x-auto"><table className="min-w-full divide-y"><thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left">Code</th><th className="px-4 py-3 text-left">Nom</th><th className="px-4 py-3 text-left">Catégorie</th><th className="px-4 py-3 text-left">État</th><th className="px-4 py-3 text-left">Criticité</th><th className="px-4 py-3 text-left">Condition</th></tr></thead><tbody className="divide-y">{query.data?.items.map(asset => <tr key={asset.id}><td className="px-4 py-3 font-medium">{asset.publicCode}</td><td className="px-4 py-3">{asset.name}<div className="text-xs text-gray-500">{asset.address}</div></td><td className="px-4 py-3">{categoryLabels[asset.category]}</td><td className="px-4 py-3">{statusLabels[asset.status]}</td><td className="px-4 py-3">{asset.criticality}</td><td className="px-4 py-3">{asset.assessments?.[0]?.score ?? '—'}</td></tr>)}</tbody></table></div><div className="flex justify-between border-t p-4"><button disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Précédent</button><span>Page {query.data?.pagination.page || 1} / {query.data?.pagination.totalPages || 1}</span><button disabled={!query.data || page >= query.data.pagination.totalPages} onClick={() => setPage(value => value + 1)}>Suivant</button></div></div>
  </div>;
};

export default AssetsPage;
