export type ExperienceItem = {
    id: number;
    slug: string;
    type: 'detail' | 'summary';
    title: string;
    company: string | null;
    location: string | null;
    start_date: string | null;
    end_date: string | null;
    description: string | null;
    tasks: { content: string; position: number }[];
    softskills: string[];
    hardskills: string[];
    domains: string[];
};
