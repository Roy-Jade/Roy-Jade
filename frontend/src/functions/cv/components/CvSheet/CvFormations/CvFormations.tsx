import { Fragment } from 'react';
import type { HiddenIdField } from '../../../../../types/searchParams';
import type { EditingState } from '../../../../admin/types/EditingState';
import { isHidden } from '../../../../../utils/isHidden';
import { useFormationData } from '../../../hooks/useFormationData';
import Tag from '../../../../core/components/Tag/Tag';
import HoverAction from '../../../../core/components/HoverAction/HoverAction';
import HideIcon from '../../../../../assets/icons/hide.svg?react';
import EditShell from '../../../../admin/components/EditShell/EditShell';
// import './CvFormations.scss';

interface Props {
    domains: string[];
    hiddenFormationIds: number[];
    hiddenFormationDescriptionIds: number[];
    hiddenFormationTaskIds: number[];
    hiddenFormationHardskillIds: number[];
    toggleHidden: (key: HiddenIdField, id: number) => void;
    editing: EditingState | null;
    onCloseEdit: () => void;
}

export default function CvFormations({
    domains,
    hiddenFormationIds,
    hiddenFormationDescriptionIds,
    hiddenFormationTaskIds,
    hiddenFormationHardskillIds,
    toggleHidden,
    editing,
    onCloseEdit,
}: Props) {
    const { data: formations = [], isLoading, isError } = useFormationData(domains);

    if (isLoading) return <section className="cv-formations cv-selectable"><p>…</p></section>;
    if (isError) return null;

    const isEditingThis = (id: number) =>
        editing?.category === 'formation' && editing.mode === 'edit' && editing.item?.id === id;
    const isAddingNew = editing?.category === 'formation' && editing.mode === 'add';

    return (
        <section className="cv-formations cv-selectable">
            <h2>Formations et diplômes</h2>
            <ul>
                {formations.filter(formation => !isHidden(formation.id, hiddenFormationIds)).map(formation => (
                    <Fragment key={`form ${formation.id}`}>
                    <li className="cv-formation hover-reveal">
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
                    {isEditingThis(formation.id) && (
                        <li className="cv-formation-edit-slot">
                            <EditShell category="formation" mode="edit" itemId={formation.id} onClose={onCloseEdit} />
                        </li>
                    )}
                    </Fragment>
                ))}
                {isAddingNew && (
                    <li className="cv-formation cv-formation--new">
                        <div className="cv-formation__content">
                            <h3 className="cv-formation__title">Nouvelle formation</h3>
                        </div>
                        <EditShell category="formation" mode="add" onClose={onCloseEdit} />
                    </li>
                )}
            </ul>
        </section>
    );
}
