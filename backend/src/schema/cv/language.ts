import { z } from "zod";

export const LanguageSchema = z.object({
    id: z.number().optional(),
    label: z.string(),
    level: z.string().optional(),
});

export const LanguageKeyList = Object.keys(LanguageSchema.omit({ id: true }).shape);

export type Language = z.infer<typeof LanguageSchema>;
