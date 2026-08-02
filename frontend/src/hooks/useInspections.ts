import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { createInspection, getInspections } from '../services/inspectionService';
import type { CreateInspectionInput, InspectionStatus } from '../types';

export function useInspections(status: InspectionStatus | '') {
  return useQuery({
    queryKey: ['inspections', status],
    queryFn: () => getInspections(status || undefined)
  });
}

export function useCreateInspection(onCreated: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateInspectionInput) => createInspection(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['inspections'] });
      onCreated();
      toast.success('Inspection planifiée');
    },
    onError: () => toast.error('Impossible de planifier l’inspection')
  });
}
