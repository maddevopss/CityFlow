import api from './api';

export type CitizenReportStatus = 'RECEIVED' | 'TRIAGED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED' | 'REJECTED';
export type CitizenReportPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type CitizenReportCategory = 'ROAD' | 'LIGHTING' | 'PARK' | 'WASTE' | 'WATER' | 'BUILDING' | 'OTHER';
export interface CitizenReport { id: string; publicNumber: string; category: CitizenReportCategory; title: string; description?: string; address?: string | null; status: CitizenReportStatus; priority: CitizenReportPriority; assignedTeamId?: string | null; workOrderId?: string | null; createdAt: string; updatedAt: string }
export interface CitizenReportPage { items: CitizenReport[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }
export interface PublicCitizenReportInput { municipalityId: number; category: CitizenReportCategory; title: string; description: string; address?: string | null; reporterName?: string | null; reporterEmail?: string | null; reporterPhone?: string | null; consentToContact?: boolean }

export async function createPublicCitizenReport(input: PublicCitizenReportInput) { const { data } = await api.post('/citizen-reports/public', input); return data as { publicNumber: string; trackingToken: string; status: CitizenReportStatus; createdAt: string }; }
export async function trackPublicCitizenReport(publicNumber: string, trackingToken: string) { const { data } = await api.get(`/citizen-reports/public/${publicNumber}`, { headers: { 'x-cityflow-tracking-token': trackingToken } }); return data; }
export async function getCitizenReports(params: { page?: number; pageSize?: number; status?: CitizenReportStatus; category?: CitizenReportCategory; priority?: CitizenReportPriority; q?: string } = {}) { const { data } = await api.get<CitizenReportPage>('/citizen-reports', { params }); return data; }
export async function transitionCitizenReport(id: string, input: { status: CitizenReportStatus; priority?: CitizenReportPriority; assignedTeamId?: string | null; workOrderId?: string | null; reason: string }) { const { data } = await api.post<CitizenReport>(`/citizen-reports/${id}/transition`, input); return data; }
export async function addCitizenReportMessage(id: string, input: { visibility?: 'PUBLIC' | 'INTERNAL'; message: string }) { const { data } = await api.post(`/citizen-reports/${id}/messages`, input); return data; }
