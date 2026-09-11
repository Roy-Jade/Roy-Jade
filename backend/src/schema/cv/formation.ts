import {z} from "zod";
import { DATE_REGEX, normalizeDate } from "../../utils/normalizeDate.js";

export const FormationSchema = z.object({
    id: z.number().optional(),
    title: z.string(),
    institution: z.string().optional(),
    location: z.string().optional(),
    obtention_date: z.string().regex(DATE_REGEX, "Format de date invalide (jj/mm/aaaa, mm/aaaa ou aaaa)").transform(normalizeDate).optional(),
    description: z.string().optional(),
    level: z.string().optional(),
});

export const FormationKeyList = Object.keys(FormationSchema.omit({id: true}).shape)

export type Formation = z.infer<typeof FormationSchema>