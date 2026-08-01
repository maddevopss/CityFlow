import api from './api';

export type PermitStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'ACTIVE' | 'REJECTED' | 'CLOSED';
export type PermitTransitionAction = 'submit' | 'approve' | 'reject' | 'close';

export interface PermitListItem {
  id: string;
  sourceRef: string;
  status: PermitStatus;
  subtype: string;
  startTime: string;
  endTime?: string | null;
  impacts: string[];
  details: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PermitRegisterResponse {
  items: PermitListItem[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface PermitAuditEntry {
  id: string;
  action: string;
  previousStatus?: PermitStatus | null;
  newStatus?: PermitStatus | null;
  reason?: string | null;
  occurredAt: string;
}

export interface PermitInspection {
  id: string;
  scheduledAt?: string | null;
  completedAt?: string | null;
  address?: string | null;
  inspectionType: string;
  status: string;
  outcome?: string | null;
  assignedTo?: string | null;
}

export interface PermitDetailResponse {
  permit: PermitListItem & {
    municipalityId: number;
    sourceType: 'PERMIT';
    statusReason?: string | null;
    geometry: Record<string, unknown>;
    submittedAt?: string | null;
    approvedAt?: string | null;
    publishedAt?: string | null;
    closedAt?: string | null;
  };
  history: PermitAuditEntry[];
  inspections: PermitInspection[];
}

export interface PermitFilters {
  status?: PermitStatus | '';
  q?: string;
  page?: number;
  pageSize?: number;
}

export async function listPermits(filters: PermitFilters = {}): Promise<PermitRegisterResponse> {
  const response = await api.get<PermitRegisterResponse>('/permits', { params: filters });
  return response.data;
}

export async function getPermitDetail(permitId: string): Promise<PermitDetailResponse> {
  const response = await api.get<PermitDetailResponse>(`/permits/${permitId}`);
  return response.data;
}

export async function transitionPermit(
  permitId: string,
  action: PermitTransitionAction,
  reason?: string
): Promise<PermitListItem> {
  const payload = action === 'reject' || action === 'close' ? { reason } : undefined;
  const response = await api.post<{ permit: PermitListItem }>(`/permits/${permitId}/${action}`, payload);
  return response.data.permit;
}
