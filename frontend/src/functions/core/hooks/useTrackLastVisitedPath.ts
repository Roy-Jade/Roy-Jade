import { useEffect } from 'react';
import { useLocation } from 'react-router';

const LAST_VISITED_PATH_KEY = 'lastVisitedPath';

export function useTrackLastVisitedPath() {
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/login') return;
        try {
            sessionStorage.setItem(LAST_VISITED_PATH_KEY, location.pathname + location.search + location.hash);
        } catch {
            // sessionStorage indisponible (ex. navigation privée) : la redirection après login retombera sur /cv
        }
    }, [location]);
}

export function getLastVisitedPath(): string | null {
    try {
        return sessionStorage.getItem(LAST_VISITED_PATH_KEY);
    } catch {
        return null;
    }
}
