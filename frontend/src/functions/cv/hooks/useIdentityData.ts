import { useQuery } from '@tanstack/react-query';
import { getIdentity } from '../../../api/cvApi';
import type { Identity } from '../../../types/Identity';

export function useIdentityData() {
    return useQuery<Identity>({
        queryKey: ['identity'],
        queryFn: getIdentity,
        staleTime: 20 * 60 * 1000,
    });
}
