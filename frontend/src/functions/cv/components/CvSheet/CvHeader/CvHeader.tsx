import type { CSSProperties } from 'react';
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
        <header className="cv-header cv-selectable">
            <h1>
                <span className='cv-header__firstname'>{identity?.firstname}</span>
                <span className='cv-header__lastname'>{identity?.lastname}</span>
            </h1>
            <div className="cv-header__right">
                <address className="cv-header__address">
                    <ul className="cv-header__contact">
                        <li><strong>Adresse</strong>{identity?.town}</li>
                        <li><strong>Téléphone</strong> <a href={`tel:${identity?.telephone}`}>{identity?.telephone}</a></li>
                        <li><strong>Mail</strong> <a href={`mailto:${identity?.email}`}>{identity?.email}</a></li>
                    </ul>
                </address>
                <p
                    className="cv-header__tagline"
                    style={{ '--tagline-length': Math.max(profile?.tagline.length ?? 1, 1) } as CSSProperties}
                >
                    {profile?.tagline}
                </p>
            </div>
        </header>
    );
}
