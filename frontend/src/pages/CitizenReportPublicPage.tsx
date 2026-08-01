import React, { useState } from 'react';
import { createPublicCitizenReport, trackPublicCitizenReport, type CitizenReportCategory } from '../services/citizenReportService';

const CitizenReportPublicPage: React.FC = () => {
  const [mode, setMode] = useState<'create' | 'track'>('create');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ municipalityId: 1, category: 'ROAD' as CitizenReportCategory, title: '', description: '', address: '', reporterName: '', reporterEmail: '', consentToContact: false });
  const [tracking, setTracking] = useState({ publicNumber: '', trackingToken: '' });

  const create = async (event: React.FormEvent) => { event.preventDefault(); setError(''); try { setResult(await createPublicCitizenReport({ ...form, address: form.address || null, reporterName: form.reporterName || null, reporterEmail: form.reporterEmail || null })); } catch { setError('Impossible de transmettre le signalement.'); } };
  const track = async (event: React.FormEvent) => { event.preventDefault(); setError(''); try { setResult(await trackPublicCitizenReport(tracking.publicNumber, tracking.trackingToken)); } catch { setError('Signalement ou jeton de suivi invalide.'); } };

  return <main className="min-h-screen bg-gray-50 p-6"><div className="mx-auto max-w-2xl space-y-6"><div><h1 className="text-3xl font-bold text-gray-900">Signaler un problème municipal</h1><p className="mt-2 text-gray-600">Transmettez un problème ou consultez son avancement sans créer de compte.</p></div><div className="flex gap-2"><button onClick={() => { setMode('create'); setResult(null); }} className={`rounded px-4 py-2 ${mode === 'create' ? 'bg-cityflow-700 text-white' : 'bg-white'}`}>Nouveau signalement</button><button onClick={() => { setMode('track'); setResult(null); }} className={`rounded px-4 py-2 ${mode === 'track' ? 'bg-cityflow-700 text-white' : 'bg-white'}`}>Suivre un signalement</button></div>
    {mode === 'create' ? <form onSubmit={create} className="grid gap-4 rounded-lg bg-white p-6 shadow">
      <label className="text-sm font-medium">Municipalité<input type="number" min="1" value={form.municipalityId} onChange={event => setForm({ ...form, municipalityId: Number(event.target.value) })} className="mt-1 w-full rounded border px-3 py-2" /></label>
      <label className="text-sm font-medium">Catégorie<select value={form.category} onChange={event => setForm({ ...form, category: event.target.value as CitizenReportCategory })} className="mt-1 w-full rounded border px-3 py-2"><option value="ROAD">Chaussée</option><option value="LIGHTING">Éclairage</option><option value="PARK">Parc</option><option value="WASTE">Déchets</option><option value="WATER">Eau</option><option value="BUILDING">Bâtiment</option><option value="OTHER">Autre</option></select></label>
      <label className="text-sm font-medium">Titre<input required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label>
      <label className="text-sm font-medium">Description<textarea required value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label>
      <label className="text-sm font-medium">Adresse<input value={form.address} onChange={event => setForm({ ...form, address: event.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label>
      <label className="text-sm font-medium">Nom (optionnel)<input value={form.reporterName} onChange={event => setForm({ ...form, reporterName: event.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label>
      <label className="text-sm font-medium">Courriel (optionnel)<input type="email" value={form.reporterEmail} onChange={event => setForm({ ...form, reporterEmail: event.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.consentToContact} onChange={event => setForm({ ...form, consentToContact: event.target.checked })} />J’accepte d’être contacté au sujet de ce signalement.</label>
      <button className="rounded bg-cityflow-700 px-4 py-2 font-medium text-white">Transmettre</button>
    </form> : <form onSubmit={track} className="grid gap-4 rounded-lg bg-white p-6 shadow"><label className="text-sm font-medium">Numéro de suivi<input required value={tracking.publicNumber} onChange={event => setTracking({ ...tracking, publicNumber: event.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label><label className="text-sm font-medium">Jeton de suivi<input required value={tracking.trackingToken} onChange={event => setTracking({ ...tracking, trackingToken: event.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label><button className="rounded bg-cityflow-700 px-4 py-2 font-medium text-white">Consulter</button></form>}
    {error && <div className="rounded bg-red-50 p-4 text-red-800">{error}</div>}{result && <div className="rounded-lg bg-white p-6 shadow"><h2 className="text-lg font-semibold">Résultat</h2><pre className="mt-3 overflow-auto whitespace-pre-wrap text-sm">{JSON.stringify(result, null, 2)}</pre></div>}
  </div></main>;
};

export default CitizenReportPublicPage;
