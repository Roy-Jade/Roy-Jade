import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../../../../../api/cvApi';
import type { Profile } from '../../../../../types/Profile';
import type { EditingState } from '../../../../admin/types/EditingState';
import type { EditPreview } from '../../../../admin/types/EditPreview';
// import './CvPresentation.scss';

interface Props {
    context: string;
    editing: EditingState | null;
    preview: EditPreview | null;
    setAnchor: (node: HTMLElement | null) => void;
}

export default function CvPresentation({ context, editing, preview, setAnchor }: Props) {
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
        <section className="cv-presentation cv-selectable" ref={isEditingThis ? setAnchor : undefined}>
            <h2>Présentation</h2>
            {displayProfile.description.split('\n').filter(Boolean).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
            ))}
        </section>
    );
}
