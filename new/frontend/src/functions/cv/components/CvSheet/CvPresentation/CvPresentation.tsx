import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../../../../../api/cvApi';
import type { Profile } from '../../../../../types/Profile';
// import './CvPresentation.scss';

interface Props {
    context: string;
}

export default function CvPresentation({ context }: Props) {
    const { data: profile, isLoading, isError } = useQuery<Profile>({
        queryKey: ['profile', context],
        queryFn: () => getProfile(context),
        staleTime: 20 * 60 * 1000,
        enabled: !!context,
    });

    if (isLoading) return <section className="cv-presentation"><p>…</p></section>;
    if (isError || !profile) return null;

    return (
        <section className="cv-presentation">
            <h2>Présentation</h2>
            {profile.description.split('\n').filter(Boolean).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
            ))}
        </section>
    );
}
