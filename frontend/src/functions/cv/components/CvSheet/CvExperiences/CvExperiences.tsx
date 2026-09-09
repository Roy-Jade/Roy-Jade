import type { ExperienceFilter, HiddenIdField } from '../../../../../types/searchParams';
import type { EditingState } from '../../../../admin/types/EditingState';
import { isHidden } from '../../../../../utils/isHidden';
import { useExperienceData } from '../../../hooks/useExperienceData';
import Tag from '../../../../../functions/core/components/Tag/Tag';
import HoverAction from '../../../../../functions/core/components/HoverAction/HoverAction';
import HideIcon from '../../../../../assets/icons/hide.svg?react';

interface Props {
    filters: ExperienceFilter[];
    hiddenExperienceIds: number[];
    hiddenExperienceDescriptionIds: number[];
    hiddenExperienceTaskIds: number[];
    hiddenExperienceHardskillIds: number[];
    hiddenExperienceSoftskillIds: number[];
    toggleHidden: (key: HiddenIdField, id: number) => void;
    editing: EditingState | null;
    setAnchor: (node: HTMLElement | null) => void;
}

export default function CvExperiences({
    filters,
    hiddenExperienceIds,
    hiddenExperienceDescriptionIds,
    hiddenExperienceTaskIds,
    hiddenExperienceHardskillIds,
    hiddenExperienceSoftskillIds,
    toggleHidden,
    editing,
    setAnchor,
}: Props) {
    const { data: experiences = [], isLoading, isError } = useExperienceData(filters);

    if (isLoading) return <section className="cv-experiences cv-selectable"><p>…</p></section>;
    if (isError) return null;

    const isEditingThis = (id: number) =>
        editing?.category === 'experience' && editing.mode === 'edit' && editing.item?.id === id;
    const isAddingNew = editing?.category === 'experience' && editing.mode === 'add';

    return (
        <section className="cv-experiences cv-selectable">
            <h2>Expériences professionnelles</h2>
            <ul>
                {experiences.filter(exp => !isHidden(exp.id, hiddenExperienceIds)).map(exp => (
                    <li
                        key={`exp ${exp.id}`}
                        className={`cv-experience cv-experience--${exp.type} hover-reveal`}
                        ref={isEditingThis(exp.id) ? setAnchor : undefined}
                    >
                        <HoverAction
                            icon={<HideIcon />}
                            label={`Masquer l'expérience : ${exp.title}`}
                            onClick={() => toggleHidden('hiddenExperienceIds', exp.id)}
                        />
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
                            {exp.description && !isHidden(exp.id, hiddenExperienceDescriptionIds) && (
                                <p className="cv-experience__desc hover-reveal">
                                    {exp.description}
                                    <HoverAction
                                        icon={<HideIcon />}
                                        label={`Masquer la description de : ${exp.title}`}
                                        onClick={() => toggleHidden('hiddenExperienceDescriptionIds', exp.id)}
                                    />
                                </p>
                            )}
                        </div>
                        {exp.tasks.length > 0 && (
                            <ul className="cv-experience__tasks">
                                {exp.tasks
                                    .filter(task => !isHidden(task.id, hiddenExperienceTaskIds))
                                    .map((task) => (
                                        <li key={`task ${task.id}`} className="hover-reveal">
                                            {`> ${task.content}`}
                                            <HoverAction
                                                icon={<HideIcon />}
                                                label={`Masquer la tâche : ${task.content}`}
                                                onClick={() => toggleHidden('hiddenExperienceTaskIds', task.id)}
                                            />
                                        </li>
                                    ))}
                                {(exp.hardskills.length > 0 || exp.softskills.length > 0) &&
                                    <li key="skills" className='cv-experience__skills'>
                                        {exp.hardskills
                                            .filter(hardskill => !isHidden(hardskill.id, hiddenExperienceHardskillIds))
                                            .map(hardskill => (
                                                <span key={hardskill.id} className="hover-reveal hover-reveal--inline">
                                                    <Tag label={hardskill.label} variant="cv-hardskill" />
                                                    <HoverAction
                                                        icon={<HideIcon />}
                                                        label={`Masquer la compétence : ${hardskill.label}`}
                                                        onClick={() => toggleHidden('hiddenExperienceHardskillIds', hardskill.id)}
                                                    />
                                                </span>
                                            ))}
                                        {exp.softskills
                                            .filter(skill => !isHidden(skill.id, hiddenExperienceSoftskillIds))
                                            .map(skill => (
                                                <span key={skill.id} className="hover-reveal hover-reveal--inline">
                                                    <Tag label={skill.label} variant="cv-softskill" />
                                                    <HoverAction
                                                        icon={<HideIcon />}
                                                        label={`Masquer la compétence : ${skill.label}`}
                                                        onClick={() => toggleHidden('hiddenExperienceSoftskillIds', skill.id)}
                                                    />
                                                </span>
                                            ))}
                                    </li>}
                            </ul>
                        )}
                    </li>
                ))}
                {isAddingNew && (
                    <li className="cv-experience cv-experience--new" ref={setAnchor}>
                        <div className="cv-experience__content">
                            <h3 className="cv-experience__title">Nouvelle expérience</h3>
                        </div>
                    </li>
                )}
            </ul>
        </section>
    );
}
