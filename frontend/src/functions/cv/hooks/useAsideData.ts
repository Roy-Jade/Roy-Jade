import { useQuery } from '@tanstack/react-query';
import { getAside } from '../../../api/cvApi';
import type { Language } from '../../../types/Language';
import type { Hobby } from '../../../types/Hobby';

export function useAsideData() {
    return useQuery<{ language: Language[]; hobby: Hobby[] }>({
        queryKey: ['aside'],
        queryFn: getAside,
        staleTime: 20 * 60 * 1000,
    });
}
