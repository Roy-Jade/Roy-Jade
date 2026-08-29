import {z} from "zod";

export const IdentitySchema = z.object({
    id: z.number(),
    firstname: z.string(),
    lastname: z.string(),
    email: z.string(),
    telephone: z.string(),
    town: z.string(),
    github_link: z.string(),
    gitlab_link: z.string(),
    linkedin_link: z.string(),
    rqth: z.boolean(),
});

export const IdentityKeyList = Object.keys(IdentitySchema.omit({id: true}).shape)

export type Identity = z.infer<typeof IdentitySchema>