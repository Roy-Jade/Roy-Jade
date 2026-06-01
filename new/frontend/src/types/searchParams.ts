type ExperienceFilter = { domain: string; type: "detail" | "summary" };

export interface CvFilters {
    context: string;
    experienceFilters: ExperienceFilter[];
    hardskillCategories: string[];
    hardskillLevel: string;
    formationDomains: string[];
}