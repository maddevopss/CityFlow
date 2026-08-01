import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addPermitDocument, listPermitDocuments, reviewPermitDocument } from '../../services/permitService';

interface Props { permitId: string; role?: string }
const emptyForm = { documentType: 'PLAN', fileName: '', mimeType: 'application/pdf', sizeBytes: 1, storageKey: '', sha256: '', description: '' };

const PermitDocumentsPanel: React.FC<Props> = ({ permitId, role }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const documentsQuery = useQuery({ queryKey: ['permit-documents', permitId], queryFn: () => listPermitDocuments(permitId) });
  const refresh = async () => Promise.all([queryClient.invalidateQueries({ queryKey: ['permit-documents', permitId] }), queryClient.invalidateQueries({ queryKey: ['permit', permitId] })]);
  const addMutation = useMutation({ mutationFn: () => addPermitDocument(permitId, form), onSuccess: async () => { setForm(emptyForm); setMessage('Pièce ajoutée au dossier.'); await refresh(); }, onError: () => setMessage('Impossible d’ajouter cette pièce.') });
  const reviewMutation = useMutation({ mutationFn: ({ documentId, status }: { documentId: string; status: 'ACCEPTED' | 'REJECTED' }) => { const reason = status === 'REJECTED' ? window.prompt('Motif du refus') || '' : undefined; return reviewPermitDocument(permitId, documentId, status, reason); }, onSuccess: async () => { setMessage('Décision enregistrée.'); await refresh(); }, onError: () => setMessage('Impossible d’enregistrer la décision.') });
  const canAdd = role === 'ADMIN' || role === 'MANAGER' || role === 'MUNICIPAL_AGENT';
  const canReview = role === 'ADMIN' || role === 'MANAGER';

  return <section className="space-y-3" aria-labelledby="permit-documents-title">
    <h3 id="permit-documents-title" className="font-semibold text-gray-900">Pièces justificatives</h3>
    {canAdd ? <form onSubmit={(event) => { event.preventDefault(); setMessage(null); addMutation.mutate(); }} className="grid gap-2 rounded-lg bg-gray-50 p-3 text-sm">
      <input aria-label="Type de document" value={form.documentType} onChange={(event) => setForm({ ...form, documentType: event.target.value })} className="rounded border px-2 py-1" required />
      <input aria-label="Nom du fichier" value={form.fileName} onChange={(event) => setForm({ ...form, fileName: event.target.value })} placeholder="plan.pdf" className="rounded border px-2 py-1" required />
      <input aria-label="Clé de stockage" value={form.storageKey} onChange={(event) => setForm({ ...form, storageKey: event.target.value })} placeholder="permits/7/plan.pdf" className="rounded border px-2 py-1" required />
      <input aria-label="Empreinte SHA-256" value={form.sha256} onChange={(event) => setForm({ ...form, sha256: event.target.value })} placeholder="64 caractères hexadécimaux" minLength={64} maxLength={64} className="rounded border px-2 py-1" required />
      <button disabled={addMutation.isPending} className="rounded bg-cityflow-700 px-3 py-2 font-medium text-white disabled:opacity-50">{addMutation.isPending ? 'Ajout…' : 'Ajouter la pièce'}</button>
    </form> : null}
    {documentsQuery.isLoading ? <p className="text-sm text-gray-500">Chargement des pièces…</p> : null}
    {documentsQuery.isError ? <p role="alert" className="text-sm text-red-700">Impossible de charger les pièces.</p> : null}
    <ul className="space-y-2">{documentsQuery.data?.map((document) => <li key={document.id} className="rounded-lg border border-gray-200 p-3 text-sm">
      <div className="flex items-start justify-between gap-3"><div><span className="font-medium">{document.fileName}</span><span className="block text-gray-500">{document.documentType} · {document.status}</span>{document.reviewReason ? <span className="block text-red-700">Motif : {document.reviewReason}</span> : null}</div>
      {canReview && document.status === 'PENDING' ? <div className="flex gap-1"><button onClick={() => reviewMutation.mutate({ documentId: document.id, status: 'ACCEPTED' })} className="rounded border px-2 py-1">Accepter</button><button onClick={() => reviewMutation.mutate({ documentId: document.id, status: 'REJECTED' })} className="rounded border px-2 py-1">Refuser</button></div> : null}</div>
    </li>)}</ul>
    {!documentsQuery.isLoading && documentsQuery.data?.length === 0 ? <p className="text-sm text-gray-500">Aucune pièce rattachée.</p> : null}
    {message ? <p role="status" className="text-sm text-gray-700">{message}</p> : null}
  </section>;
};

export default PermitDocumentsPanel;
