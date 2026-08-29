import { useQuery } from '@tanstack/react-query';
import { getFormation } from '../../../../../api/cvApi';
import type { FormationItem } from '../../../../../types/Formation';
import type { HiddenIdField } from '../../../../../types/searchParams';
import { isHidden } from '../../../../../utils/isHidden';
import Tag from '../../../../core/components/Tag/Tag';
import HoverAction from '../../../../core/components/HoverAction/HoverAction';
import HideIcon from '../../../../../assets/icons/hide.svg?react';
// import './CvFormations.scss';

interface Props {
    domains: string[];
    hiddenFormationIds: number[];
    hiddenFormationDescriptionIds: number[];
    hiddenFormationTaskIds: number[];
    hiddenFormationHardskillIds: number[];
    toggleHidden: (key: HiddenIdField, id: number) => void;
}

export default function CvFormations({
    domains,
    hiddenFormationIds,
    hiddenFormationDescriptionIds,
    hiddenFormationTaskIds,
    hiddenFormationHardskillIds,
    toggleHidden,
}: Props) {
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
                {formations.filter(formation => !isHidden(formation.id, hiddenFormationIds)).map(formation => (
                    <li key={`form ${formation.id}`} className="cv-formation hover-reveal">
                        <HoverAction
                            icon={<HideIcon />}
                            label={`Masquer la formation : ${formation.title}`}
                            onClick={() => toggleHidden('hiddenFormationIds', formation.id)}
                        />
                        <span className="cv-formation__date">{formation.obtention_date}</span>
                        <div className="cv-formation__content">
                            <h3 className="cv-formation__title">
                                <strong>{formation.title}</strong>
                                {formation.institution && `, ${formation.institution}`}
                                {formation.location && ` (${formation.location})`}
                            </h3>
                            {formation.description && !isHidden(formation.id, hiddenFormationDescriptionIds) && (
                                <p className="cv-formation__desc hover-reveal">
                                    {formation.description}
                                    <HoverAction
                                        icon={<HideIcon />}
                                        label={`Masquer la description de : ${formation.title}`}
                                        onClick={() => toggleHidden('hiddenFormationDescriptionIds', formation.id)}
                                    />
                                </p>
                            )}
                        </div>
                        {formation.tasks.length > 0 && (
                            <ul className="cv-formation__tasks">
                                {formation.tasks
                                    .filter(task => !isHidden(task.id, hiddenFormationTaskIds))
                                    .map((task) => (
                                        <li key={`task ${task.id}`} className="hover-reveal">
                                            {`> ${task.content}`}
                                            <HoverAction
                                                icon={<HideIcon />}
                                                label={`Masquer la tâche : ${task.content}`}
                                                onClick={() => toggleHidden('hiddenFormationTaskIds', task.id)}
                                            />
                                        </li>
                                    ))}
                                {formation.hardskills.length > 0 &&
                                    <li key="skills" className='cv-formation__skills'>
                                        {formation.hardskills
                                            .filter(hardskill => !isHidden(hardskill.id, hiddenFormationHardskillIds))
                                            .map(hardskill => (
                                                <span key={hardskill.id} className="hover-reveal hover-reveal--inline">
                                                    <Tag label={hardskill.label} variant="cv-hardskill" />
                                                    <HoverAction
                                                        icon={<HideIcon />}
                                                        label={`Masquer la compétence : ${hardskill.label}`}
                                                        onClick={() => toggleHidden('hiddenFormationHardskillIds', hardskill.id)}
                                                    />
                                                </span>
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
