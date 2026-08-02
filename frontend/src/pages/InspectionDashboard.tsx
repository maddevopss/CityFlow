import React from 'react';
import { useInspectionDashboard } from '../hooks/useInspections';
import type { DashboardData } from '../services/inspectionService';

const cards: Array<{ key: keyof DashboardData; label: string }> = [
  { key: 'scheduled', label: 'Planifiées' },
  { key: 'completed', label: 'Terminées' },
  { key: 'upcoming', label: 'À venir (7 jours)' },
  { key: 'overdue', label: 'En retard' },
  { key: 'unassigned', label: 'Sans inspecteur' },
  { key: 'unreadReminders', label: 'Rappels non lus' }
];

const InspectionDashboard: React.FC = () => {
  const { dashboardData: data, isLoading, isError: error } = useInspectionDashboard();

  if (isLoading) return <div className="p-6 text-gray-600">Chargement des indicateurs...</div>;
  if (error || !data) return <div className="p-6 text-red-600">Impossible de charger le tableau de bord.</div>;

  return (
    <main className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord des inspections</h1>
        <p className="text-sm text-gray-600">Vue opérationnelle du cycle d’inspection municipal.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ key, label }) => (
          <article key={key} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{String(data[key])}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">Progression</h2>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full bg-cityflow-600" style={{ width: `${data.completionRate}%` }} />
          </div>
          <p className="mt-2 text-sm text-gray-600">{data.completionRate} % terminées sur {data.total} inspections.</p>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">Résultats terrain</h2>
          <dl className="mt-4 space-y-2">
            {Object.entries(data.outcomes).map(([outcome, count]) => (
              <div key={outcome} className="flex justify-between text-sm">
                <dt className="text-gray-600">{outcome}</dt>
                <dd className="font-medium text-gray-900">{count}</dd>
              </div>
            ))}
            {Object.keys(data.outcomes).length === 0 && <p className="text-sm text-gray-500">Aucun résultat disponible.</p>}
          </dl>
        </article>
      </section>
    </main>
  );
};

export default InspectionDashboard;
