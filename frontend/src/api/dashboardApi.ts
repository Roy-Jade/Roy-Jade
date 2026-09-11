import { privateApi } from "./privateApi";

export interface Task {
    content: string;
    position: number;
}

export interface HardskillRef {
    slug: string;
    label: string;
    level: string | null;
    category: string | null;
    sub_category: string | null;
}

export interface SoftskillRef {
    slug: string;
    label: string;
}

export interface Identity {
    id: number;
    firstname: string;
    lastname: string;
    email: string | null;
    telephone: string | null;
    github_link: string | null;
    gitlab_link: string | null;
    linkedin_link: string | null;
}

export interface Language {
    id: number;
    slug: string;
    label: string;
    level: string | null;
}

export interface Hobby {
    id: number;
    slug: string;
    label: string;
    supplement: string | null;
}

export interface Profile {
    id: number;
    context: string;
    tagline: string | null;
    description: string | null;
}

export interface Domain {
    id: number;
    slug: string;
    label: string;
}

export interface Softskill {
    id: number;
    slug: string;
    label: string;
}

export interface Hardskill {
    id: number;
    slug: string;
    label: string;
    level: string | null;
    category: string | null;
    sub_category: string | null;
}

export interface Experience {
    id: number;
    slug: string;
    type: 'detail' | 'summary';
    title: string;
    company: string | null;
    location: string | null;
    start_date: string | null;
    end_date: string | null;
    description: string | null;
    tasks: Task[];
    softskills: SoftskillRef[];
    hardskills: HardskillRef[];
    domains: Domain[];
}

export interface Formation {
    id: number;
    slug: string;
    title: string;
    institution: string | null;
    location: string | null;
    obtention_date: string | null;
    description: string | null;
    level: string | null;
    tasks: Task[];
    hardskills: HardskillRef[];
    domains: Domain[];
}

export interface DashboardOverview {
    identity: Identity;
    language: Language[];
    hobby: Hobby[];
    profile: Profile[];
    domain: Domain[];
    softskill: Softskill[];
    hardskill: Hardskill[];
    experience: Experience[];
    formation: Formation[];
}

// --- Queries ---

export const getDashboardOverview = async (): Promise<DashboardOverview> => {
    const data = await privateApi("/api/cv/dashboard");
    return data.result;
};

// --- Mutations ---

export const patchIdentity = async (data: Partial<Omit<Identity, 'id'>>): Promise<Identity> => {
    const response = await privateApi('/api/cv/dashboard/identity', {
        method: 'PATCH',
        body: JSON.stringify({ data }),
    });
    return response.result;
};

export const postLanguage = async (data: Omit<Language, 'id' | 'slug'>): Promise<Language> => {
    const response = await privateApi('/api/cv/dashboard/language', {
        method: 'POST',
        body: JSON.stringify({ data }),
    });
    return response.result;
};

export const patchLanguage = async (id: number, data: Partial<Omit<Language, 'id' | 'slug'>>): Promise<Language> => {
    const response = await privateApi(`/api/cv/dashboard/language/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ data }),
    });
    return response.result;
};

export const postHobby = async (data: Omit<Hobby, 'id' | 'slug'>): Promise<Hobby> => {
    const response = await privateApi('/api/cv/dashboard/hobby', {
        method: 'POST',
        body: JSON.stringify({ data }),
    });
    return response.result;
};

export const patchHobby = async (id: number, data: Partial<Omit<Hobby, 'id' | 'slug'>>): Promise<Hobby> => {
    const response = await privateApi(`/api/cv/dashboard/hobby/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ data }),
    });
    return response.result;
};

export const postSoftskill = async (data: Omit<Softskill, 'id' | 'slug'>): Promise<Softskill> => {
    const response = await privateApi('/api/cv/dashboard/softskill', {
        method: 'POST',
        body: JSON.stringify({ data }),
    });
    return response.result;
};

export const patchSoftskill = async (id: number, data: Partial<Omit<Softskill, 'id' | 'slug'>>): Promise<Softskill> => {
    const response = await privateApi(`/api/cv/dashboard/softskill/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ data }),
    });
    return response.result;
};

export const postHardskill = async (data: Omit<Hardskill, 'id' | 'slug'>): Promise<Hardskill> => {
    const response = await privateApi('/api/cv/dashboard/hardskill', {
        method: 'POST',
        body: JSON.stringify({ data }),
    });
    return response.result;
};

export const patchHardskill = async (id: number, data: Partial<Omit<Hardskill, 'id' | 'slug'>>): Promise<Hardskill> => {
    const response = await privateApi(`/api/cv/dashboard/hardskill/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ data }),
    });
    return response.result;
};

export interface ExperienceInput {
    type: 'detail' | 'summary';
    title: string;
    company?: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
}

export const postExperience = async (payload: {
    data: ExperienceInput;
    domain: number[];
    tasks: string[];
    hardskill: number[];
    softskill: number[];
}): Promise<Experience> => {
    const response = await privateApi('/api/cv/dashboard/experience', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return response.result;
};

export const patchExperience = async (id: number, payload: {
    experienceData?: Partial<ExperienceInput>;
    domainData?: number[];
    hardskillData?: number[];
    softskillData?: number[];
    taskData?: string[];
}): Promise<Experience> => {
    const response = await privateApi(`/api/cv/dashboard/experience/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
    return response.result;
};

export const postDomain = async (data: Omit<Domain, 'id' | 'slug'>): Promise<Domain> => {
    const response = await privateApi('/api/cv/dashboard/domain', {
        method: 'POST',
        body: JSON.stringify({ data }),
    });
    return response.result;
};

export const patchDomain = async (id: number, data: Partial<Omit<Domain, 'id' | 'slug'>>): Promise<Domain> => {
    const response = await privateApi(`/api/cv/dashboard/domain/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ data }),
    });
    return response.result;
};

export const postProfile = async (data: Omit<Profile, 'id'>): Promise<Profile> => {
    const response = await privateApi('/api/cv/dashboard/profile', {
        method: 'POST',
        body: JSON.stringify({ data }),
    });
    return response.result;
};

export const patchProfile = async (id: number, data: Partial<Omit<Profile, 'id'>>): Promise<Profile> => {
    const response = await privateApi(`/api/cv/dashboard/profile/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ data }),
    });
    return response.result;
};

export interface FormationInput {
    title: string;
    institution?: string;
    location?: string;
    obtention_date?: string;
    description?: string;
    level?: string;
}

export const postFormation = async (payload: {
    data: FormationInput;
    domain: number[];
    tasks: string[];
    hardskill: number[];
}): Promise<Formation> => {
    const response = await privateApi('/api/cv/dashboard/formation', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return response.result;
};

export const patchFormation = async (id: number, payload: {
    formationData?: Partial<FormationInput>;
    domainData?: number[];
    hardskillData?: number[];
    taskData?: string[];
}): Promise<Formation> => {
    const response = await privateApi(`/api/cv/dashboard/formation/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
    return response.result;
};
