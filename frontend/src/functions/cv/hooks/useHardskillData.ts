import { useQuery } from '@tanstack/react-query';
import { getHardskill } from '../../../api/cvApi';
import type { Hardskill } from '../../../types/Hardskill';

export function useHardskillData(level: string, categories: string[]) {
    return useQuery<Hardskill[]>({
        queryKey: ['hardskill', level, categories],
        queryFn: () => getHardskill(level, categories),
        staleTime: 20 * 60 * 1000,
        enabled: !!level,
    });
}
