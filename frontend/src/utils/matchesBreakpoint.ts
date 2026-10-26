type Breakpoint = 'md' | 'lg' | 'xl';

// Lit les points de rupture publiés par tokens.scss (--bp-*), pour ne pas dupliquer leurs valeurs en TS.
export function matchesBreakpoint(name: Breakpoint): boolean {
    const value = getComputedStyle(document.documentElement).getPropertyValue(`--bp-${name}`).trim();
    return value !== '' && window.matchMedia(`(min-width: ${value})`).matches;
}
