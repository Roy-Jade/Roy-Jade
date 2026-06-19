import {z} from "zod";

export const ProfileSchema = z.object({
    id: z.number().optional(),
    context: z.string(),
    tagline: z.string(),
    description: z.string(),
});

export const ProfileKeyList = Object.keys(ProfileSchema.omit({id: true}).shape)

export type Profile = z.infer<typeof ProfileSchema>