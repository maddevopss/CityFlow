import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getInspections, createInspection, getInspectionById, completeInspection, getInspectionDashboard, getInspectionTrends, getInspectionCalendar } from '../services/inspectionService';
import type { InspectionStatus, InspectionOutcome } from '../types';

interface UseInspectionsOptions {
  onCreateSuccess?: () => void;
}

export const useInspections = (options?: UseInspectionsOptions) => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<InspectionStatus | ''>('');

  const query = useQuery({
    queryKey: ['inspections', statusFilter],
    queryFn: () => getInspections(statusFilter || undefined)
  });

  const createMutation = useMutation({
    mutationFn: createInspection,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['inspections'] });
      toast.success('Inspection planifiée');
      options?.onCreateSuccess?.();
    },
    onError: () => toast.error('Impossible de planifier l’inspection')
  });

  return {
    statusFilter,
    setStatusFilter,
    inspections: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    createInspection: createMutation.mutate,
    isCreating: createMutation.isPending
  };
};

export const useInspectionDetail = (id: string) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['inspection', id],
    queryFn: () => getInspectionById(id),
    enabled: Boolean(id)
  });

  const completeMutation = useMutation({
    mutationFn: (data: { outcome: InspectionOutcome, findings: string }) => completeInspection(id, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['inspection', id] }),
        queryClient.invalidateQueries({ queryKey: ['inspections'] })
      ]);
      toast.success('Inspection terminée');
    },
    onError: () => toast.error('Impossible de terminer l’inspection')
  });

  return {
    inspection: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    completeInspection: completeMutation.mutate,
    isCompleting: completeMutation.isPending
  };
};

export const useInspectionDashboard = () => {
  const query = useQuery({
    queryKey: ['inspection-dashboard'],
    queryFn: () => getInspectionDashboard()
  });

  return {
    dashboardData: query.data,
    isLoading: query.isLoading,
    isError: query.isError
  };
};

export const useInspectionTrends = (months: number) => {
  const query = useQuery({
    queryKey: ['inspection-trends', months],
    queryFn: () => getInspectionTrends(months)
  });

  return {
    trendsData: query.data,
    isLoading: query.isLoading,
    isError: query.isError
  };
};

export const useInspectionCalendar = (from: string, to: string) => {
  const query = useQuery({
    queryKey: ['inspection-calendar', from],
    queryFn: () => getInspectionCalendar(from, to)
  });

  return {
    calendarData: query.data,
    isLoading: query.isLoading,
    isError: query.isError
  };
};
