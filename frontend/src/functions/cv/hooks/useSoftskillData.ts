import { useQuery } from '@tanstack/react-query';
import { getSoftskill } from '../../../api/cvApi';
import type { Softskill } from '../../../types/Softskill';

export function useSoftskillData() {
    return useQuery<Softskill[]>({
        queryKey: ['softskill'],
        queryFn: getSoftskill,
        staleTime: 20 * 60 * 1000,
    });
}
