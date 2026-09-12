import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import type { CvFiltersParams, HiddenIdField } from '../../../../types/searchParams';
import type { FiltersData } from '../../../../types/FiltersData';
import { getIdentity, getFilters } from '../../../../api/cvApi';
import { toggleId } from '../../../../utils/toggleId';
import { clearIds } from '../../../../utils/clearIds';
import { useAdminSession } from '../../../core/hooks/useAdminSession';
import type { DashboardCategory, EditingState } from '../../../admin/types/EditingState';
import type { EditPreview } from '../../../admin/types/EditPreview';
import DashboardMenu from '../../../admin/components/DashboardMenu/DashboardMenu';
import EditShell from '../../../admin/components/EditShell/EditShell';
import { ToastProvider } from '../../../admin/context/ToastContext';
import ToastStack from '../../../admin/components/ToastStack/ToastStack';

const MENU_ONLY_CATEGORIES: DashboardCategory[] = ['identity', 'domain', 'softskill'];
import CvFilters from '../../components/CvFilters/CvFilters';
import CvSheet from '../../components/CvSheet/CvSheet';
import CvHiddenPanel from '../../components/CvHiddenPanel/CvHiddenPanel';
// import './CV.scss';

export default function CV() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [editing, setEditing] = useState<EditingState | null>(null);
    const [preview, setPreview] = useState<EditPreview | null>(null);

    const { data: session } = useAdminSession();

    const { data: identity, isLoading: identityLoading } = useQuery({
        queryKey: ['identity'],
        queryFn: getIdentity,
        staleTime: 20 * 60 * 1000,
    });

    const { data: filtersData } = useQuery<FiltersData>({
        queryKey: ['filters'],
        queryFn: getFilters,
        staleTime: Infinity,
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

    const handleEdit = (category: DashboardCategory, item?: { id: number }) => {
        setEditing({ category, mode: 'edit', item });
        setPreview(null);
    };

    const handleAdd = (category: DashboardCategory) => {
        setEditing({ category, mode: 'add' });
        setPreview(null);
    };

    const closeEditing = () => {
        setEditing(null);
        setPreview(null);
    };

    const scrollToMenuOnlyForm = useCallback((node: HTMLElement | null) => {
        node?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, []);

    const isAdmin = !!session?.isAdmin;
    const menuOnlyEditing = editing && MENU_ONLY_CATEGORIES.includes(editing.category) ? editing : null;

    return (
        <ToastProvider>
            <div className="cv-page">
                <ToastStack />
                <CvFilters
                    searchParams={searchParams}
                    setSearchParams={setSearchParams}
                />
                <section className="cv-viewport">
                    {filtersReady && !identityLoading
                        ? (
                            <CvSheet
                                filters={filters}
                                identity={identity}
                                toggleHidden={toggleHidden}
                                editing={isAdmin ? editing : null}
                                preview={isAdmin ? preview : null}
                                onCloseEdit={closeEditing}
                                onPreviewChange={setPreview}
                                onEdit={isAdmin ? handleEdit : undefined}
                                onAdd={isAdmin ? handleAdd : undefined}
                            />
                        )
                        : <p>Chargement du CV…</p>
                    }
                </section>
                {filtersReady && (
                    <CvHiddenPanel filters={filters} toggleHidden={toggleHidden} clearHidden={clearHidden} />
                )}
                {isAdmin && filtersReady && filtersData && (
                    <>
                        <DashboardMenu
                            filters={filters}
                            filtersData={filtersData}
                            editing={editing}
                            onEdit={handleEdit}
                            onAdd={handleAdd}
                        />
                        {menuOnlyEditing && (
                            <EditShell
                                key={`${menuOnlyEditing.category}-${menuOnlyEditing.mode}-${menuOnlyEditing.item?.id ?? 'new'}`}
                                category={menuOnlyEditing.category}
                                mode={menuOnlyEditing.mode}
                                itemId={menuOnlyEditing.item?.id}
                                onClose={closeEditing}
                                ref={scrollToMenuOnlyForm}
                            />
                        )}
                    </>
                )}
            </div>
        </ToastProvider>
    );
}
