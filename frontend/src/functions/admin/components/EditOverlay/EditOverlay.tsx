import { useCallback } from 'react';
import type { EditingState } from '../../types/EditingState';
import EditShell from '../EditShell/EditShell';
import './EditOverlay.scss';

interface Props {
    editing: EditingState | null;
    anchorRect: DOMRect | null;
    onClose: () => void;
}

export default function EditOverlay({ editing, anchorRect, onClose }: Props) {
    // ref stable (useCallback, deps []) : ne doit focus qu'au vrai montage du nœud,
    // pas à chaque re-render (sinon vole le focus des champs du formulaire pendant
    // que anchorRect se met à jour en continu au pan/zoom).
    const focusOnMount = useCallback((node: HTMLDivElement | null) => node?.focus(), []);

    if (!editing || !anchorRect) return null;

    return (
        <div
            ref={focusOnMount}
            className="edit-overlay"
            tabIndex={-1}
            style={{ top: anchorRect.bottom, left: anchorRect.left }}
        >
            <EditShell category={editing.category} mode={editing.mode} itemId={editing.item?.id} onClose={onClose} />
        </div>
    );
}
