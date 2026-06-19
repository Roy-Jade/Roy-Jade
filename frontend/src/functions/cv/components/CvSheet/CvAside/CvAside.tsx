import { useQuery } from '@tanstack/react-query';
import { getAside, getHardskill } from '../../../../../api/cvApi';
import type { Hardskill } from '../../../../../types/Hardskill';
import type { Language } from '../../../../../types/Language';
import type { Hobby } from '../../../../../types/Hobby';
import photo from '../../../../../assets/photo.jpg';
// import './CvAside.scss';

interface Props {
    level: string;
    categories: string[];
}

export default function CvAside({ level, categories }: Props) {
    const { data: hardskills = [], isLoading, isError } = useQuery<Hardskill[]>({
        queryKey: ['hardskill', level, categories],
        queryFn: () => getHardskill(level, categories),
        staleTime: 20 * 60 * 1000,
        enabled: !!level,
    });

    const { data: aside, isLoading: isAsideLoading, isError: isAsideError } = useQuery<{ language: Language[]; hobby: Hobby[] }>({
        queryKey: ['aside'],
        queryFn: getAside,
        staleTime: 20 * 60 * 1000,
    });
    const { language = [], hobby = [] } = aside ?? {};

    return (
        <aside className="cv-aside">
            <img src={photo} alt="Photo de profil" className="cv-aside__photo" />

            {(isLoading || isAsideLoading) && <p>…</p>}
            {(isError || isAsideError) && <p>Erreur</p>}

            {hardskills.length > 0 && (
                <article>
                    <h2>Compétences</h2>
                    <ul>
                        {hardskills.map(skill => (
                            <li key={skill.id}>{skill.label}</li>
                        ))}
                    </ul>
                </article>
            )}

            {language.length > 0 && (
                <article>
                    <h2>Langues</h2>
                    <ul>
                        {language.map(item => (
                            <li key={item.id}>{item.label}</li>
                        ))}
                    </ul>
                </article>
            )}

            {hobby.length > 0 && (
                <article>
                    <h2>Centres d'intérêts</h2>
                    <ul>
                        {hobby.map(item => (
                            <li key={item.id}>{item.label}</li>
                        ))}
                    </ul>
                </article>
            )}
        </aside>
    );
}
