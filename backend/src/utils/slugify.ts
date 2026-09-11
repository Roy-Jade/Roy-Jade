const TITLE_MAX = 60;
const SECONDARY_MAX = 25;
const DATE_MAX = 10;
const LABEL_MAX = 97;

const DIACRITICS_REGEX = /[\u0300-\u036f]/g;

function toSlugSegment(text: string, maxLength: number): string {
    return text
        .normalize("NFD")
        .replace(DIACRITICS_REGEX, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, maxLength)
        .replace(/-+$/g, "");
}

interface SlugifyParams {
    label?: string;
    title?: string;
    company?: string;
    date?: string;
}

export function slugify({ label, title, company, date }: SlugifyParams): string {
    if (label !== undefined) {
        return toSlugSegment(label, LABEL_MAX);
    }

    return [
        title !== undefined ? toSlugSegment(title, TITLE_MAX) : undefined,
        company !== undefined ? toSlugSegment(company, SECONDARY_MAX) : undefined,
        date !== undefined ? toSlugSegment(date, DATE_MAX) : undefined,
    ]
        .filter((segment): segment is string => !!segment)
        .join("-");
}
