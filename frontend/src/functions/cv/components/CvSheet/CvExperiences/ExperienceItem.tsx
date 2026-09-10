import type { ExperienceItem as ExperienceItemData } from '../../../../../types/Experience';
import type { HiddenIdField } from '../../../../../types/searchParams';
import { isHidden } from '../../../../../utils/isHidden';
import { formatDisplayDate } from '../../../../../utils/formatDisplayDate';
import Tag from '../../../../core/components/Tag/Tag';
import HoverAction from '../../../../core/components/HoverAction/HoverAction';
import HideIcon from '../../../../../assets/icons/hide.svg?react';
import EditIcon from '../../../../../assets/edit.svg?react';

interface Props {
    exp: ExperienceItemData;
    hiddenExperienceDescriptionIds: number[];
    hiddenExperienceTaskIds: number[];
    hiddenExperienceHardskillIds: number[];
    hiddenExperienceSoftskillIds: number[];
    toggleHidden: (key: HiddenIdField, id: number) => void;
    onEdit?: () => void;
    ref?: (node: HTMLLIElement | null) => void;
}

export default function ExperienceItem({
    exp,
    hiddenExperienceDescriptionIds,
    hiddenExperienceTaskIds,
    hiddenExperienceHardskillIds,
    hiddenExperienceSoftskillIds,
    toggleHidden,
    onEdit,
    ref,
}: Props) {
    return (
        <li ref={ref} className={`cv-experience cv-experience--${exp.type} hover-reveal`}>
            <span className="hover-actions">
                {onEdit && (
                    <HoverAction icon={<EditIcon />} label={`Éditer l'expérience : ${exp.title}`} onClick={onEdit} />
                )}
                <HoverAction
                    icon={<HideIcon />}
                    label={`Masquer l'expérience : ${exp.title}`}
                    onClick={() => toggleHidden('hiddenExperienceIds', exp.id)}
                />
            </span>
            <span className="cv-experience__dates">
                <span>{formatDisplayDate(exp.start_date)}</span>
                {exp.end_date && exp.end_date !== exp.start_date && <span>{formatDisplayDate(exp.end_date)}</span>}
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
    );
}
