import React, { FormEvent, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createCitizenRequest, getCitizenRequestTimeline } from '../services/citizenRequestService';

const CitizenPortalPage: React.FC = () => {
  const [requestId, setRequestId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const timeline = useQuery({ queryKey: ['citizen-request', requestId], queryFn: () => getCitizenRequestTimeline(requestId), enabled: Boolean(requestId) });
  const creation = useMutation({ mutationFn: createCitizenRequest, onSuccess: request => { setRequestId(request.id); setTitle(''); setDescription(''); } });
  const submit = (event: FormEvent) => { event.preventDefault(); creation.mutate({ title, description, category }); };
  return <main className="space-y-6" aria-labelledby="citizen-title"><h1 id="citizen-title" className="text-2xl font-semibold">Portail citoyen</h1><form onSubmit={submit} className="grid gap-4 rounded-lg border bg-white p-5"><label>Titre<input className="block w-full rounded border px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} minLength={5} maxLength={140} required /></label><label>Description<textarea className="block min-h-32 w-full rounded border px-3 py-2" value={description} onChange={e => setDescription(e.target.value)} minLength={10} maxLength={5000} required /></label><label>Catégorie<select className="block rounded border px-3 py-2" value={category} onChange={e => setCategory(e.target.value)}><option value="GENERAL">Général</option><option value="ROAD">Voirie</option><option value="PARK">Parc</option><option value="BUILDING">Bâtiment</option></select></label><button className="w-fit rounded bg-slate-900 px-4 py-2 text-white" disabled={creation.isPending}>{creation.isPending ? 'Envoi…' : 'Envoyer'}</button>{creation.isError && <p role="alert">La demande n’a pas pu être envoyée.</p>}</form><section><h2 className="text-xl font-semibold">Suivi</h2><input className="rounded border px-3 py-2" value={requestId} onChange={e => setRequestId(e.target.value.trim())} placeholder="Numéro de demande" />{timeline.data && <article className="mt-4 rounded border bg-white p-4"><h3 className="font-semibold">{timeline.data.request.title}</h3><p>{timeline.data.request.status}</p><ol>{timeline.data.events.map(event => <li key={event.id}>{event.type} — {event.status}</li>)}</ol></article>}</section></main>;
};
export default CitizenPortalPage;
