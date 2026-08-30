import { useQuery } from '@tanstack/react-query';
import { getFormation } from '../../../api/cvApi';
import type { FormationItem } from '../../../types/Formation';

export function useFormationData(domains: string[]) {
    return useQuery<FormationItem[]>({
        queryKey: ['formation', domains],
        queryFn: () => getFormation(domains),
        staleTime: 20 * 60 * 1000,
    });
}
