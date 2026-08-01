import api from './api';

export type WorkStatus = 'DRAFT' | 'PLANNED' | 'ASSIGNED' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED' | 'VERIFIED' | 'CLOSED' | 'CANCELLED';
export type WorkPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'EMERGENCY';
export interface WorkOrder { id: string; publicNumber: string; title: string; description: string; workType: string; priority: WorkPriority; status: WorkStatus; assignedTeamId?: string | null; scheduledStart?: string | null; scheduledEnd?: string | null; estimatedCost?: number | null; actualCost?: number | null }
export interface WorkOrderPage { items: WorkOrder[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }
export interface CreateWorkOrderInput { title: string; description: string; workType: 'CORRECTIVE' | 'PREVENTIVE' | 'EMERGENCY' | 'INSPECTION'; priority?: WorkPriority; assetId?: string | null; citizenReportId?: string | null; scheduledStart?: string | null; scheduledEnd?: string | null; estimatedCost?: number | null }

export async function getWorkOrders(params: { page?: number; pageSize?: number; status?: WorkStatus; priority?: WorkPriority; assignedTeamId?: string; q?: string } = {}) { const { data } = await api.get<WorkOrderPage>('/work-orders', { params }); return data; }
export async function createWorkOrder(input: CreateWorkOrderInput) { const { data } = await api.post<WorkOrder>('/work-orders', input); return data; }
export async function assignWorkOrder(id: string, input: { assignedTeamId: string; scheduledStart: string; scheduledEnd: string }) { const { data } = await api.post<WorkOrder>(`/work-orders/${id}/assign`, input); return data; }
export async function startWorkOrder(id: string) { const { data } = await api.post<WorkOrder>(`/work-orders/${id}/start`); return data; }
export async function addWorkLog(id: string, input: { logType: 'NOTE' | 'TIME' | 'MATERIAL' | 'EQUIPMENT' | 'EVIDENCE'; description: string; hours?: number | null; materialCost?: number | null; equipmentCost?: number | null }) { const { data } = await api.post(`/work-orders/${id}/logs`, input); return data; }
export async function completeWorkOrder(id: string, input: { actualCost: number; summary: string }) { const { data } = await api.post<WorkOrder>(`/work-orders/${id}/complete`, input); return data; }
