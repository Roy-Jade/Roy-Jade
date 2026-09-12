function parseDateValue(date: string): number {
    const parts = date.split("/").map(Number);
    const [day, month, year] = parts.length === 3
        ? parts
        : parts.length === 2
            ? [1, parts[0], parts[1]]
            : [1, 1, parts[0]];
    return year * 10000 + month * 100 + day;
}

export function compareByDateDesc(a: string | null | undefined, b: string | null | undefined): number {
    if (!a && !b) return 0;
    if (!a) return -1;
    if (!b) return 1;
    return parseDateValue(b) - parseDateValue(a);
}

export function sortByDateDesc<T>(items: T[], getDate: (item: T) => string | null | undefined): T[] {
    return [...items].sort((a, b) => compareByDateDesc(getDate(a), getDate(b)));
}

const TYPE_ORDER = { detail: 0, summary: 1 } as const;

export function sortByTypeThenDateDesc<T>(
    items: T[],
    getType: (item: T) => "detail" | "summary",
    getDate: (item: T) => string | null | undefined
): T[] {
    return [...items].sort((a, b) => {
        const typeDiff = TYPE_ORDER[getType(a)] - TYPE_ORDER[getType(b)];
        return typeDiff !== 0 ? typeDiff : compareByDateDesc(getDate(a), getDate(b));
    });
}
