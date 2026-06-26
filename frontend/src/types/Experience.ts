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
    softskills: { slug: string, label: string }[];
    hardskills: { slug: string, label: string, level: string, category: string, sub_category: string }[];
    domains: string[];
};
