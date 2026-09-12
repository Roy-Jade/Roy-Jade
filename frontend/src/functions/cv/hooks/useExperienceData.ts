import { useQuery } from '@tanstack/react-query';
import { getExperience } from '../../../api/cvApi';
import type { ExperienceItem } from '../../../types/Experience';

export function useExperienceData(domains: string[]) {
    return useQuery<ExperienceItem[]>({
        queryKey: ['experience', domains],
        queryFn: () => getExperience(domains),
        staleTime: 20 * 60 * 1000,
        enabled: domains.length > 0,
    });
}
