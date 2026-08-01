import React, { FormEvent, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createCitizenRequest, getCitizenRequestTimeline } from '../services/citizenRequestService';

const CitizenPortalPage: React.FC = () => {
  const [requestId, setRequestId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('GENERAL');

  const timeline = useQuery({
    queryKey: ['citizen-request', requestId],
    queryFn: () => getCitizenRequestTimeline(requestId),
    enabled: Boolean(requestId)
  });

  const creation = useMutation({
    mutationFn: createCitizenRequest,
    onSuccess: (request) => {
      setRequestId(request.id);
      setTitle('');
      setDescription('');
    }
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    creation.mutate({ title, description, category });
  };

  return (
    <main className="space-y-6" aria-labelledby="citizen-portal-title">
      <header>
        <h1 id="citizen-portal-title" className="text-2xl font-semibold">Portail citoyen</h1>
        <p className="text-sm text-slate-600">Déposer une demande et suivre son traitement municipal.</p>
      </header>

      <form onSubmit={submit} className="grid gap-4 rounded-lg border bg-white p-5" aria-label="Nouvelle demande citoyenne">
        <label className="grid gap-1">
          <span>Titre</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} minLength={3} maxLength={160} required className="rounded border px-3 py-2" />
        </label>
        <label className="grid gap-1">
          <span>Description</span>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} minLength={10} maxLength={5000} required className="min-h-32 rounded border px-3 py-2" />
        </label>
        <label className="grid gap-1">
          <span>Catégorie</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded border px-3 py-2">
            <option value="GENERAL">Demande générale</option>
            <option value="ROAD">Voirie</option>
            <option value="PARK">Parc</option>
            <option value="BUILDING">Bâtiment</option>
            <option value="SAFETY">Sécurité</option>
          </select>
        </label>
        <button type="submit" disabled={creation.isPending} className="w-fit rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50">
          {creation.isPending ? 'Envoi…' : 'Envoyer la demande'}
        </button>
        {creation.isError && <p role="alert" className="text-red-700">La demande n’a pas pu être envoyée.</p>}
      </form>

      <section className="space-y-3" aria-labelledby="citizen-followup-title">
        <h2 id="citizen-followup-title" className="text-xl font-semibold">Suivi</h2>
        <label className="grid max-w-xl gap-1">
          <span>Numéro de demande</span>
          <input value={requestId} onChange={(event) => setRequestId(event.target.value.trim())} className="rounded border px-3 py-2" placeholder="UUID de la demande" />
        </label>
        {timeline.isLoading && <p>Chargement du suivi…</p>}
        {timeline.isError && <p role="alert" className="text-red-700">Cette demande est introuvable ou inaccessible.</p>}
        {timeline.data && (
          <article className="rounded-lg border bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold">{timeline.data.request.title}</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">{timeline.data.request.status}</span>
            </div>
            <p className="mt-2 text-slate-700">{timeline.data.request.description}</p>
            <ol className="mt-5 space-y-3" aria-label="Chronologie de la demande">
              {timeline.data.events.map((event) => (
                <li key={event.id} className="border-l-2 border-slate-300 pl-4">
                  <strong>{event.type}</strong>
                  {event.status && <span> — {event.status}</span>}
                  <time className="block text-sm text-slate-500" dateTime={event.createdAt}>{new Date(event.createdAt).toLocaleString()}</time>
                </li>
              ))}
            </ol>
          </article>
        )}
      </section>
    </main>
  );
};

export default CitizenPortalPage;
