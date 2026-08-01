import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCitizenRequestTimeline,
  sendCitizenRequestMessage,
  updateCitizenRequestStatus,
  type CitizenRequestStatus,
} from '../services/citizenRequestService';

const TRANSITIONS: Partial<Record<CitizenRequestStatus, CitizenRequestStatus[]>> = {
  SUBMITTED: ['ACKNOWLEDGED'],
  ACKNOWLEDGED: ['IN_REVIEW'],
  IN_REVIEW: ['PLANNED', 'RESOLVED'],
  PLANNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: [],
};

const MunicipalCitizenRequestDetailPage: React.FC = () => {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const [nextStatus, setNextStatus] = useState<CitizenRequestStatus | ''>('');
  const [resolution, setResolution] = useState('');
  const [message, setMessage] = useState('');

  const timeline = useQuery({
    queryKey: ['citizen-request', id],
    queryFn: () => getCitizenRequestTimeline(id),
    enabled: Boolean(id),
  });

  const availableStatuses = useMemo(
    () => timeline.data ? TRANSITIONS[timeline.data.request.status] ?? [] : [],
    [timeline.data],
  );

  const statusMutation = useMutation({
    mutationFn: () => updateCitizenRequestStatus(id, nextStatus as CitizenRequestStatus, resolution),
    onSuccess: async () => {
      setNextStatus('');
      setResolution('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['citizen-request', id] }),
        queryClient.invalidateQueries({ queryKey: ['municipal-citizen-requests'] }),
      ]);
    },
  });

  const messageMutation = useMutation({
    mutationFn: () => sendCitizenRequestMessage(id, message),
    onSuccess: async () => {
      setMessage('');
      await queryClient.invalidateQueries({ queryKey: ['citizen-request', id] });
    },
  });

  if (timeline.isLoading) return <p>Chargement de la demande…</p>;
  if (timeline.isError || !timeline.data) return <p role="alert" className="text-red-700">La demande ne peut pas être chargée.</p>;

  const { request, events, messages } = timeline.data;

  return (
    <main className="space-y-6" aria-labelledby="request-detail-title">
      <Link to="/municipal/citizen-requests" className="text-sm font-medium text-cityflow-700 hover:underline">← Retour aux demandes</Link>
      <header className="rounded-lg border bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-sm text-slate-500">{request.category}</p><h1 id="request-detail-title" className="text-2xl font-semibold">{request.title}</h1></div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">{request.status}</span>
        </div>
        <p className="mt-4 whitespace-pre-wrap text-slate-700">{request.description}</p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3"><div><dt className="text-slate-500">Équipe</dt><dd>{request.assignedTeam || 'Non affectée'}</dd></div><div><dt className="text-slate-500">Créée</dt><dd>{new Date(request.createdAt).toLocaleString()}</dd></div><div><dt className="text-slate-500">Mise à jour</dt><dd>{new Date(request.updatedAt).toLocaleString()}</dd></div></dl>
        {request.resolution && <section className="mt-4 rounded bg-emerald-50 p-3"><h2 className="font-semibold">Résolution</h2><p>{request.resolution}</p></section>}
      </header>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold">Changer le statut</h2>
          {availableStatuses.length === 0 ? <p className="mt-3 text-sm text-slate-600">Aucune transition disponible.</p> : <form className="mt-4 space-y-3" onSubmit={(event) => { event.preventDefault(); statusMutation.mutate(); }}>
            <label className="grid gap-1"><span>Nouveau statut</span><select className="rounded border px-3 py-2" value={nextStatus} onChange={(event) => setNextStatus(event.target.value as CitizenRequestStatus)} required><option value="">Choisir</option>{availableStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
            {nextStatus === 'RESOLVED' && <label className="grid gap-1"><span>Résolution</span><textarea className="min-h-28 rounded border px-3 py-2" value={resolution} onChange={(event) => setResolution(event.target.value)} maxLength={4000} required /></label>}
            <button className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50" disabled={!nextStatus || statusMutation.isPending}>{statusMutation.isPending ? 'Enregistrement…' : 'Enregistrer le statut'}</button>
            {statusMutation.isError && <p role="alert" className="text-red-700">Le statut n’a pas pu être modifié.</p>}
          </form>}
        </article>

        <article className="rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold">Conversation</h2>
          <div className="mt-4 max-h-80 space-y-3 overflow-y-auto" aria-live="polite">{messages.length === 0 ? <p className="text-sm text-slate-600">Aucun message.</p> : messages.map((item) => <div key={item.id} className="rounded-lg bg-slate-50 p-3"><p className="whitespace-pre-wrap">{item.body}</p><time className="mt-1 block text-xs text-slate-500" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time></div>)}</div>
          <form className="mt-4 space-y-3" onSubmit={(event) => { event.preventDefault(); messageMutation.mutate(); }}><label className="grid gap-1"><span>Réponse au citoyen</span><textarea className="min-h-28 rounded border px-3 py-2" value={message} onChange={(event) => setMessage(event.target.value)} minLength={1} maxLength={4000} required /></label><button className="rounded bg-cityflow-700 px-4 py-2 text-white disabled:opacity-50" disabled={!message.trim() || messageMutation.isPending}>{messageMutation.isPending ? 'Envoi…' : 'Envoyer le message'}</button>{messageMutation.isError && <p role="alert" className="text-red-700">Le message n’a pas pu être envoyé.</p>}</form>
        </article>
      </section>

      <section className="rounded-lg border bg-white p-5"><h2 className="text-lg font-semibold">Historique</h2><ol className="mt-4 space-y-3">{events.map((event) => <li key={event.id} className="border-l-2 border-slate-200 pl-4"><strong>{event.type}</strong>{event.status && <span> — {event.status}</span>}<time className="block text-xs text-slate-500" dateTime={event.createdAt}>{new Date(event.createdAt).toLocaleString()}</time></li>)}</ol></section>
    </main>
  );
};

export default MunicipalCitizenRequestDetailPage;
