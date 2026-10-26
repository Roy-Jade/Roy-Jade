import { useCallback, useEffect, useMemo } from 'react';
import './CvHiddenPanel.scss';
import type { CvFiltersParams, HiddenIdField } from '../../../../types/searchParams';
import { useExperienceData } from '../../hooks/useExperienceData';
import { useFormationData } from '../../hooks/useFormationData';
import { useHardskillData } from '../../hooks/useHardskillData';
import { useFocusRegistry } from '../../hooks/useFocusRegistry';
import { useDisclosure } from '../../../core/hooks/useDisclosure';
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
    const { register, requestFocus } = useFocusRegistry();
    const returnFocusToToggle = useCallback(() => requestFocus(['panel-toggle']), [requestFocus]);
    const { isOpen, toggle, close } = useDisclosure({ onEscape: returnFocusToToggle });

    const { data: experiences = [] } = useExperienceData(filters.experienceDomains);
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

    // Compté depuis les entrées réellement listées (et non depuis l'URL, qui peut contenir des IDs
    // hors filtres actuels) : le nombre affiché correspond toujours à ce que le panneau montre.
    const countGroupEntries = (groups: typeof experienceGroups) => groups.reduce(
        (total, group) => total + (group.fullyHidden
            ? 1
            : group.subGroups.reduce((sum, subGroup) => sum + subGroup.entries.length, 0)),
        0
    );
    const hiddenCount = competenceEntries.length + countGroupEntries(experienceGroups) + countGroupEntries(formationGroups);

    // Plus rien à réafficher : on referme, sinon le panneau resurgirait tout seul au prochain masquage.
    useEffect(() => {
        if (!hasHidden) close();
    }, [hasHidden, close]);

    return (
        <aside className="cv-hidden-panel" aria-label="Éléments masqués">
            <button
                type="button"
                className="cv-hidden-panel__toggle"
                ref={register('panel-toggle')}
                aria-disabled={!hasHidden}
                aria-expanded={isOpen && hasHidden}
                aria-controls="cv-hidden-panel-content"
                aria-describedby={!hasHidden ? 'cv-hidden-panel-empty-hint' : undefined}
                onClick={() => { if (hasHidden) toggle(); }}
            >
                Éléments masqués
                {hasHidden && <span className="cv-hidden-panel__count">{hiddenCount}</span>}
            </button>
            <span id="cv-hidden-panel-empty-hint" className="visually-hidden">
                Aucun élément masqué à réafficher
            </span>

            {isOpen && hasHidden && (
                <section id="cv-hidden-panel-content" className="cv-hidden-panel__content" aria-labelledby="cv-hidden-panel-title">
                    <header className="cv-hidden-panel__header">
                        <h2 id="cv-hidden-panel-title">Éléments masqués</h2>
                        <button
                            type="button"
                            className="cv-hidden-panel__close"
                            aria-label="Fermer le panneau des éléments masqués"
                            onClick={() => {
                                close();
                                returnFocusToToggle();
                            }}
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                        </button>
                    </header>

                    <button
                        type="button"
                        className="cv-hidden-panel__reset-all"
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
                </section>
            )}
        </aside>
    );
}
