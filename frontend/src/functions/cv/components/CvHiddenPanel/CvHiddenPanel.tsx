import { useMemo, useState } from 'react';
import type { CvFiltersParams, HiddenIdField } from '../../../../types/searchParams';
import { useExperienceData } from '../../hooks/useExperienceData';
import { useFormationData } from '../../hooks/useFormationData';
import { useHardskillData } from '../../hooks/useHardskillData';
import { useFocusRegistry } from '../../hooks/useFocusRegistry';
import {
    ALL_HIDDEN_FIELDS,
    BUCKET_FIELDS,
    buildExperienceGroups,
    buildFormationGroups,
    buildHardskillEntries,
} from '../../utils/hiddenGroups';
import CvHiddenBucket from './CvHiddenBucket/CvHiddenBucket';
import CvHiddenEntryList from './CvHiddenEntryList/CvHiddenEntryList';

interface Props {
    filters: CvFiltersParams;
    toggleHidden: (key: HiddenIdField, id: number) => void;
    clearHidden: (keys: HiddenIdField[]) => void;
}

export default function CvHiddenPanel({ filters, toggleHidden, clearHidden }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const { register, requestFocus } = useFocusRegistry();

    const { data: experiences = [] } = useExperienceData(filters.experienceFilters);
    const { data: formations = [] } = useFormationData(filters.formationDomains);
    const { data: hardskills = [] } = useHardskillData(filters.hardskillLevel, filters.hardskillCategories);

    const competenceEntries = useMemo(
        () => buildHardskillEntries(hardskills, filters.hiddenHardskillIds),
        [hardskills, filters.hiddenHardskillIds]
    );

    const experienceGroups = useMemo(
        () => buildExperienceGroups(experiences, {
            ids: filters.hiddenExperienceIds,
            description: filters.hiddenExperienceDescriptionIds,
            task: filters.hiddenExperienceTaskIds,
            hardskill: filters.hiddenExperienceHardskillIds,
            softskill: filters.hiddenExperienceSoftskillIds,
        }),
        [
            experiences,
            filters.hiddenExperienceIds,
            filters.hiddenExperienceDescriptionIds,
            filters.hiddenExperienceTaskIds,
            filters.hiddenExperienceHardskillIds,
            filters.hiddenExperienceSoftskillIds,
        ]
    );

    const formationGroups = useMemo(
        () => buildFormationGroups(formations, {
            ids: filters.hiddenFormationIds,
            description: filters.hiddenFormationDescriptionIds,
            task: filters.hiddenFormationTaskIds,
            hardskill: filters.hiddenFormationHardskillIds,
        }),
        [
            formations,
            filters.hiddenFormationIds,
            filters.hiddenFormationDescriptionIds,
            filters.hiddenFormationTaskIds,
            filters.hiddenFormationHardskillIds,
        ]
    );

    const hasHidden = competenceEntries.length > 0 || experienceGroups.length > 0 || formationGroups.length > 0;

    return (
        <aside className="cv-hidden-panel">
            <button
                type="button"
                ref={register('panel-toggle')}
                aria-disabled={!hasHidden}
                aria-expanded={isOpen}
                aria-describedby={!hasHidden ? 'cv-hidden-panel-empty-hint' : undefined}
                onClick={() => { if (hasHidden) setIsOpen(open => !open); }}
            >
                Éléments masqués
            </button>
            <span id="cv-hidden-panel-empty-hint" className="visually-hidden">
                Aucun élément masqué à réafficher
            </span>

            {isOpen && hasHidden && (
                <div className="cv-hidden-panel__content">
                    <button
                        type="button"
                        onClick={() => {
                            requestFocus(['panel-toggle']);
                            clearHidden(ALL_HIDDEN_FIELDS);
                        }}
                    >
                        Tout réafficher
                    </button>

                    {competenceEntries.length > 0 && (
                        <section className="cv-hidden-bucket">
                            <div className="cv-hidden-bucket__header" ref={register('bucket-competence')} tabIndex={-1}>
                                <h3>Compétences</h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        requestFocus(['bucket-competence', 'panel-toggle']);
                                        clearHidden(BUCKET_FIELDS.competence);
                                    }}
                                >
                                    Tout réafficher
                                </button>
                            </div>
                            <CvHiddenEntryList
                                entries={competenceEntries}
                                onShow={entry => {
                                    requestFocus(['bucket-competence', 'panel-toggle']);
                                    toggleHidden(entry.toggleKey, entry.id);
                                }}
                            />
                        </section>
                    )}

                    <CvHiddenBucket
                        bucketKey="bucket-experience"
                        title="Expériences"
                        itemGroups={experienceGroups}
                        fields={BUCKET_FIELDS.experience}
                        toggleHidden={toggleHidden}
                        clearHidden={clearHidden}
                        register={register}
                        requestFocus={requestFocus}
                    />

                    <CvHiddenBucket
                        bucketKey="bucket-formation"
                        title="Formations"
                        itemGroups={formationGroups}
                        fields={BUCKET_FIELDS.formation}
                        toggleHidden={toggleHidden}
                        clearHidden={clearHidden}
                        register={register}
                        requestFocus={requestFocus}
                    />
                </div>
            )}
        </aside>
    );
}
