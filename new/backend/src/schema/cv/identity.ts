import {z} from "zod";

const IdentitySchema = z.object({
    id: z.number(),
    firstname: z.string(),
    lastname: z.string(),
    email: z.string(),
    telephone: z.string(),
    github_link: z.string(),
    gitlab_link: z.string(),
    linkedin_link: z.string(),
});

export type Identity = z.infer<typeof IdentitySchema>