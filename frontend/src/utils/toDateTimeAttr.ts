const STORED_DATE_REGEX = /^\d{2}\/\d{2}\/\d{4}$|^\d{2}\/\d{4}$|^\d{4}$/;

// Convertit une date stockée (jj/mm/aaaa, mm/aaaa ou aaaa) en valeur d'attribut `dateTime`.
// Tronquée au mois comme formatDisplayDate : le jour n'est pas public, il ne doit pas fuiter
// dans le HTML. Renvoie undefined sur une valeur inattendue : React omet alors l'attribut.
export function toDateTimeAttr(date: string | null): string | undefined {
    if (!date || !STORED_DATE_REGEX.test(date)) return undefined;

    const [monthOrYear, year] = date.split('/').slice(-2);
    if (!year) return monthOrYear;

    const month = Number(monthOrYear);
    if (month < 1 || month > 12) return undefined;

    return `${year}-${monthOrYear}`;
}
