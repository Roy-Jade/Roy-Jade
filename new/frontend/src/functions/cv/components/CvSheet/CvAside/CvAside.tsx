import { useQuery } from '@tanstack/react-query';
import { getHardskill } from '../../../../../api/cvApi';
import type { Hardskill } from '../../../../../types/Hardskill';
// import './CvAside.scss';

interface Props {
    level: string;
    categories: string[];
    photo: string | null;
}

export default function CvAside({ level, categories, photo }: Props) {
    const { data: hardskills = [], isLoading, isError } = useQuery<Hardskill[]>({
        queryKey: ['hardskill', level, categories],
        queryFn: () => getHardskill(level, categories),
        staleTime: 20 * 60 * 1000,
        enabled: !!level,
    });

    const grouped = hardskills.reduce<Record<string, Hardskill[]>>((acc, skill) => {
        (acc[skill.category] ??= []).push(skill);
        return acc;
    }, {});

    return (
        <aside className="cv-aside">
            {photo && <img src={photo} alt="Photo de profil" className="cv-aside__photo" />}

            {isLoading && <p>…</p>}
            {isError && <p>Erreur</p>}

            {Object.entries(grouped).map(([category, skills]) => (
                <article key={category}>
                    <h2>{category}</h2>
                    <ul>
                        {skills.map(skill => (
                            <li key={skill.id}>{skill.label}</li>
                        ))}
                    </ul>
                </article>
            ))}
        </aside>
    );
}
