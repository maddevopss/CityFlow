import api from './api';

export interface ExecutiveDashboard {
  period: { from: string; to: string };
  generatedAt: string;
  municipalityId: number;
  modules: {
    inspections: { total: number; completed: number; nonCompliant: number };
    permits: { total: number; issued: number; pending: number };
    assets: { total: number; outOfService: number; critical: number };
    publicWorks: { total: number; backlog: number; actualCost: number };
    citizenReports: { total: number; open: number; resolved: number };
  };
}

export async function getExecutiveDashboard(params: { from?: string; to?: string } = {}) {
  const { data } = await api.get<ExecutiveDashboard>('/executive-dashboard', { params });
  return data;
}
