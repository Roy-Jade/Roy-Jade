export function clearIds(params: URLSearchParams, keys: string[]): URLSearchParams {
    const next = new URLSearchParams(params);
    keys.forEach(key => next.delete(key));
    return next;
}
