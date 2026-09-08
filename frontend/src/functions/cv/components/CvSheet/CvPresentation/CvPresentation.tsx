import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../../../../../api/cvApi';
import type { Profile } from '../../../../../types/Profile';
import type { EditingState } from '../../../../admin/types/EditingState';
import EditShell from '../../../../admin/components/EditShell/EditShell';
// import './CvPresentation.scss';

interface Props {
    context: string;
    editing: EditingState | null;
    onCloseEdit: () => void;
}

export default function CvPresentation({ context, editing, onCloseEdit }: Props) {
    const { data: profile, isLoading, isError } = useQuery<Profile>({
        queryKey: ['profile', context],
        queryFn: () => getProfile(context),
        staleTime: 20 * 60 * 1000,
        enabled: !!context,
    });

    if (isLoading) return <section className="cv-presentation cv-selectable"><p>…</p></section>;
    if (isError || !profile) return null;

    const isEditingThis = editing?.category === 'profile' && editing.mode === 'edit' && editing.item?.id === profile.id;

    return (
        <section className="cv-presentation cv-selectable">
            <h2>Présentation</h2>
            {profile.description.split('\n').filter(Boolean).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
            ))}
            {isEditingThis && <EditShell category="profile" mode="edit" itemId={profile.id} onClose={onCloseEdit} />}
        </section>
    );
}
