import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from './Input';
import { Select } from './Select';
import { Textarea } from './Textarea';
import type { CreateInspectionInput, InspectionType } from '../../types';

interface InspectionFormProps {
  onSubmit: (data: CreateInspectionInput) => void;
  isLoading?: boolean;
}

const typeOptions = [
  { value: 'PRE_WORK', label: 'Avant travaux' },
  { value: 'IN_PROGRESS', label: 'En cours de travaux' },
  { value: 'FINAL', label: 'Finale' },
  { value: 'COMPLAINT', label: 'À la suite d’une plainte' }
];

export const InspectionForm: React.FC<InspectionFormProps> = ({ onSubmit, isLoading }) => {
  const [form, setForm] = useState<CreateInspectionInput>({
    scheduledAt: '',
    address: '',
    inspectionType: 'PRE_WORK',
    permitId: '',
    notes: ''
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      ...form,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
      permitId: form.permitId || null,
      notes: form.notes || null
    });
    // Optional: reset form state after submit if parent doesn't unmount it
    setForm({ scheduledAt: '', address: '', inspectionType: 'PRE_WORK', permitId: '', notes: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg bg-white p-6 shadow md:grid-cols-2">
      <Input
        label="Date et heure"
        required
        type="datetime-local"
        value={form.scheduledAt}
        onChange={event => setForm({ ...form, scheduledAt: event.target.value })}
      />
      <Select
        label="Type"
        options={typeOptions}
        value={form.inspectionType}
        onChange={event => setForm({ ...form, inspectionType: event.target.value as InspectionType })}
      />
      <Input
        label="Adresse"
        required
        minLength={3}
        value={form.address}
        onChange={event => setForm({ ...form, address: event.target.value })}
        className="md:col-span-2"
      />
      <Input
        label="Identifiant du permis (optionnel)"
        value={form.permitId || ''}
        onChange={event => setForm({ ...form, permitId: event.target.value })}
      />
      <Textarea
        label="Notes"
        value={form.notes || ''}
        onChange={event => setForm({ ...form, notes: event.target.value })}
      />
      <div className="md:col-span-2">
        <Button type="submit" isLoading={isLoading} disabled={isLoading}>
          Planifier
        </Button>
      </div>
    </form>
  );
};
