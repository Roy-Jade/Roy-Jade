import { useCallback, useEffect, useState } from 'react';

interface Options {
    // Une fonction est évaluée une seule fois, au premier rendu (initialiseur paresseux de useState).
    initialOpen?: boolean | (() => boolean);
    // Fourni : Échap ferme l'élément tant qu'il est ouvert, puis ce rappel est appelé
    // (typiquement pour rendre le focus au bouton déclencheur, que l'appelant possède).
    onEscape?: () => void;
}

export function useDisclosure({ initialOpen = false, onEscape }: Options = {}) {
    const [isOpen, setIsOpen] = useState(initialOpen);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen(current => !current), []);

    useEffect(() => {
        if (!isOpen || !onEscape) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key !== 'Escape') return;
            setIsOpen(false);
            onEscape?.();
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onEscape]);

    return { isOpen, open, close, toggle };
}
