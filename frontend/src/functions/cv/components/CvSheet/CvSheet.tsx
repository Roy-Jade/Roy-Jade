import { useRef } from 'react';
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { useReactToPrint } from 'react-to-print';
import type { CvFiltersParams, HiddenIdField } from '../../../../types/searchParams';
import type { DashboardCategory, EditingState } from '../../../admin/types/EditingState';
import type { EditPreview } from '../../../admin/types/EditPreview';
import { useEditAnchor } from '../../../admin/hooks/useEditAnchor';
import EditOverlay from '../../../admin/components/EditOverlay/EditOverlay';
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
    editing: EditingState | null;
    preview: EditPreview | null;
    onCloseEdit: () => void;
    onPreviewChange: (preview: EditPreview) => void;
    onEdit?: (category: DashboardCategory, item?: { id: number }) => void;
    onAdd?: (category: DashboardCategory) => void;
}

export default function CvSheet({ filters, identity, toggleHidden, editing, preview, onCloseEdit, onPreviewChange, onEdit, onAdd }: Props) {
    const printRef = useRef<HTMLDivElement>(null);
    const transformRef = useRef<ReactZoomPanPinchRef | null>(null);
    const handlePrint = useReactToPrint({ contentRef: printRef });
    const { rect: anchorRect, setAnchor } = useEditAnchor(transformRef);

    return (
        <>
            <button onClick={() => handlePrint()}>Télécharger PDF</button>
            {/* .cv-selectable : exclusion JS (ici) ET override CSS (templatesCSS/default.scss)
                nécessaires ensemble — la lib applique son propre user-select:none, indépendant
                de sa logique de pan. panning ET doubleClick ont chacun leur propre `excluded` —
                la lib ne les partage pas, les deux doivent être configurés séparément. */}
            <TransformWrapper
                ref={transformRef}
                panning={{ excluded: ['cv-selectable'] }}
                doubleClick={{ excluded: ['cv-selectable'] }}
            >
                <TransformComponent>
                    <div ref={printRef} className="cv-a4">
                        <CvHeader identity={identity} context={filters.context} />
                        <main className="cv-main">
                            <CvAside
                                level={filters.hardskillLevel}
                                categories={filters.hardskillCategories}
                                hiddenHardskillIds={filters.hiddenHardskillIds}
                                toggleHidden={toggleHidden}
                                editing={editing}
                                preview={preview}
                                setAnchor={setAnchor}
                                onEdit={onEdit}
                                onAdd={onAdd}
                            />
                            <section className="cv-content">
                                <CvPresentation
                                    context={filters.context}
                                    editing={editing}
                                    preview={preview}
                                    setAnchor={setAnchor}
                                    onEdit={onEdit}
                                />
                                <CvExperiences
                                    filters={filters.experienceFilters}
                                    hiddenExperienceIds={filters.hiddenExperienceIds}
                                    hiddenExperienceDescriptionIds={filters.hiddenExperienceDescriptionIds}
                                    hiddenExperienceTaskIds={filters.hiddenExperienceTaskIds}
                                    hiddenExperienceHardskillIds={filters.hiddenExperienceHardskillIds}
                                    hiddenExperienceSoftskillIds={filters.hiddenExperienceSoftskillIds}
                                    toggleHidden={toggleHidden}
                                    editing={editing}
                                    preview={preview}
                                    setAnchor={setAnchor}
                                    onEdit={onEdit}
                                    onAdd={onAdd}
                                />
                                <CvFormations
                                    domains={filters.formationDomains}
                                    hiddenFormationIds={filters.hiddenFormationIds}
                                    hiddenFormationDescriptionIds={filters.hiddenFormationDescriptionIds}
                                    hiddenFormationTaskIds={filters.hiddenFormationTaskIds}
                                    hiddenFormationHardskillIds={filters.hiddenFormationHardskillIds}
                                    toggleHidden={toggleHidden}
                                    editing={editing}
                                    preview={preview}
                                    setAnchor={setAnchor}
                                    onEdit={onEdit}
                                    onAdd={onAdd}
                                />
                            </section>
                        </main>
                        <CvFooter identity={identity} />
                    </div>
                </TransformComponent>
            </TransformWrapper>
            <EditOverlay editing={editing} anchorRect={anchorRect} onClose={onCloseEdit} onPreviewChange={onPreviewChange} />
        </>
    );
}
