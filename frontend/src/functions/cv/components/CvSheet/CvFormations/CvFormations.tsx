import type { HiddenIdField } from '../../../../../types/searchParams';
import type { EditingState } from '../../../../admin/types/EditingState';
import type { EditPreview } from '../../../../admin/types/EditPreview';
import { isHidden } from '../../../../../utils/isHidden';
import { useFormationData } from '../../../hooks/useFormationData';
import FormationItem from './FormationItem';
// import './CvFormations.scss';

interface Props {
    domains: string[];
    hiddenFormationIds: number[];
    hiddenFormationDescriptionIds: number[];
    hiddenFormationTaskIds: number[];
    hiddenFormationHardskillIds: number[];
    toggleHidden: (key: HiddenIdField, id: number) => void;
    editing: EditingState | null;
    preview: EditPreview | null;
    setAnchor: (node: HTMLElement | null) => void;
}

export default function CvFormations({
    domains,
    hiddenFormationIds,
    hiddenFormationDescriptionIds,
    hiddenFormationTaskIds,
    hiddenFormationHardskillIds,
    toggleHidden,
    editing,
    preview,
    setAnchor,
}: Props) {
    const { data: formations = [], isLoading, isError } = useFormationData(domains);

    if (isLoading) return <section className="cv-formations cv-selectable"><p>…</p></section>;
    if (isError) return null;

    const isEditingThis = (id: number) =>
        editing?.category === 'formation' && editing.mode === 'edit' && editing.item?.id === id;
    const isAddingNew = editing?.category === 'formation' && editing.mode === 'add';
    const draft = preview?.category === 'formation' ? preview.data : null;

    return (
        <section className="cv-formations cv-selectable">
            <h2>Formations et diplômes</h2>
            <ul>
                {formations.filter(formation => !isHidden(formation.id, hiddenFormationIds)).map(formation => (
                    <FormationItem
                        key={`form ${formation.id}`}
                        formation={isEditingThis(formation.id) && draft ? draft : formation}
                        hiddenFormationDescriptionIds={hiddenFormationDescriptionIds}
                        hiddenFormationTaskIds={hiddenFormationTaskIds}
                        hiddenFormationHardskillIds={hiddenFormationHardskillIds}
                        toggleHidden={toggleHidden}
                        ref={isEditingThis(formation.id) ? setAnchor : undefined}
                    />
                ))}
                {isAddingNew && (
                    draft ? (
                        <FormationItem
                            formation={draft}
                            hiddenFormationDescriptionIds={hiddenFormationDescriptionIds}
                            hiddenFormationTaskIds={hiddenFormationTaskIds}
                            hiddenFormationHardskillIds={hiddenFormationHardskillIds}
                            toggleHidden={toggleHidden}
                            ref={setAnchor}
                        />
                    ) : (
                        <li className="cv-formation cv-formation--new" ref={setAnchor}>
                            <div className="cv-formation__content">
                                <h3 className="cv-formation__title">Nouvelle formation</h3>
                            </div>
                        </li>
                    )
                )}
            </ul>
        </section>
    );
}
