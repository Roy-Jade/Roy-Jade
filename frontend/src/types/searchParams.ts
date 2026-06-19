export type ExperienceFilter = { domain: string; type: "detail" | "summary" };

export interface CvFiltersParams {
    context: string;
    experienceFilters: ExperienceFilter[];
    hardskillCategories: string[];
    hardskillLevel: string;
    formationDomains: string[];
    maxExperiences: number;
    maxFormations: number;
}