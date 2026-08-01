import api from './api';

export type AssetCategory = 'PARK' | 'BUILDING' | 'VEHICLE' | 'EQUIPMENT';
export type AssetStatus = 'PLANNED' | 'ACTIVE' | 'OUT_OF_SERVICE' | 'DISPOSED';
export type AssetCriticality = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export interface Asset { id: string; publicCode: string; name: string; category: AssetCategory; status: AssetStatus; criticality: AssetCriticality; address?: string | null; description?: string | null; assessments?: Array<{ condition: string; score: number; assessedAt: string }> }
export interface AssetPage { items: Asset[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }
export interface CreateAssetInput { publicCode: string; name: string; category: AssetCategory; status?: AssetStatus; criticality?: AssetCriticality; address?: string | null; description?: string | null; parentId?: string | null }

export async function getAssets(params: { page?: number; pageSize?: number; category?: AssetCategory; status?: AssetStatus; criticality?: AssetCriticality; q?: string } = {}) {
  const { data } = await api.get<AssetPage>('/assets', { params });
  return data;
}
export async function createAsset(input: CreateAssetInput) { const { data } = await api.post<Asset>('/assets', input); return data; }
export async function getAsset(id: string) { const { data } = await api.get<Asset>(`/assets/${id}`); return data; }
export async function assessAsset(id: string, input: { condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL'; score: number; notes?: string | null; assessedAt?: string }) { const { data } = await api.post(`/assets/${id}/assessments`, input); return data; }
export async function changeAssetStatus(id: string, input: { status: AssetStatus; reason: string }) { const { data } = await api.post<Asset>(`/assets/${id}/status`, input); return data; }
