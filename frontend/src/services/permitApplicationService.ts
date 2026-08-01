import api from './api';

export type PermitStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'INFORMATION_REQUIRED' | 'APPROVED' | 'REJECTED' | 'ISSUED' | 'SUSPENDED' | 'EXPIRED' | 'CLOSED';
export interface PermitApplication {
  id: string;
  publicNumber: string;
  applicantName: string;
  applicantEmail: string;
  permitType: string;
  address: string;
  description: string;
  status: PermitStatus;
  createdAt: string;
  updatedAt: string;
}
export interface PermitPage { items: PermitApplication[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }
export interface CreatePermitInput { applicantName: string; applicantEmail: string; permitType: string; address: string; description: string }

export async function getPermitApplications(params: { page?: number; pageSize?: number; status?: PermitStatus; q?: string } = {}) {
  const { data } = await api.get<PermitPage>('/permit-applications', { params });
  return data;
}

export async function createPermitApplication(input: CreatePermitInput) {
  const { data } = await api.post<PermitApplication>('/permit-applications', input);
  return data;
}

export async function getPermitApplication(id: string) {
  const { data } = await api.get<PermitApplication>(`/permit-applications/${id}`);
  return data;
}

export async function submitPermitApplication(id: string) {
  const { data } = await api.post<PermitApplication>(`/permit-applications/${id}/submit`);
  return data;
}

export async function decidePermitApplication(id: string, input: { decision: 'APPROVED' | 'REJECTED' | 'INFORMATION_REQUIRED'; reason: string; conditions?: string[]; expiresAt?: string | null }) {
  const { data } = await api.post(`/permit-applications/${id}/decision`, input);
  return data;
}

export async function issuePermitApplication(id: string) {
  const { data } = await api.post<PermitApplication>(`/permit-applications/${id}/issue`);
  return data;
}
