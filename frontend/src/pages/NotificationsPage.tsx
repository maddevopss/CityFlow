import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getNotifications, type NotificationItem } from '../services/citizenRequestService';

const NotificationsPage: React.FC = () => {
  const [status, setStatus] = useState<NotificationItem['status'] | ''>('');
  const [page, setPage] = useState(1);
  const notifications = useQuery({ queryKey: ['notifications', status, page], queryFn: () => getNotifications({ status: status || undefined, page, pageSize: 20 }) });
  return <main className="space-y-6" aria-labelledby="notifications-title"><h1 id="notifications-title" className="text-2xl font-semibold">Notifications</h1><label>Statut<select className="ml-2 rounded border px-3 py-2" value={status} onChange={event => { setStatus(event.target.value as NotificationItem['status'] | ''); setPage(1); }}><option value="">Tous</option><option value="PENDING">En attente</option><option value="SENT">Envoyées</option><option value="FAILED">Échec</option><option value="READ">Lues</option></select></label>{notifications.isLoading && <p>Chargement…</p>}{notifications.isError && <p role="alert">Les notifications ne peuvent pas être chargées.</p>}{notifications.data && <section className="space-y-3">{notifications.data.items.map(item => <article key={item.id} className="rounded border bg-white p-4"><h2 className="font-semibold">{item.title}</h2><p>{item.body}</p><small>{item.status}</small></article>)}<nav className="flex gap-3" aria-label="Pagination"><button onClick={() => setPage(value => Math.max(1, value - 1))} disabled={page <= 1}>Précédent</button><span>Page {page}</span><button onClick={() => setPage(value => value + 1)} disabled={page >= notifications.data.pagination.totalPages}>Suivant</button></nav></section>}</main>;
};
export default NotificationsPage;
