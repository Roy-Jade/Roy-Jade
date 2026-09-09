import type { ExperienceFilter, HiddenIdField } from '../../../../../types/searchParams';
import type { DashboardCategory, EditingState } from '../../../../admin/types/EditingState';
import type { EditPreview } from '../../../../admin/types/EditPreview';
import { isHidden } from '../../../../../utils/isHidden';
import { useExperienceData } from '../../../hooks/useExperienceData';
import HoverAction from '../../../../core/components/HoverAction/HoverAction';
import ExperienceItem from './ExperienceItem';

interface Props {
    filters: ExperienceFilter[];
    hiddenExperienceIds: number[];
    hiddenExperienceDescriptionIds: number[];
    hiddenExperienceTaskIds: number[];
    hiddenExperienceHardskillIds: number[];
    hiddenExperienceSoftskillIds: number[];
    toggleHidden: (key: HiddenIdField, id: number) => void;
    editing: EditingState | null;
    preview: EditPreview | null;
    setAnchor: (node: HTMLElement | null) => void;
    onEdit?: (category: DashboardCategory, item?: { id: number }) => void;
    onAdd?: (category: DashboardCategory) => void;
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
    preview,
    setAnchor,
    onEdit,
    onAdd,
}: Props) {
    const { data: experiences = [], isLoading, isError } = useExperienceData(filters);

    if (isLoading) return <section className="cv-experiences cv-selectable"><p>…</p></section>;
    if (isError) return null;

    const isEditingThis = (id: number) =>
        editing?.category === 'experience' && editing.mode === 'edit' && editing.item?.id === id;
    const isAddingNew = editing?.category === 'experience' && editing.mode === 'add';
    const draft = preview?.category === 'experience' ? preview.data : null;

    return (
        <section className="cv-experiences cv-selectable">
            <h2 className="hover-reveal">
                Expériences professionnelles
                {onAdd && (
                    <HoverAction icon={<span>+</span>} label="Ajouter une expérience" onClick={() => onAdd('experience')} />
                )}
            </h2>
            <ul>
                {experiences.filter(exp => !isHidden(exp.id, hiddenExperienceIds)).map(exp => (
                    <ExperienceItem
                        key={`exp ${exp.id}`}
                        exp={isEditingThis(exp.id) && draft ? draft : exp}
                        hiddenExperienceDescriptionIds={hiddenExperienceDescriptionIds}
                        hiddenExperienceTaskIds={hiddenExperienceTaskIds}
                        hiddenExperienceHardskillIds={hiddenExperienceHardskillIds}
                        hiddenExperienceSoftskillIds={hiddenExperienceSoftskillIds}
                        toggleHidden={toggleHidden}
                        onEdit={onEdit ? () => onEdit('experience', { id: exp.id }) : undefined}
                        ref={isEditingThis(exp.id) ? setAnchor : undefined}
                    />
                ))}
                {isAddingNew && (
                    draft ? (
                        <ExperienceItem
                            exp={draft}
                            hiddenExperienceDescriptionIds={hiddenExperienceDescriptionIds}
                            hiddenExperienceTaskIds={hiddenExperienceTaskIds}
                            hiddenExperienceHardskillIds={hiddenExperienceHardskillIds}
                            hiddenExperienceSoftskillIds={hiddenExperienceSoftskillIds}
                            toggleHidden={toggleHidden}
                            ref={setAnchor}
                        />
                    ) : (
                        <li className="cv-experience cv-experience--new" ref={setAnchor}>
                            <div className="cv-experience__content">
                                <h3 className="cv-experience__title">Nouvelle expérience</h3>
                            </div>
                        </li>
                    )
                )}
            </ul>
        </section>
    );
}
