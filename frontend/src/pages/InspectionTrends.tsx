import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

type Trend = { month: string; scheduled: number; completed: number; compliant: number; nonCompliant: number };
type TrendsResponse = { trends: Trend[] };

const InspectionTrends: React.FC = () => {
  const [months, setMonths] = useState(6);
  const { data, isLoading, error } = useQuery<TrendsResponse>({
    queryKey: ['inspection-trends', months],
    queryFn: async () => (await api.get('/inspection-trends', { params: { months } })).data
  });

  if (isLoading) return <div className="p-6 text-gray-600">Chargement des tendances...</div>;
  if (error || !data) return <div className="p-6 text-red-600">Impossible de charger les tendances.</div>;

  const max = Math.max(1, ...data.trends.flatMap(item => [item.scheduled, item.completed]));

  return (
    <main className="p-6 space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tendances des inspections</h1>
          <p className="text-sm text-gray-600">Évolution mensuelle de la planification, de la réalisation et de la conformité.</p>
        </div>
        <label className="text-sm text-gray-600">Période
          <select className="ml-2 rounded border border-gray-300 px-3 py-2" value={months} onChange={event => setMonths(Number(event.target.value))}>
            <option value={3}>3 mois</option><option value={6}>6 mois</option><option value={12}>12 mois</option>
          </select>
        </label>
      </header>

      <section className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex min-w-[680px] items-end gap-4 h-72">
          {data.trends.map(item => (
            <article key={item.month} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-52 items-end gap-2">
                <div title={`${item.scheduled} planifiées`} className="w-7 rounded-t bg-gray-300" style={{ height: `${(item.scheduled / max) * 100}%` }} />
                <div title={`${item.completed} terminées`} className="w-7 rounded-t bg-cityflow-600" style={{ height: `${(item.completed / max) * 100}%` }} />
              </div>
              <p className="text-xs font-medium text-gray-700">{item.month}</p>
              <p className="text-xs text-gray-500">{item.compliant} conformes · {item.nonCompliant} non conformes</p>
            </article>
          ))}
        </div>
        <div className="mt-4 flex gap-4 text-xs text-gray-600"><span>■ Planifiées</span><span className="text-cityflow-700">■ Terminées</span></div>
      </section>
    </main>
  );
};

export default InspectionTrends;
