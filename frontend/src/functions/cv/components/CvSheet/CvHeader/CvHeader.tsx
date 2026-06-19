import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../../../../../api/cvApi';
import type { Identity } from '../../../../../types/Identity';
import type { Profile } from '../../../../../types/Profile';
// import './CvHeader.scss';

interface Props {
    identity: Identity | undefined;
    context: string;
}

export default function CvHeader({ identity, context }: Props) {
    const { data: profile } = useQuery<Profile>({
        queryKey: ['profile', context],
        queryFn: () => getProfile(context),
        staleTime: 20 * 60 * 1000,
        enabled: !!context,
    });

    return (
        <header className="cv-header">
            <h1>
                <span className='cv-header__firstname'>{identity?.firstname}</span>
                <span className='cv-header__lastname'>{identity?.lastname}</span>
            </h1>
            <div className="cv-header__right">
                <ul className="cv-header__contact">
                    <li><strong>Adresse</strong> {identity?.postal_code} {identity?.town}</li>
                    <li><strong>Téléphone</strong> <a href={`tel:${identity?.phone}`}>{identity?.phone}</a></li>
                    <li><strong>Mail</strong> <a href={`mailto:${identity?.email}`}>{identity?.email}</a></li>
                </ul>
                <h2 className="cv-header__tagline">{profile?.tagline}</h2>
            </div>
        </header>
    );
}
