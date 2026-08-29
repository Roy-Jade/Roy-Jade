export function toggleId(params: URLSearchParams, key: string, id: number): URLSearchParams {
    const next = new URLSearchParams(params);
    const current = next.getAll(key).map(Number);
    next.delete(key);
    const updated = current.includes(id)
        ? current.filter(existingId => existingId !== id)
        : [...current, id];
    updated.forEach(value => next.append(key, String(value)));
    return next;
}
