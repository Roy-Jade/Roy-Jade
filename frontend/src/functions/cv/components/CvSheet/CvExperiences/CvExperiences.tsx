import { useQuery } from '@tanstack/react-query';
import { getExperience } from '../../../../../api/cvApi';
import type { ExperienceFilter } from '../../../../../types/searchParams';
import type { ExperienceItem } from '../../../../../types/Experience';
import Tag from '../../../../../functions/core/components/Tag/Tag';

interface Props {
    filters: ExperienceFilter[];
    max: number;
}

export default function CvExperiences({ filters, max }: Props) {
    const { data: experiences = [], isLoading, isError } = useQuery<ExperienceItem[]>({
        queryKey: ['experience', filters],
        queryFn: () => getExperience(filters),
        staleTime: 20 * 60 * 1000,
        enabled: filters.length > 0,
    });

    if (isLoading) return <section className="cv-experiences"><p>…</p></section>;
    if (isError) return null;

    return (
        <section className="cv-experiences">
            <h2>Expériences professionnelles</h2>
            <ul>
                {experiences.slice(0, max).map(exp => (
                    <li key={`exp ${exp.id}`} className={`cv-experience cv-experience--${exp.type}`}>
                        <span className="cv-experience__dates">
                            <span>{exp.start_date}</span>
                            {exp.end_date && exp.end_date !== exp.start_date && <span>{exp.end_date}</span>}
                        </span>
                        <div className="cv-experience__content"> 
                            <h3 className="cv-experience__title">
                                <strong>{exp.title}</strong>
                                {exp.company && `, ${exp.company}`}
                                {exp.location && ` (${exp.location})`}
                            </h3>
                            {exp.description && <p className="cv-experience__desc">{exp.description}</p>}
                        </div>
                        {exp.tasks.length > 0 && (
                            <ul className="cv-experience__tasks">
                                {exp.tasks.map((task) => <li key={`task ${task.position}`}>{`> ${task.content}`}</li>)}
                                {(exp.hardskills.length > 0 || exp.softskills.length > 0) && 
                                    <li key="skills" className='cv-experience__skills'>
                                        {exp.hardskills.map(hardskill => (
                                            <Tag key={hardskill.slug} label={hardskill.label} variant="cv-hardskill" />
                                        ))}
                                        {exp.softskills.map(skill => (
                                            <Tag key={skill.slug} label={skill.label} variant="cv-softskill" />
                                        ))}
                                    </li>}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </section>
    );
}
