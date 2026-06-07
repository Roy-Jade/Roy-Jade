import { useQuery } from '@tanstack/react-query';
import { getFormation } from '../../../../../api/cvApi';
import type { FormationItem } from '../../../../../types/Formation';
// import './CvFormations.scss';

interface Props {
    domains: string[];
}

export default function CvFormations({ domains }: Props) {
    const { data: formations = [], isLoading, isError } = useQuery<FormationItem[]>({
        queryKey: ['formation', domains],
        queryFn: () => getFormation(domains),
        staleTime: 20 * 60 * 1000,
    });

    if (isLoading) return <section className="cv-formations"><p>…</p></section>;
    if (isError) return null;

    return (
        <section className="cv-formations">
            <h2>Formations et diplômes</h2>
            <ul>
                {formations.map(formation => (
                    <li key={formation.id} className="cv-formation">
                        <p className="cv-formation__header">
                            <span className="cv-formation__date">{formation.obtention_date}</span>
                            <span className="cv-formation__title">
                                <strong>{formation.title}</strong>
                                {formation.institution && `, ${formation.institution}`}
                                {formation.location && ` (${formation.location})`}
                            </span>
                        </p>
                        {formation.description && <p className="cv-formation__desc">{formation.description}</p>}
                        {formation.tasks.length > 0 && (
                            <ul className="cv-formation__tasks">
                                {formation.tasks.map((task, i) => <li key={i}>{task}</li>)}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </section>
    );
}
