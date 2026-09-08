import type { Profile } from './Profile';

export type FiltersData = {
    type: string[];
    context: string[];
    domain: { id: number; slug: string; label: string }[];
    category: string[];
    level: string[];
    profile: Profile[];
};