export const DATE_REGEX = /^\d{1,2}\/\d{1,2}\/\d{4}$|^\d{1,2}\/\d{4}$|^\d{4}$/;

export function normalizeDate(raw: string): string {
    const parts = raw.split('/');
    return parts.map((part, i) => i < parts.length - 1 ? part.padStart(2, '0') : part).join('/');
}
