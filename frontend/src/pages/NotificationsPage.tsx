import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getNotifications, type NotificationItem } from '../services/citizenRequestService';

const NotificationsPage: React.FC = () => {
  const [status, setStatus] = useState<NotificationItem['status'] | ''>('');
  const [page, setPage] = useState(1);
  const notifications = useQuery({
    queryKey: ['notifications', status, page],
    queryFn: () => getNotifications({ status: status || undefined, page, pageSize: 20 })
  });

  return (
    <main className="space-y-6" aria-labelledby="notifications-title">
      <header>
        <h1 id="notifications-title" className="text-2xl font-semibold">Notifications</h1>
        <p className="text-sm text-slate-600">Suivre les mises à jour liées à vos demandes.</p>
      </header>

      <label className="grid max-w-xs gap-1">
        <span>Statut</span>
        <select value={status} onChange={(event) => { setStatus(event.target.value as NotificationItem['status'] | ''); setPage(1); }} className="rounded border px-3 py-2">
          <option value="">Tous</option>
          <option value="PENDING">En attente</option>
          <option value="SENT">Envoyées</option>
          <option value="FAILED">Échec</option>
          <option value="READ">Lues</option>
        </select>
      </label>

      {notifications.isLoading && <p>Chargement des notifications…</p>}
      {notifications.isError && <p role="alert" className="text-red-700">Les notifications ne peuvent pas être chargées.</p>}
      {notifications.data && (
        <section className="space-y-3" aria-live="polite">
          {notifications.data.items.length === 0 && <p>Aucune notification.</p>}
          {notifications.data.items.map((item) => (
            <article key={item.id} className="rounded-lg border bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold">{item.title}</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">{item.status}</span>
              </div>
              <p className="mt-2 text-slate-700">{item.body}</p>
              <time className="mt-2 block text-sm text-slate-500" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time>
            </article>
          ))}
          <nav className="flex items-center gap-3" aria-label="Pagination des notifications">
            <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1} className="rounded border px-3 py-2 disabled:opacity-50">Précédent</button>
            <span>Page {page} sur {Math.max(1, notifications.data.pagination.totalPages)}</span>
            <button type="button" onClick={() => setPage((value) => value + 1)} disabled={page >= notifications.data.pagination.totalPages} className="rounded border px-3 py-2 disabled:opacity-50">Suivant</button>
          </nav>
        </section>
      )}
    </main>
  );
};

export default NotificationsPage;
