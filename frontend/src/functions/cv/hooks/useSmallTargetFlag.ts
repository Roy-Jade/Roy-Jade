import { useCallback, useRef, type RefObject } from 'react';

// Taille de cible minimale du critère WCAG 2.5.8 (niveau AA).
const MIN_TARGET_SIZE_PX = 24;

// Signale sur la feuille (data-small-targets) quand les boutons d'action, mis à l'échelle par le zoom,
// passent sous la taille de cible minimale : le CSS les désactive alors au doigt (pointer: coarse).
// Écrit directement dans le DOM plutôt que dans un état React : appelé à chaque image d'un zoom,
// un état re-rendrait toute la feuille en continu.
export function useSmallTargetFlag(sheetRef: RefObject<HTMLElement | null>) {
    const baseSizeRef = useRef<number | null>(null);

    return useCallback((scale: number) => {
        const sheet = sheetRef.current;
        if (!sheet) return;

        if (baseSizeRef.current === null) {
            const size = parseFloat(getComputedStyle(sheet).getPropertyValue('--hover-action-size'));
            if (Number.isNaN(size)) return;
            baseSizeRef.current = size;
        }

        const isSmall = String(baseSizeRef.current * scale < MIN_TARGET_SIZE_PX);
        if (sheet.dataset.smallTargets !== isSmall) sheet.dataset.smallTargets = isSmall;
    }, [sheetRef]);
}
