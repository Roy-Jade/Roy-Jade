import type { Profile } from '../../../types/Profile';
import type { Hardskill } from '../../../types/Hardskill';
import type { Language } from '../../../types/Language';
import type { Hobby } from '../../../types/Hobby';
import type { ExperienceItem } from '../../../types/Experience';
import type { FormationItem } from '../../../types/Formation';

export type EditPreview =
    | { category: 'profile'; data: Profile }
    | { category: 'hardskill'; data: Hardskill }
    | { category: 'language'; data: Language }
    | { category: 'hobby'; data: Hobby }
    | { category: 'experience'; data: ExperienceItem }
    | { category: 'formation'; data: FormationItem };
