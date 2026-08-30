import { useCallback, useEffect, useRef } from 'react';

export function useFocusRegistry() {
    const refs = useRef(new Map<string, HTMLElement>());
    const pendingChain = useRef<string[] | null>(null);

    const register = useCallback((key: string) => (el: HTMLElement | null) => {
        if (el) refs.current.set(key, el);
        else refs.current.delete(key);
    }, []);

    const requestFocus = useCallback((chain: string[]) => {
        pendingChain.current = chain;
    }, []);

    useEffect(() => {
        if (!pendingChain.current) return;
        const target = pendingChain.current.find(key => refs.current.has(key));
        pendingChain.current = null;
        if (target) refs.current.get(target)?.focus();
    });

    return { register, requestFocus };
}
