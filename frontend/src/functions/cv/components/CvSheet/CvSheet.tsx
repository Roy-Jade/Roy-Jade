import { useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useReactToPrint } from 'react-to-print';
import type { CvFiltersParams, HiddenIdField } from '../../../../types/searchParams';
import CvHeader from './CvHeader/CvHeader';
import CvPresentation from './CvPresentation/CvPresentation';
import CvAside from './CvAside/CvAside';
import CvExperiences from './CvExperiences/CvExperiences';
import CvFormations from './CvFormations/CvFormations';
import CvFooter from './CvFooter/CvFooter';
import './variables.css';
import './templatesCSS/default.scss';
import type { Identity } from '../../../../types/Identity';

interface Props {
    filters: CvFiltersParams;
    identity: Identity | undefined;
    toggleHidden: (key: HiddenIdField, id: number) => void;
}

export default function CvSheet({ filters, identity, toggleHidden }: Props) {
    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({ contentRef: printRef });

    return (
        <>
            <button onClick={() => handlePrint()}>Télécharger PDF</button>
            <TransformWrapper>
                <TransformComponent>
                    <div ref={printRef} className="cv-a4">
                        <CvHeader identity={identity} context={filters.context} />
                        <main className="cv-main">
                            <CvAside
                                level={filters.hardskillLevel}
                                categories={filters.hardskillCategories}
                                hiddenHardskillIds={filters.hiddenHardskillIds}
                                toggleHidden={toggleHidden}
                            />
                            <section className="cv-content">
                                <CvPresentation context={filters.context} />
                                <CvExperiences
                                    filters={filters.experienceFilters}
                                    hiddenExperienceIds={filters.hiddenExperienceIds}
                                    hiddenExperienceDescriptionIds={filters.hiddenExperienceDescriptionIds}
                                    hiddenExperienceTaskIds={filters.hiddenExperienceTaskIds}
                                    hiddenExperienceHardskillIds={filters.hiddenExperienceHardskillIds}
                                    hiddenExperienceSoftskillIds={filters.hiddenExperienceSoftskillIds}
                                    toggleHidden={toggleHidden}
                                />
                                <CvFormations
                                    domains={filters.formationDomains}
                                    hiddenFormationIds={filters.hiddenFormationIds}
                                    hiddenFormationDescriptionIds={filters.hiddenFormationDescriptionIds}
                                    hiddenFormationTaskIds={filters.hiddenFormationTaskIds}
                                    hiddenFormationHardskillIds={filters.hiddenFormationHardskillIds}
                                    toggleHidden={toggleHidden}
                                />
                            </section>
                        </main>
                        <CvFooter identity={identity} />
                    </div>
                </TransformComponent>
            </TransformWrapper>
        </>
    );
}
