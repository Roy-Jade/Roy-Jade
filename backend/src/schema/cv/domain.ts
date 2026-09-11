import {z} from "zod";

export const DomainSchema = z.object({
    id: z.number().optional(),
    label: z.string(),
});

export const DomainKeyList = Object.keys(DomainSchema.omit({id: true}).shape)

export type Domain = z.infer<typeof DomainSchema>