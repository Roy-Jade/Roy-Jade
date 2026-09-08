import { useQuery } from '@tanstack/react-query';
import { getFilters } from '../../../api/cvApi';
import type { FiltersData } from '../../../types/FiltersData';

export function useFiltersData() {
    return useQuery<FiltersData>({
        queryKey: ['filters'],
        queryFn: getFilters,
        staleTime: Infinity,
    });
}
