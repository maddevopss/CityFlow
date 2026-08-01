import api from './api';
import type {
  CompleteInspectionInput,
  CreateInspectionInput,
  Inspection,
  InspectionStatus
} from '../types';

export const getInspections = async (status?: InspectionStatus) => {
  const { data } = await api.get<Inspection[]>('/inspections', {
    params: status ? { status } : undefined
  });
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
