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
    hardskills: string[];
    domains: string[];
};
