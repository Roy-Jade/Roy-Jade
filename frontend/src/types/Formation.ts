export type FormationItem = {
    id: number;
    slug: string;
    title: string;
    institution: string | null;
    location: string | null;
    obtention_date: string | null;
    description: string | null;
    level: string | null;
    tasks: { content: string; position: number }[];
    hardskills: { slug: string, label: string, level: string, category: string, sub_category: string }[];
    domains: string[];
};
