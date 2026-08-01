import api from './api';

export type PermitStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'ACTIVE' | 'REJECTED' | 'CLOSED';
export type PermitTransitionAction = 'submit' | 'approve' | 'reject' | 'close';
export type PermitDocumentStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type PermitFeeStatus = 'DUE' | 'PAID' | 'WAIVED';
export interface PermitDocumentCompliance { compliant: boolean; requiredTypes: string[]; acceptedTypes: string[]; pendingTypes: string[]; rejectedTypes: string[]; missingTypes: string[] }
export interface PermitDocument { id: string; documentType: string; fileName: string; mimeType: string; sizeBytes: number; storageKey: string; sha256: string; description?: string | null; status: PermitDocumentStatus; uploadedBy: string; createdAt: string; reviewedBy?: string | null; reviewedAt?: string | null; reviewReason?: string | null }
export interface PermitDocumentInput { documentType: string; fileName: string; mimeType: string; sizeBytes: number; storageKey: string; sha256: string; description?: string | null }
export interface PermitDocumentRequirement { id: string; municipalityId: number; permitSubtype: string; requiredDocumentTypes: string[]; updatedBy?: string | null; createdAt: string; updatedAt: string }
export interface PermitDocumentRequirementInput { permitSubtype: string; requiredDocumentTypes: string[] }
export interface PermitFee { id: string; municipalityId: number; permitId: string; amountCents: number; currency: string; status: PermitFeeStatus; note?: string | null; assessedBy?: string | null; assessedAt: string; paidBy?: string | null; paidAt?: string | null; paymentReference?: string | null; createdAt: string; updatedAt: string }
export interface PermitFeeAssessmentInput { amountCents: number; currency?: string; note?: string | null }
export interface PermitPaymentInput { paymentReference: string; paidAt?: string | null }
export interface PermitListItem { id: string; sourceRef: string; status: PermitStatus; subtype: string; startTime: string; endTime?: string | null; impacts: string[]; details: Record<string, unknown>; createdAt: string; updatedAt: string }
export interface PermitRegisterResponse { items: PermitListItem[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }
export interface PermitAuditEntry { id: string; action: string; previousStatus?: PermitStatus | null; newStatus?: PermitStatus | null; reason?: string | null; occurredAt: string }
export interface PermitInspection { id: string; scheduledAt?: string | null; completedAt?: string | null; address?: string | null; inspectionType: string; status: string; outcome?: string | null; assignedTo?: string | null }
export interface PermitDetailResponse { permit: PermitListItem & { municipalityId: number; sourceType: 'PERMIT'; statusReason?: string | null; geometry: Record<string, unknown>; submittedAt?: string | null; approvedAt?: string | null; publishedAt?: string | null; closedAt?: string | null }; history: PermitAuditEntry[]; inspections: PermitInspection[]; documentCompliance: PermitDocumentCompliance }
export interface PermitFilters { status?: PermitStatus | ''; q?: string; page?: number; pageSize?: number }

export async function listPermits(filters: PermitFilters = {}): Promise<PermitRegisterResponse> { const response = await api.get<PermitRegisterResponse>('/permits', { params: filters }); return response.data; }
export async function getPermitDetail(permitId: string): Promise<PermitDetailResponse> { const response = await api.get<PermitDetailResponse>(`/permits/${permitId}`); return response.data; }
export async function transitionPermit(permitId: string, action: PermitTransitionAction, reason?: string): Promise<PermitListItem> { const payload = action === 'reject' || action === 'close' ? { reason } : undefined; const response = await api.post<{ permit: PermitListItem }>(`/permits/${permitId}/${action}`, payload); return response.data.permit; }
export async function listPermitDocuments(permitId: string): Promise<PermitDocument[]> { const response = await api.get<PermitDocument[]>(`/permits/${permitId}/documents`); return response.data; }
export async function addPermitDocument(permitId: string, input: PermitDocumentInput): Promise<PermitDocument> { const response = await api.post<{ document: PermitDocument }>(`/permits/${permitId}/documents`, input); return response.data.document; }
export async function reviewPermitDocument(permitId: string, documentId: string, status: 'ACCEPTED' | 'REJECTED', reason?: string): Promise<PermitDocument> { const response = await api.post<{ document: PermitDocument }>(`/permits/${permitId}/documents/${documentId}/review`, { status, reason }); return response.data.document; }
export async function listPermitDocumentRequirements(): Promise<PermitDocumentRequirement[]> { const response = await api.get<PermitDocumentRequirement[]>('/permits/document-requirements'); return response.data; }
export async function savePermitDocumentRequirement(input: PermitDocumentRequirementInput): Promise<PermitDocumentRequirement> { const response = await api.put<{ requirement: PermitDocumentRequirement }>('/permits/document-requirements', input); return response.data.requirement; }
export async function getPermitFee(permitId: string): Promise<PermitFee | null> { const response = await api.get<{ fee: PermitFee | null }>(`/permits/${permitId}/fees`); return response.data.fee; }
export async function assessPermitFee(permitId: string, input: PermitFeeAssessmentInput): Promise<PermitFee> { const response = await api.put<{ fee: PermitFee }>(`/permits/${permitId}/fees`, input); return response.data.fee; }
export async function markPermitFeePaid(permitId: string, input: PermitPaymentInput): Promise<PermitFee> { const response = await api.post<{ fee: PermitFee }>(`/permits/${permitId}/fees/mark-paid`, input); return response.data.fee; }
