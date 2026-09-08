import { useQuery } from '@tanstack/react-query';
import { getSession } from '../../../api/authApi';

export function useAdminSession() {
    return useQuery({
        queryKey: ['authSession'],
        queryFn: getSession,
        staleTime: 20 * 60 * 1000,
    });
}
