import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import type { CvFiltersParams, HiddenIdField } from '../../../../types/searchParams';
import { getIdentity } from '../../../../api/cvApi';
import { toggleId } from '../../../../utils/toggleId';
import { clearIds } from '../../../../utils/clearIds';
import CvFilters from '../../components/CvFilters/CvFilters';
import CvSheet from '../../components/CvSheet/CvSheet';
import CvHiddenPanel from '../../components/CvHiddenPanel/CvHiddenPanel';
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
        hiddenHardskillIds: searchParams.getAll('hiddenHardskillIds').map(Number),
        hiddenExperienceIds: searchParams.getAll('hiddenExperienceIds').map(Number),
        hiddenExperienceDescriptionIds: searchParams.getAll('hiddenExperienceDescriptionIds').map(Number),
        hiddenExperienceTaskIds: searchParams.getAll('hiddenExperienceTaskIds').map(Number),
        hiddenExperienceHardskillIds: searchParams.getAll('hiddenExperienceHardskillIds').map(Number),
        hiddenExperienceSoftskillIds: searchParams.getAll('hiddenExperienceSoftskillIds').map(Number),
        hiddenFormationIds: searchParams.getAll('hiddenFormationIds').map(Number),
        hiddenFormationDescriptionIds: searchParams.getAll('hiddenFormationDescriptionIds').map(Number),
        hiddenFormationTaskIds: searchParams.getAll('hiddenFormationTaskIds').map(Number),
        hiddenFormationHardskillIds: searchParams.getAll('hiddenFormationHardskillIds').map(Number),
    };

    const filtersReady = !!searchParams.get('context');

    const toggleHidden = (key: HiddenIdField, id: number) => {
        setSearchParams(prev => toggleId(prev, key, id));
    };

    const clearHidden = (keys: HiddenIdField[]) => {
        setSearchParams(prev => clearIds(prev, keys));
    };

    return (
        <div className="cv-page">
            <CvFilters
                searchParams={searchParams}
                setSearchParams={setSearchParams}
            />
            <section className="cv-viewport">
                {filtersReady && !identityLoading
                    ? <CvSheet filters={filters} identity={identity} toggleHidden={toggleHidden} />
                    : <p>Chargement du CV…</p>
                }
            </section>
            {filtersReady && (
                <CvHiddenPanel filters={filters} toggleHidden={toggleHidden} clearHidden={clearHidden} />
            )}
        </div>
    );
}
