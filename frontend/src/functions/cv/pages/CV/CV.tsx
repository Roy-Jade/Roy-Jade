import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import type { CvFiltersParams } from '../../../../types/searchParams';
import { getIdentity } from '../../../../api/cvApi';
import CvFilters from '../../components/CvFilters/CvFilters';
import CvSheet from '../../components/CvSheet/CvSheet';
// import './CV.scss';

export default function CV() {
    const [searchParams, setSearchParams] = useSearchParams();

    const { data: identity, isLoading: identityLoading } = useQuery({
        queryKey: ['identity'],
        queryFn: getIdentity,
        staleTime: 20 * 60 * 1000,
    });

    const filters: CvFiltersParams = {
        context: searchParams.get('context') ?? '',
        experienceFilters: JSON.parse(searchParams.get('experienceFilters') ?? '[]'),
        hardskillCategories: searchParams.getAll('category'),
        hardskillLevel: searchParams.get('level') ?? '',
        formationDomains: searchParams.getAll('formationDomain'),
        maxExperiences: Number(searchParams.get('maxExperiences')),
        maxFormations: Number(searchParams.get('maxFormations')),
    };

    const filtersReady = !!searchParams.get('context');

    return (
        <div className="cv-page">
            <CvFilters
                searchParams={searchParams}
                setSearchParams={setSearchParams}
            />
            <section className="cv-viewport">
                {filtersReady && !identityLoading
                    ? <CvSheet filters={filters} identity={identity} />
                    : <p>Chargement du CV…</p>
                }
            </section>
        </div>
    );
}
