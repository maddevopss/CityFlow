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

export const getInspections = async (filters: InspectionListFilters = {}) => {
  const { data } = await api.get<InspectionListResponse>('/inspections', { params: filters });
  return data;
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
