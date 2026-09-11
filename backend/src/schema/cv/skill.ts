import {z} from "zod";

export const SoftskillSchema = z.object({
    id: z.number().optional(),
    label: z.string(),
});

export const SoftskillKeyList = Object.keys(SoftskillSchema.omit({id: true}).shape)

export type Softskill = z.infer<typeof SoftskillSchema>

export const HardskillSchema = z.object({
    id: z.number().optional(),
    label: z.string(),
    level: z.string().optional(),
    category: z.string().optional(),
    sub_category: z.string().optional(),
});

export const HardskillKeyList = Object.keys(HardskillSchema.omit({id: true}).shape)

export type Hardskill = z.infer<typeof HardskillSchema>