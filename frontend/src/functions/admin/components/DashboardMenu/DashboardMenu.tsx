import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getIdentity, getAside } from '../../../../api/cvApi';
import { patchHardskill, patchSoftskill, patchLanguage, patchHobby } from '../../../../api/dashboardApi';
import { useExperienceData } from '../../../cv/hooks/useExperienceData';
import { useFormationData } from '../../../cv/hooks/useFormationData';
import { useHardskillData } from '../../../cv/hooks/useHardskillData';
import { useSoftskillData } from '../../../cv/hooks/useSoftskillData';
import type { CvFiltersParams } from '../../../../types/searchParams';
import type { FiltersData } from '../../../../types/FiltersData';
import type { Identity } from '../../../../types/Identity';
import type { Language } from '../../../../types/Language';
import type { Hobby } from '../../../../types/Hobby';
import type { DashboardCategory, EditingState } from '../../types/EditingState';
import DashboardIdentity from '../Dashboard/DashboardIdentity/DashboardIdentity';
import DashboardProfile from '../Dashboard/DashboardProfile/DashboardProfile';
import DashboardDomain from '../Dashboard/DashboardDomain/DashboardDomain';
import DashboardSoftskill from '../Dashboard/DashboardSoftskill/DashboardSoftskill';
import DashboardHardskill from '../Dashboard/DashboardHardskill/DashboardHardskill';
import DashboardExperience from '../Dashboard/DashboardExperience/DashboardExperience';
import DashboardFormation from '../Dashboard/DashboardFormation/DashboardFormation';
import DashboardLanguage from '../Dashboard/DashboardLanguage/DashboardLanguage';
import DashboardHobby from '../Dashboard/DashboardHobby/DashboardHobby';
import '../Dashboard/Dashboard.scss';

interface Props {
    filters: CvFiltersParams;
    filtersData: FiltersData;
    editing: EditingState | null;
    onEdit: (category: DashboardCategory, item?: { id: number }) => void;
    onAdd: (category: DashboardCategory) => void;
}

const swapPosition = async <T extends { id: number; position: number }>(
    items: T[],
    id: number,
    direction: 'up' | 'down',
    patchFn: (id: number, data: { position: number }) => Promise<unknown>,
) => {
    const index = items.findIndex(item => item.id === id);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (index === -1 || targetIndex < 0 || targetIndex >= items.length) return;

    const current = items[index];
    const target = items[targetIndex];
    await patchFn(current.id, { position: target.position });
    await patchFn(target.id, { position: current.position });
};

export default function DashboardMenu({ filters, filtersData, editing, onEdit, onAdd }: Props) {
    const queryClient = useQueryClient();
    const { data: identity } = useQuery<Identity>({
        queryKey: ['identity'],
        queryFn: getIdentity,
        staleTime: 20 * 60 * 1000,
    });
    const { data: aside } = useQuery<{ language: Language[]; hobby: Hobby[] }>({
        queryKey: ['aside'],
        queryFn: getAside,
        staleTime: 20 * 60 * 1000,
    });
    const { data: experiences = [] } = useExperienceData(filters.experienceDomains);
    const { data: formations = [] } = useFormationData(filters.formationDomains);
    const { data: hardskills = [] } = useHardskillData(filters.hardskillLevel, filters.hardskillCategories);
    const { data: softskills = [] } = useSoftskillData();

    const editingId = (category: DashboardCategory): number | null =>
        editing?.category === category && editing.mode === 'edit' ? editing.item?.id ?? null : null;

    const onReorderLanguage = async (id: number, direction: 'up' | 'down') => {
        await swapPosition(aside?.language ?? [], id, direction, patchLanguage);
        await queryClient.invalidateQueries({ queryKey: ['aside'] });
    };
    const onReorderHobby = async (id: number, direction: 'up' | 'down') => {
        await swapPosition(aside?.hobby ?? [], id, direction, patchHobby);
        await queryClient.invalidateQueries({ queryKey: ['aside'] });
    };
    const onReorderSoftskill = async (id: number, direction: 'up' | 'down') => {
        await swapPosition(softskills, id, direction, patchSoftskill);
        await queryClient.invalidateQueries({ queryKey: ['softskill'] });
    };
    const onReorderHardskill = async (id: number, direction: 'up' | 'down') => {
        await swapPosition(hardskills, id, direction, patchHardskill);
        await queryClient.invalidateQueries({ queryKey: ['hardskill'] });
    };

    return (
        <div className="dashboard-grid">
            {identity && (
                <DashboardIdentity
                    identity={identity}
                    isEditing={editing?.category === 'identity'}
                    onEdit={() => onEdit('identity')}
                />
            )}
            <DashboardLanguage
                languages={aside?.language ?? []}
                editingId={editingId('language')}
                onEdit={item => onEdit('language', item)}
                onAdd={() => onAdd('language')}
                onReorder={onReorderLanguage}
            />
            <DashboardHobby
                hobbies={aside?.hobby ?? []}
                editingId={editingId('hobby')}
                onEdit={item => onEdit('hobby', item)}
                onAdd={() => onAdd('hobby')}
                onReorder={onReorderHobby}
            />
            <DashboardDomain
                domains={filtersData.domain}
                editingId={editingId('domain')}
                onEdit={item => onEdit('domain', item)}
                onAdd={() => onAdd('domain')}
            />
            <DashboardProfile
                profiles={filtersData.profile}
                editingId={editingId('profile')}
                onEdit={item => onEdit('profile', item)}
                onAdd={() => onAdd('profile')}
            />
            <DashboardSoftskill
                softskills={softskills}
                editingId={editingId('softskill')}
                onEdit={item => onEdit('softskill', item)}
                onAdd={() => onAdd('softskill')}
                onReorder={onReorderSoftskill}
            />
            <DashboardHardskill
                hardskills={hardskills}
                editingId={editingId('hardskill')}
                onEdit={item => onEdit('hardskill', item)}
                onAdd={() => onAdd('hardskill')}
                onReorder={onReorderHardskill}
            />
            <DashboardExperience
                experiences={experiences}
                editingId={editingId('experience')}
                onEdit={item => onEdit('experience', item)}
                onAdd={() => onAdd('experience')}
            />
            <DashboardFormation
                formations={formations}
                editingId={editingId('formation')}
                onEdit={item => onEdit('formation', item)}
                onAdd={() => onAdd('formation')}
            />
        </div>
    );
}
