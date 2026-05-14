import {z} from "zod";

export const ExperienceSchema = z.object({
    id: z.number().optional(),
    slug: z.string(),
    type: z.enum(["detail", "summary"]),
    title: z.string(),
    company: z.string().optional(),
    location: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    description: z.string().optional(),
});

export const ExperienceKeyList = Object.keys(ExperienceSchema.omit({id: true}).shape)

export type Experience = z.infer<typeof ExperienceSchema>