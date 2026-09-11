const SLUG_TABLES = ["domain", "experience", "formation", "hardskill", "softskill", "language", "hobby"] as const;
export type SlugTable = typeof SLUG_TABLES[number];

interface Queryable {
    query: (text: string, params: unknown[]) => Promise<{ rows: unknown[] }>;
}

export async function generateUniqueSlug(
    client: Queryable,
    table: SlugTable,
    baseSlug: string,
    excludeId?: number
): Promise<string> {
    if (!SLUG_TABLES.includes(table)) {
        throw new Error(`Table non autorisée pour la génération de slug : ${table}`);
    }

    let candidate = baseSlug;
    let suffix = 1;

    while (true) {
        const { rows } = excludeId !== undefined
            ? await client.query(`SELECT 1 FROM ${table} WHERE slug = $1 AND id != $2`, [candidate, excludeId])
            : await client.query(`SELECT 1 FROM ${table} WHERE slug = $1`, [candidate]);

        if (rows.length === 0) return candidate;

        suffix += 1;
        candidate = `${baseSlug}-${String(suffix).padStart(2, "0")}`;
    }
}
