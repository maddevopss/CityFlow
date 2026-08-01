import api from './api';

export type CitizenRequestStatus =
  | 'SUBMITTED'
  | 'ACKNOWLEDGED'
  | 'IN_REVIEW'
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED';

export interface CitizenAttachmentInput {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
}

export interface CreateCitizenRequestInput {
  title: string;
  description: string;
  category?: string;
  location?: Record<string, unknown> | null;
  attachments?: CitizenAttachmentInput[];
}

export interface CitizenRequest {
  id: string;
  municipalityId: number;
  citizenId: string;
  title: string;
  description: string;
  category: string;
  status: CitizenRequestStatus;
  assignedTeam?: string | null;
  resolution?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CitizenTimelineEvent {
  id: string;
  type: string;
  status?: CitizenRequestStatus | null;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
}

export interface CitizenMessage {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
}

export interface CitizenTimelineResponse {
  request: CitizenRequest;
  events: CitizenTimelineEvent[];
  messages: CitizenMessage[];
}

export interface NotificationItem {
  id: string;
  eventType: string;
  resourceType: string;
  resourceId: string;
  title: string;
  body: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'READ';
  createdAt: string;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface NotificationFilters {
  eventType?: string;
  status?: NotificationItem['status'];
  page?: number;
  pageSize?: number;
}

export const createCitizenRequest = async (input: CreateCitizenRequestInput) => {
  const { data } = await api.post<CitizenRequest>('/citizen-requests', input);
  return data;
};

export const getCitizenRequestTimeline = async (id: string) => {
  const { data } = await api.get<CitizenTimelineResponse>(`/citizen-requests/${id}`);
  return data;
};

export const assignCitizenRequest = async (id: string, team: string) => {
  const { data } = await api.post<CitizenRequest>(`/citizen-requests/${id}/assign`, { team });
  return data;
};

export const updateCitizenRequestStatus = async (
  id: string,
  status: Exclude<CitizenRequestStatus, 'SUBMITTED'>,
  resolution?: string | null
) => {
  const { data } = await api.post<CitizenRequest>(`/citizen-requests/${id}/status`, {
    status,
    ...(resolution !== undefined ? { resolution } : {})
  });
  return data;
};

export const getNotifications = async (filters: NotificationFilters = {}) => {
  const { data } = await api.get<NotificationListResponse>('/notifications', { params: filters });
  return data;
};
