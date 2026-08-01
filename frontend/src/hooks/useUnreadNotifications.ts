import { useQuery } from '@tanstack/react-query';
import { getNotifications } from '../services/citizenRequestService';

export const useUnreadNotifications = () => {
  const query = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => getNotifications({ status: 'PENDING', page: 1, pageSize: 1 }),
    refetchInterval: 60_000,
    staleTime: 30_000
  });

  return {
    unreadCount: query.data?.pagination.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError
  };
};
