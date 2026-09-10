import {z} from "zod";
import { DATE_REGEX, normalizeDate } from "../../utils/normalizeDate.js";

const DATE_ERROR = "Format de date invalide (jj/mm/aaaa, mm/aaaa ou aaaa)";

export const ExperienceSchema = z.object({
    id: z.number().optional(),
    slug: z.string(),
    type: z.enum(["detail", "summary"]),
    title: z.string(),
    company: z.string().optional(),
    location: z.string().optional(),
    start_date: z.string().regex(DATE_REGEX, DATE_ERROR).transform(normalizeDate).optional(),
    end_date: z.string().regex(DATE_REGEX, DATE_ERROR).transform(normalizeDate).optional(),
    description: z.string().optional(),
});

export const ExperienceKeyList = Object.keys(ExperienceSchema.omit({id: true}).shape)

export type Experience = z.infer<typeof ExperienceSchema>

export const ExperienceFilterSchema = z.array(z.object({
    domain: z.string(),
    type: z.enum(["detail", "summary"])
}))