import React, { useMemo, useState } from 'react';
import api from '../services/api';
import { useInspectionCalendar } from '../hooks/useInspections';

const startOfWeek = (date: Date) => {
  const copy = new Date(date);
  const day = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const InspectionCalendar: React.FC = () => {
  const [anchor, setAnchor] = useState(() => new Date());
  const from = useMemo(() => startOfWeek(anchor), [anchor]);
  const to = useMemo(() => new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000), [from]);

  const { calendarData: data, isLoading } = useInspectionCalendar(
    from.toISOString(),
    to.toISOString()
  );

  const days = Array.from({ length: 7 }, (_, index) => new Date(from.getTime() + index * 86400000));

  const moveWeek = (offset: number) => {
    setAnchor(new Date(anchor.getTime() + offset * 7 * 86400000));
  };

  const exportCalendar = async () => {
    const response = await api.get('/inspection-calendar/export.ics', {
      params: { from: from.toISOString(), to: to.toISOString() },
      responseType: 'blob'
    });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inspections.ics';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendrier des inspections</h1>
          <p className="text-sm text-gray-500">Semaine du {from.toLocaleDateString('fr-CA')}</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 border rounded" onClick={() => moveWeek(-1)}>Précédente</button>
          <button className="px-3 py-2 border rounded" onClick={() => setAnchor(new Date())}>Aujourd’hui</button>
          <button className="px-3 py-2 border rounded" onClick={() => moveWeek(1)}>Suivante</button>
          <button className="px-3 py-2 bg-cityflow-600 text-white rounded" onClick={exportCalendar}>Exporter .ics</button>
        </div>
      </div>

      {isLoading ? <p>Chargement…</p> : (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
          {days.map(day => {
            const entries = data?.inspections.filter(item =>
              new Date(item.scheduledAt).toDateString() === day.toDateString()
            ) || [];
            return (
              <section key={day.toISOString()} className="bg-white border rounded-lg min-h-48 p-3">
                <h2 className="font-semibold text-sm mb-3">{day.toLocaleDateString('fr-CA', { weekday: 'short', day: 'numeric' })}</h2>
                <div className="space-y-2">
                  {entries.map(item => (
                    <article key={item.id} className={`p-2 rounded border text-xs ${data?.conflicts.includes(item.id) ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                      <strong>{new Date(item.scheduledAt).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}</strong>
                      <div>{item.inspectionType}</div>
                      <div className="text-gray-500">{item.address}</div>
                      {data?.conflicts.includes(item.id) && <div className="text-red-700 font-medium">Conflit d’horaire</div>}
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InspectionCalendar;
