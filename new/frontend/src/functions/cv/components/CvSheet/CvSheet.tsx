import { useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useReactToPrint } from 'react-to-print';
import type { CvFiltersParams } from '../../../../types/searchParams';
import CvHeader from './CvHeader/CvHeader';
import CvPresentation from './CvPresentation/CvPresentation';
import CvAside from './CvAside/CvAside';
import CvExperiences from './CvExperiences/CvExperiences';
import CvFormations from './CvFormations/CvFormations';
import CvFooter from './CvFooter/CvFooter';
// import './CvSheet.scss';
import type { Identity } from '../../../../types/Identity';

interface Props {
    filters: CvFiltersParams;
    identity: Identity | undefined;
}

export default function CvSheet({ filters, identity }: Props) {
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
                                photo={identity?.photo ?? null}
                            />
                            <section className="cv-content">
                                <CvPresentation context={filters.context} />
                                <CvExperiences filters={filters.experienceFilters} />
                                {/* <CvFormations domains={filters.formationDomains} /> */}
                            </section>
                        </main>
                        <CvFooter identity={identity} />
                    </div>
                </TransformComponent>
            </TransformWrapper>
        </>
    );
}
