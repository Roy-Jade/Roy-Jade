import {z} from "zod";

export const FormationSchema = z.object({
    id: z.number().optional(),
    slug: z.string(),
    title: z.string(),
    institution: z.string().optional(),
    location: z.string().optional(),
    obtention_date: z.string().optional(),
    description: z.string().optional(),
    level: z.string().optional(),
});

export const FormationKeyList = Object.keys(FormationSchema.omit({id: true}).shape)

export type Formation = z.infer<typeof FormationSchema>