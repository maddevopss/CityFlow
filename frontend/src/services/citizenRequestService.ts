import api from './api';

export type CitizenRequestStatus = 'SUBMITTED' | 'ACKNOWLEDGED' | 'IN_REVIEW' | 'PLANNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type CitizenServiceLevel = 'ON_TRACK' | 'AT_RISK' | 'BREACHED' | 'COMPLETED';
export interface CreateCitizenRequestInput { title: string; description: string; category?: string; location?: Record<string, unknown> | null; attachments?: Array<{ fileName: string; mimeType: string; sizeBytes: number; storageKey: string }>; }
export interface CitizenRequest { id: string; municipalityId: number; citizenId: string; title: string; description: string; category: string; status: CitizenRequestStatus; assignedTeam?: string | null; assignedTo?: string | null; resolution?: string | null; createdAt: string; updatedAt: string; }
export interface CitizenTimelineResponse { request: CitizenRequest; events: Array<{ id: string; type: string; status?: CitizenRequestStatus | null; createdAt: string; metadata?: Record<string, unknown> | null }>; messages: Array<{ id: string; body: string; senderId: string; visibility?: string; createdAt: string }>; }
export interface NotificationItem { id: string; eventType: string; resourceType: string; resourceId: string; title: string; body: string; status: 'PENDING' | 'SENT' | 'FAILED' | 'READ'; createdAt: string; }
export interface NotificationListResponse { items: NotificationItem[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }
export interface NotificationFilters { eventType?: string; status?: NotificationItem['status']; page?: number; pageSize?: number; }
export interface MunicipalCitizenRequestFilters { status?: CitizenRequestStatus; category?: string; assignedTeam?: string; q?: string; unassigned?: boolean; page?: number; pageSize?: number; }
export interface MunicipalCitizenRequestSummary { generatedAt: string; total: number; byStatus: Partial<Record<CitizenRequestStatus, number>>; unassigned: number; overdue: number; }
export interface MunicipalCitizenRequestListResponse { items: CitizenRequest[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }
export interface BulkAssignmentResponse { updated: number; team: string; requestIds: string[]; }
export interface CitizenServiceLevelItem extends CitizenRequest { serviceLevel: { level: CitizenServiceLevel; targetHours: number; dueAt: string; elapsedHours: number; hoursRemaining: number } }
export interface CitizenServiceLevelResponse { generatedAt: string; summary: Record<CitizenServiceLevel, number>; items: CitizenServiceLevelItem[]; }

export const citizenRequestDetailPath = (id: string) => `/municipal/citizen-requests/${encodeURIComponent(id)}`;
export const createCitizenRequest = async (input: CreateCitizenRequestInput) => (await api.post<CitizenRequest>('/citizen/requests', input)).data;
export const getCitizenRequestTimeline = async (id: string) => (await api.get<CitizenTimelineResponse>(`/citizen/requests/${id}`)).data;
export const updateCitizenRequestStatus = async (id: string, status: CitizenRequestStatus, resolution?: string) => (await api.post<CitizenRequest>(`/citizen/requests/${id}/status`, { status, resolution: resolution?.trim() || undefined })).data;
export const sendCitizenRequestMessage = async (id: string, body: string) => (await api.post<{ id: string; body: string; authorId: string; createdAt: string }>(`/citizen/requests/${id}/messages`, { body: body.trim() })).data;
export const getNotifications = async (filters: NotificationFilters = {}) => (await api.get<NotificationListResponse>('/notifications', { params: filters })).data;
export const getMunicipalCitizenRequestSummary = async () => (await api.get<MunicipalCitizenRequestSummary>('/municipal/citizen-requests/summary')).data;
export const getMunicipalCitizenRequests = async (filters: MunicipalCitizenRequestFilters = {}) => (await api.get<MunicipalCitizenRequestListResponse>('/municipal/citizen-requests', { params: filters })).data;
export const bulkAssignCitizenRequests = async (requestIds: string[], team: string) => (await api.post<BulkAssignmentResponse>('/municipal/citizen-requests/bulk-assign', { requestIds, team: team.trim() })).data;
export const getCitizenRequestServiceLevels = async (level?: CitizenServiceLevel, limit = 100) => (await api.get<CitizenServiceLevelResponse>('/municipal/citizen-requests/service-levels', { params: { level, limit } })).data;
