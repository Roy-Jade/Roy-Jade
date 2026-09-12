export type HiddenIdField =
    | 'hiddenHardskillIds'
    | 'hiddenExperienceIds'
    | 'hiddenExperienceDescriptionIds'
    | 'hiddenExperienceTaskIds'
    | 'hiddenExperienceHardskillIds'
    | 'hiddenExperienceSoftskillIds'
    | 'hiddenFormationIds'
    | 'hiddenFormationDescriptionIds'
    | 'hiddenFormationTaskIds'
    | 'hiddenFormationHardskillIds';

export interface CvFiltersParams {
    context: string;
    experienceDomains: string[];
    hardskillCategories: string[];
    hardskillLevel: string;
    formationDomains: string[];
    hiddenHardskillIds: number[];
    hiddenExperienceIds: number[];
    hiddenExperienceDescriptionIds: number[];
    hiddenExperienceTaskIds: number[];
    hiddenExperienceHardskillIds: number[];
    hiddenExperienceSoftskillIds: number[];
    hiddenFormationIds: number[];
    hiddenFormationDescriptionIds: number[];
    hiddenFormationTaskIds: number[];
    hiddenFormationHardskillIds: number[];
}