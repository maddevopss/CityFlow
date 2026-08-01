import api from './api';

export type CitizenRequestStatus = 'SUBMITTED' | 'ACKNOWLEDGED' | 'IN_REVIEW' | 'PLANNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export interface CreateCitizenRequestInput { title: string; description: string; category?: string; location?: Record<string, unknown> | null; attachments?: Array<{ fileName: string; mimeType: string; sizeBytes: number; storageKey: string }>; }
export interface CitizenRequest { id: string; municipalityId: number; citizenId: string; title: string; description: string; category: string; status: CitizenRequestStatus; assignedTeam?: string | null; resolution?: string | null; createdAt: string; updatedAt: string; }
export interface CitizenTimelineResponse { request: CitizenRequest; events: Array<{ id: string; type: string; status?: CitizenRequestStatus | null; createdAt: string; metadata?: Record<string, unknown> | null }>; messages: Array<{ id: string; body: string; senderId: string; createdAt: string }>; }
export interface NotificationItem { id: string; eventType: string; resourceType: string; resourceId: string; title: string; body: string; status: 'PENDING' | 'SENT' | 'FAILED' | 'READ'; createdAt: string; }
export interface NotificationListResponse { items: NotificationItem[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }
export interface NotificationFilters { eventType?: string; status?: NotificationItem['status']; page?: number; pageSize?: number; }

export const createCitizenRequest = async (input: CreateCitizenRequestInput) => (await api.post<CitizenRequest>('/citizen/requests', input)).data;
export const getCitizenRequestTimeline = async (id: string) => (await api.get<CitizenTimelineResponse>(`/citizen/requests/${id}`)).data;
export const getNotifications = async (filters: NotificationFilters = {}) => (await api.get<NotificationListResponse>('/notifications', { params: filters })).data;
