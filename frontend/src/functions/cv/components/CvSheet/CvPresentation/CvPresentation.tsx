import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../../../../../api/cvApi';
import type { Profile } from '../../../../../types/Profile';
import type { DashboardCategory, EditingState } from '../../../../admin/types/EditingState';
import type { EditPreview } from '../../../../admin/types/EditPreview';
import HoverAction from '../../../../core/components/HoverAction/HoverAction';
import EditIcon from '../../../../../assets/edit.svg?react';
// import './CvPresentation.scss';

interface Props {
    context: string;
    editing: EditingState | null;
    preview: EditPreview | null;
    setAnchor: (node: HTMLElement | null) => void;
    onEdit?: (category: DashboardCategory, item?: { id: number }) => void;
}

export default function CvPresentation({ context, editing, preview, setAnchor, onEdit }: Props) {
    const { data: profile, isLoading, isError } = useQuery<Profile>({
        queryKey: ['profile', context],
        queryFn: () => getProfile(context),
        staleTime: 20 * 60 * 1000,
        enabled: !!context,
    });

    if (isLoading) return <section className="cv-presentation cv-selectable"><p>…</p></section>;
    if (isError || !profile) return null;

    const isEditingThis = editing?.category === 'profile' && editing.mode === 'edit' && editing.item?.id === profile.id;
    const displayProfile = isEditingThis && preview?.category === 'profile' ? preview.data : profile;

    return (
        <section className="cv-presentation cv-selectable hover-reveal" ref={isEditingThis ? setAnchor : undefined}>
            {onEdit && (
                <HoverAction
                    icon={<EditIcon />}
                    label="Éditer la présentation"
                    onClick={() => onEdit('profile', { id: profile.id })}
                />
            )}
            <h2>Présentation</h2>
            {displayProfile.description.split('\n').filter(Boolean).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
            ))}
        </section>
    );
}
