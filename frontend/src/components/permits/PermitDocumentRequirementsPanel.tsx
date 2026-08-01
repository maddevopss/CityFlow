import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listPermitDocumentRequirements,
  PermitDocumentRequirement,
  savePermitDocumentRequirement
} from '../../services/permitService';

interface Props { role?: string }

function parseDocumentTypes(value: string) {
  return [...new Set(value.split(/[\n,;]/).map((item) => item.trim().toUpperCase()).filter(Boolean))];
}

const PermitDocumentRequirementsPanel: React.FC<Props> = ({ role }) => {
  const queryClient = useQueryClient();
  const canEdit = role === 'ADMIN' || role === 'MANAGER';
  const [permitSubtype, setPermitSubtype] = useState('');
  const [documentTypes, setDocumentTypes] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const query = useQuery({ queryKey: ['permit-document-requirements'], queryFn: listPermitDocumentRequirements });
  const requirements = useMemo(() => query.data || [], [query.data]);

  const mutation = useMutation({
    mutationFn: savePermitDocumentRequirement,
    onSuccess: async () => {
      setMessage('Exigence documentaire enregistrée.');
      setPermitSubtype('');
      setDocumentTypes('');
      await queryClient.invalidateQueries({ queryKey: ['permit-document-requirements'] });
    },
    onError: () => setMessage('Impossible d’enregistrer cette exigence documentaire.')
  });

  const editRequirement = (requirement: PermitDocumentRequirement) => {
    setPermitSubtype(requirement.permitSubtype);
    setDocumentTypes(requirement.requiredDocumentTypes.join('\n'));
    setMessage(null);
  };

  const submit = () => {
    const subtype = permitSubtype.trim();
    if (subtype.length < 2) { setMessage('Le type de permis doit contenir au moins 2 caractères.'); return; }
    mutation.mutate({ permitSubtype: subtype, requiredDocumentTypes: parseDocumentTypes(documentTypes) });
  };

  return <section className="rounded-xl border border-gray-200 bg-white p-4" aria-labelledby="permit-requirements-title">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div><h2 id="permit-requirements-title" className="text-lg font-semibold text-gray-900">Pièces obligatoires par type de permis</h2><p className="text-sm text-gray-600">Une liste vide désactive les exigences sans supprimer la configuration.</p></div>
      <button type="button" onClick={() => query.refetch()} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">Actualiser</button>
    </div>
    {query.isError ? <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">Impossible de charger le catalogue.</p> : null}
    <div className="mt-4 overflow-x-auto"><table className="min-w-full divide-y divide-gray-200 text-sm"><thead className="bg-gray-50 text-left text-xs uppercase text-gray-500"><tr><th className="px-3 py-2">Type de permis</th><th className="px-3 py-2">Pièces obligatoires</th>{canEdit ? <th className="px-3 py-2">Action</th> : null}</tr></thead><tbody className="divide-y divide-gray-100">
      {query.isLoading ? <tr><td colSpan={canEdit ? 3 : 2} className="px-3 py-6 text-center text-gray-500">Chargement…</td></tr> : null}
      {requirements.map((requirement) => <tr key={requirement.id}><td className="px-3 py-2 font-medium text-gray-900">{requirement.permitSubtype}</td><td className="px-3 py-2 text-gray-700">{requirement.requiredDocumentTypes.length ? requirement.requiredDocumentTypes.join(', ') : 'Aucune exigence active'}</td>{canEdit ? <td className="px-3 py-2"><button type="button" onClick={() => editRequirement(requirement)} className="rounded border px-2 py-1">Modifier</button></td> : null}</tr>)}
      {!query.isLoading && requirements.length === 0 ? <tr><td colSpan={canEdit ? 3 : 2} className="px-3 py-6 text-center text-gray-500">Aucune exigence configurée.</td></tr> : null}
    </tbody></table></div>
    {canEdit ? <div className="mt-5 grid gap-3 rounded-lg bg-gray-50 p-4 md:grid-cols-2">
      <label className="text-sm font-medium text-gray-700">Type de permis<input value={permitSubtype} onChange={(event) => setPermitSubtype(event.target.value)} maxLength={100} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="EXCAVATION" /></label>
      <label className="text-sm font-medium text-gray-700">Types de pièces<textarea value={documentTypes} onChange={(event) => setDocumentTypes(event.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="PLAN\nASSURANCE" /><span className="mt-1 block text-xs text-gray-500">Une valeur par ligne, séparée par une virgule ou un point-virgule.</span></label>
      <div className="md:col-span-2 flex flex-wrap gap-2"><button type="button" onClick={submit} disabled={mutation.isPending} className="rounded-lg bg-cityflow-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{mutation.isPending ? 'Enregistrement…' : 'Enregistrer'}</button><button type="button" onClick={() => { setPermitSubtype(''); setDocumentTypes(''); setMessage(null); }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">Réinitialiser</button></div>
    </div> : null}
    {message ? <p role="status" className="mt-3 text-sm text-gray-700">{message}</p> : null}
  </section>;
};

export { parseDocumentTypes };
export default PermitDocumentRequirementsPanel;
