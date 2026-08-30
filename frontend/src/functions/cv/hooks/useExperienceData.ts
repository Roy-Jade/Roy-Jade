import { useQuery } from '@tanstack/react-query';
import { getExperience } from '../../../api/cvApi';
import type { ExperienceFilter } from '../../../types/searchParams';
import type { ExperienceItem } from '../../../types/Experience';

export function useExperienceData(filters: ExperienceFilter[]) {
    return useQuery<ExperienceItem[]>({
        queryKey: ['experience', filters],
        queryFn: () => getExperience(filters),
        staleTime: 20 * 60 * 1000,
        enabled: filters.length > 0,
    });
}
