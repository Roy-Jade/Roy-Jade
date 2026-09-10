export function formatDisplayDate(date: string | null): string | null {
    if (!date) return date;
    return date.split('/').slice(-2).join('/');
}
