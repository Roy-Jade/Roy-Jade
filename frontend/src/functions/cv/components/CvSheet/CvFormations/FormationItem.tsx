import type { FormationItem as FormationItemData } from '../../../../../types/Formation';
import type { HiddenIdField } from '../../../../../types/searchParams';
import { isHidden } from '../../../../../utils/isHidden';
import Tag from '../../../../core/components/Tag/Tag';
import HoverAction from '../../../../core/components/HoverAction/HoverAction';
import HideIcon from '../../../../../assets/icons/hide.svg?react';
import EditIcon from '../../../../../assets/edit.svg?react';

interface Props {
    formation: FormationItemData;
    hiddenFormationDescriptionIds: number[];
    hiddenFormationTaskIds: number[];
    hiddenFormationHardskillIds: number[];
    toggleHidden: (key: HiddenIdField, id: number) => void;
    onEdit?: () => void;
    ref?: (node: HTMLLIElement | null) => void;
}

export default function FormationItem({
    formation,
    hiddenFormationDescriptionIds,
    hiddenFormationTaskIds,
    hiddenFormationHardskillIds,
    toggleHidden,
    onEdit,
    ref,
}: Props) {
    return (
        <li ref={ref} className="cv-formation hover-reveal">
            <span className="hover-actions">
                {onEdit && (
                    <HoverAction icon={<EditIcon />} label={`Éditer la formation : ${formation.title}`} onClick={onEdit} />
                )}
                <HoverAction
                    icon={<HideIcon />}
                    label={`Masquer la formation : ${formation.title}`}
                    onClick={() => toggleHidden('hiddenFormationIds', formation.id)}
                />
            </span>
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
    );
}
