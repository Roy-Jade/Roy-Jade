import { useQuery } from '@tanstack/react-query';
import { getIdentity, getAside } from '../../../../api/cvApi';
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

export default function DashboardMenu({ filters, filtersData, editing, onEdit, onAdd }: Props) {
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
    const { data: experiences = [] } = useExperienceData(filters.experienceFilters);
    const { data: formations = [] } = useFormationData(filters.formationDomains);
    const { data: hardskills = [] } = useHardskillData(filters.hardskillLevel, filters.hardskillCategories);
    const { data: softskills = [] } = useSoftskillData();

    const editingId = (category: DashboardCategory): number | null =>
        editing?.category === category && editing.mode === 'edit' ? editing.item?.id ?? null : null;

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
            />
            <DashboardHobby
                hobbies={aside?.hobby ?? []}
                editingId={editingId('hobby')}
                onEdit={item => onEdit('hobby', item)}
                onAdd={() => onAdd('hobby')}
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
            />
            <DashboardHardskill
                hardskills={hardskills}
                editingId={editingId('hardskill')}
                onEdit={item => onEdit('hardskill', item)}
                onAdd={() => onAdd('hardskill')}
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
