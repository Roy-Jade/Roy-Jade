import { useCallback, useLayoutEffect, useState, type RefObject } from 'react';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';

export function useEditAnchor(transformRef: RefObject<ReactZoomPanPinchRef | null>) {
    const [anchorNode, setAnchorNode] = useState<HTMLElement | null>(null);
    const [rect, setRect] = useState<DOMRect | null>(null);

    const measure = useCallback(() => {
        setRect(anchorNode ? anchorNode.getBoundingClientRect() : null);
    }, [anchorNode]);

    // useLayoutEffect (pas useEffect) : la mesure doit se faire avant la peinture du
    // navigateur, sinon la coquille reste invisible (rect à null) jusqu'au prochain
    // évènement de pan/zoom qui force un remesurage.
    useLayoutEffect(() => {
        measure();
    }, [measure]);

    useLayoutEffect(() => {
        if (!anchorNode) return;
        anchorNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [anchorNode]);

    useLayoutEffect(() => transformRef.current?.instance.onChange(measure), [transformRef, measure]);

    useLayoutEffect(() => {
        if (!anchorNode) return;
        const observer = new ResizeObserver(measure);
        observer.observe(anchorNode);
        window.addEventListener('resize', measure);
        // capture:true pour intercepter le scroll de n'importe quel conteneur ancêtre
        // (la coquille est en position:fixed, donc sensible à TOUT scroll de la page,
        // pas seulement au pan/zoom interne du CV).
        window.addEventListener('scroll', measure, true);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', measure);
            window.removeEventListener('scroll', measure, true);
        };
    }, [anchorNode, measure]);

    return { rect, setAnchor: setAnchorNode };
}
