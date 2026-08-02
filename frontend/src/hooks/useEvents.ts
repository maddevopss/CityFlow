import { useQuery } from '@tanstack/react-query';
import { getEvents, getEventsGeoJSON } from '../services/eventService';

export const useEvents = () => {
  const query = useQuery({
    queryKey: ['events'],
    queryFn: () => getEvents()
  });

  return {
    events: query.data,
    isLoading: query.isLoading,
    isError: query.isError
  };
};

export const useEventsGeoJSON = (status: string = 'ACTIVE,PLANNED') => {
  const query = useQuery({
    queryKey: ['events-geojson', status],
    queryFn: () => getEventsGeoJSON({ status })
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error
  };
};
