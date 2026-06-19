import db from "../../config/db.js";
import { ExperienceFilterSchema } from "../../schema/cv/experience.js";
import { AppError } from "../../utils/AppError.js";

export async function fetchFilters() {
    const type = ExperienceFilterSchema.element.shape.type.options;

    const [contextResult, domainResult, categoryResult, levelResult] = await Promise.all([
        db.query(`SELECT DISTINCT context FROM profile`, []),
        db.query(`SELECT slug, label FROM domain`, []),
        db.query(`SELECT DISTINCT category FROM hardskill WHERE category IS NOT NULL`, []),
        db.query(`SELECT DISTINCT level FROM hardskill WHERE level IS NOT NULL`, []),
    ]);

    const context = contextResult.rows.map((row: {context: string}) => row.context);
    const domain = domainResult.rows;
    const category = categoryResult.rows.map((row: {category: string}) => row.category);
    const level = levelResult.rows.map((row: {level: string}) => row.level);

    if (!context.length || !domain.length || !category.length || !level.length) {
        throw new AppError(404, "Aucune donnée trouvée");
    }

    return { type, context, domain, category, level };
}
