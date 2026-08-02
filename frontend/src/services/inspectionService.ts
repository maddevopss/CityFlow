import api from './api';
import type {
  CompleteInspectionInput,
  CreateInspectionInput,
  Inspection,
  InspectionStatus,
  InspectionType
} from '../types';

export interface InspectionListFilters {
  page?: number;
  pageSize?: number;
  status?: InspectionStatus;
  inspectionType?: InspectionType;
  assignedTo?: string;
  scheduledFrom?: string;
  scheduledTo?: string;
  q?: string;
}

export interface InspectionListResponse {
  items: Inspection[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const getInspectionsPage = async (filters: InspectionListFilters = {}) => {
  const { data } = await api.get<InspectionListResponse>('/inspections', { params: filters });
  return data;
};

// Contrat conservé pour les écrans existants; les nouveaux écrans peuvent utiliser
// getInspectionsPage afin d'exploiter toute la métadonnée de pagination.
export const getInspections = async (status?: InspectionStatus) => {
  const data = await getInspectionsPage({ status, page: 1, pageSize: 100 });
  return data.items;
};

export const getInspectionById = async (id: string) => {
  const { data } = await api.get<Inspection>(`/inspections/${id}`);
  return data;
};

export const createInspection = async (input: CreateInspectionInput) => {
  const { data } = await api.post<Inspection>('/inspections', input);
  return data;
};

export const completeInspection = async (id: string, input: CompleteInspectionInput) => {
  const { data } = await api.post<Inspection>(`/inspections/${id}/complete`, input);
  return data;
};

export interface DashboardData {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  upcoming: number;
  overdue: number;
  unassigned: number;
  unreadReminders: number;
  completionRate: number;
  outcomes: Record<string, number>;
}

export const getInspectionDashboard = async () => {
  const { data } = await api.get<DashboardData>('/inspection-dashboard');
  return data;
};

export type Trend = { month: string; scheduled: number; completed: number; compliant: number; nonCompliant: number };
export type TrendsResponse = { trends: Trend[] };

export const getInspectionTrends = async (months: number) => {
  const { data } = await api.get<TrendsResponse>('/inspection-trends', { params: { months } });
  return data;
};

export interface CalendarInspection {
  id: string;
  scheduledAt: string;
  address: string;
  inspectionType: string;
  status: string;
}

export interface CalendarResponse {
  inspections: CalendarInspection[];
  conflicts: string[];
}

export const getInspectionCalendar = async (from: string, to: string) => {
  const { data } = await api.get<CalendarResponse>('/inspection-calendar', {
    params: { from, to }
  });
  return data;
};

export const exportInspectionCalendarIcs = async (from: string, to: string) => {
  const { data } = await api.get('/inspection-calendar/export.ics', {
    params: { from, to },
    responseType: 'blob'
  });
  return data;
};
