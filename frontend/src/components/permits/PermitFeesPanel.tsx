import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assessPermitFee, getPermitFee, markPermitFeePaid, waivePermitFee } from '../../services/permitService';

interface Props { permitId: string; role?: string }

export function centsFromInput(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const amount = Math.round(Number(normalized) * 100);
  return Number.isSafeInteger(amount) && amount >= 0 ? amount : null;
}

export function formatMoney(amountCents: number, currency = 'CAD'): string {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency }).format(amountCents / 100);
}

export function isValidWaiverReason(value: string): boolean {
  const length = value.trim().length;
  return length >= 10 && length <= 1000;
}

const PermitFeesPanel: React.FC<Props> = ({ permitId, role }) => {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [waiverReason, setWaiverReason] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const canWrite = role === 'ADMIN' || role === 'MANAGER';
  const feeQuery = useQuery({ queryKey: ['permit-fee', permitId], queryFn: () => getPermitFee(permitId) });

  useEffect(() => {
    if (!feeQuery.data) return;
    setAmount((feeQuery.data.amountCents / 100).toFixed(2));
    setNote(feeQuery.data.note || '');
  }, [feeQuery.data]);

  const refresh = async () => Promise.all([
    queryClient.invalidateQueries({ queryKey: ['permit-fee', permitId] }),
    queryClient.invalidateQueries({ queryKey: ['permit', permitId] })
  ]);

  const assessMutation = useMutation({
    mutationFn: () => {
      const amountCents = centsFromInput(amount);
      if (amountCents === null) throw new Error('INVALID_AMOUNT');
      return assessPermitFee(permitId, { amountCents, currency: 'CAD', note: note.trim() || null });
    },
    onSuccess: async () => { setMessage('Frais enregistrés.'); await refresh(); },
    onError: (error) => setMessage(error instanceof Error && error.message === 'INVALID_AMOUNT' ? 'Montant invalide. Utilisez au plus deux décimales.' : 'Impossible d’enregistrer les frais.')
  });

  const paymentMutation = useMutation({
    mutationFn: () => markPermitFeePaid(permitId, { paymentReference: paymentReference.trim() }),
    onSuccess: async () => { setPaymentReference(''); setMessage('Paiement constaté.'); await refresh(); },
    onError: () => setMessage('Impossible de constater ce paiement. Vérifiez la référence et l’état des frais.')
  });

  const waiverMutation = useMutation({
    mutationFn: () => waivePermitFee(permitId, { reason: waiverReason.trim() }),
    onSuccess: async () => { setWaiverReason(''); setMessage('Dispense enregistrée.'); await refresh(); },
    onError: () => setMessage('Impossible d’enregistrer cette dispense. Vérifiez le motif et l’état des frais.')
  });

  const fee = feeQuery.data;

  return <section className="space-y-3 rounded-lg border border-gray-200 p-4" aria-labelledby="permit-fees-title">
    <div className="flex items-start justify-between gap-3">
      <div><h3 id="permit-fees-title" className="font-semibold text-gray-900">Frais et paiement</h3><p className="text-sm text-gray-500">Suivi municipal du montant exigé, du paiement externe et des dispenses.</p></div>
      {fee ? <span className={`rounded-full px-2 py-1 text-xs font-semibold ${fee.status === 'PAID' ? 'bg-green-100 text-green-800' : fee.status === 'WAIVED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>{fee.status === 'PAID' ? 'Payé' : fee.status === 'WAIVED' ? 'Dispensé' : 'À payer'}</span> : null}
    </div>
    {feeQuery.isLoading ? <p className="text-sm text-gray-500">Chargement des frais…</p> : null}
    {feeQuery.isError ? <p role="alert" className="text-sm text-red-700">Impossible de charger les frais.</p> : null}
    {fee ? <dl className="grid grid-cols-2 gap-3 text-sm"><div><dt className="text-gray-500">Montant</dt><dd className="font-semibold text-gray-900">{formatMoney(fee.amountCents, fee.currency)}</dd></div><div><dt className="text-gray-500">Référence</dt><dd className="break-all">{fee.paymentReference || '—'}</dd></div>{fee.note ? <div className="col-span-2"><dt className="text-gray-500">Note</dt><dd>{fee.note}</dd></div> : null}{fee.status === 'WAIVED' ? <><div className="col-span-2"><dt className="text-gray-500">Motif de dispense</dt><dd>{fee.waivedReason || '—'}</dd></div><div><dt className="text-gray-500">Décidée le</dt><dd>{fee.waivedAt ? new Date(fee.waivedAt).toLocaleString('fr-CA') : '—'}</dd></div><div><dt className="text-gray-500">Décidée par</dt><dd className="break-all">{fee.waivedBy || '—'}</dd></div></> : null}</dl> : !feeQuery.isLoading ? <p className="text-sm text-gray-500">Aucun frais évalué.</p> : null}
    {canWrite && fee?.status !== 'PAID' ? <form onSubmit={(event) => { event.preventDefault(); setMessage(null); assessMutation.mutate(); }} className="grid gap-2 rounded-lg bg-gray-50 p-3 text-sm">
      <label className="font-medium text-gray-700">Montant en dollars<input aria-label="Montant des frais" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="125.00" className="mt-1 w-full rounded border px-2 py-1" required /></label>
      <label className="font-medium text-gray-700">Note<textarea aria-label="Note sur les frais" value={note} onChange={(event) => setNote(event.target.value)} maxLength={1000} rows={2} className="mt-1 w-full rounded border px-2 py-1" /></label>
      <button disabled={assessMutation.isPending} className="rounded bg-cityflow-700 px-3 py-2 font-medium text-white disabled:opacity-50">{assessMutation.isPending ? 'Enregistrement…' : 'Enregistrer les frais'}</button>
    </form> : null}
    {canWrite && fee?.status === 'DUE' ? <form onSubmit={(event) => { event.preventDefault(); if (paymentReference.trim().length < 3) { setMessage('La référence de paiement doit contenir au moins 3 caractères.'); return; } setMessage(null); paymentMutation.mutate(); }} className="grid gap-2 rounded-lg bg-gray-50 p-3 text-sm">
      <label className="font-medium text-gray-700">Référence du paiement<input aria-label="Référence du paiement" value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} minLength={3} maxLength={200} className="mt-1 w-full rounded border px-2 py-1" required /></label>
      <button disabled={paymentMutation.isPending} className="rounded bg-gray-900 px-3 py-2 font-medium text-white disabled:opacity-50">{paymentMutation.isPending ? 'Constatation…' : 'Constater le paiement'}</button>
    </form> : null}
    {canWrite && fee?.status === 'DUE' ? <form onSubmit={(event) => { event.preventDefault(); if (!isValidWaiverReason(waiverReason)) { setMessage('Le motif de dispense doit contenir entre 10 et 1000 caractères.'); return; } if (!window.confirm('Confirmer la dispense des frais pour ce permis?')) return; setMessage(null); waiverMutation.mutate(); }} className="grid gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
      <label className="font-medium text-blue-900">Motif de dispense<textarea aria-label="Motif de dispense" value={waiverReason} onChange={(event) => setWaiverReason(event.target.value)} minLength={10} maxLength={1000} rows={3} className="mt-1 w-full rounded border px-2 py-1" required /></label>
      <button disabled={waiverMutation.isPending} className="rounded bg-blue-700 px-3 py-2 font-medium text-white disabled:opacity-50">{waiverMutation.isPending ? 'Dispense…' : 'Dispenser les frais'}</button>
    </form> : null}
    {message ? <p role="status" className="text-sm text-gray-700">{message}</p> : null}
  </section>;
};

export default PermitFeesPanel;
