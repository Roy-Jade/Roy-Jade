import {z} from "zod";

const emptyToNull = z.literal("").transform(() => null);

export const IdentitySchema = z.object({
    id: z.number(),
    firstname: z.string(),
    lastname: z.string(),
    email: z.string(),
    telephone: z.string(),
    town: z.string(),
    siret: z.union([emptyToNull, z.string().regex(/^[0-9]{14}$/, "Le SIRET doit comporter 14 chiffres"), z.null()]),
    domiciliation: z.union([emptyToNull, z.string().trim().min(1).max(255), z.null()]),
    github_link: z.string(),
    gitlab_link: z.string(),
    linkedin_link: z.string(),
    rqth: z.boolean(),
});

export const IdentityKeyList = Object.keys(IdentitySchema.omit({id: true}).shape)

export type Identity = z.infer<typeof IdentitySchema>