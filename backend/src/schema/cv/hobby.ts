import { z } from "zod";

export const HobbySchema = z.object({
    id: z.number().optional(),
    label: z.string(),
    supplement: z.string().optional(),
});

export const HobbyKeyList = Object.keys(HobbySchema.omit({ id: true }).shape);

export type Hobby = z.infer<typeof HobbySchema>;
