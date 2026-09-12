import { apiUrl } from "../config/env";

export const cvApi = async (path: string) => {
    const response = await fetch(`${apiUrl}/api/cv/${path}`);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
    };

    const data = await response.json();

    return data.result;
};

export const getIdentity = async () => {
    return cvApi("identity");
};

export const getFilters = async () => {
    return cvApi("filters");
};

export const getProfile = async (context: string) => {
    const params = new URLSearchParams({ context });
    return cvApi(`profile?${params.toString()}`);
};

export const getExperience = async (domains: string[]) => {
    const params = new URLSearchParams({ data: JSON.stringify(domains) });
    return cvApi(`experience?${params.toString()}`);
};

export const getHardskill = async (level: string, categories: string[]) => {
    const params = new URLSearchParams({ level });
    categories.forEach(c => params.append('category', c));
    return cvApi(`hardskill?${params.toString()}`);
};

export const getSoftskill = async () => {
    return cvApi("softskill");
};

export const getAside = async () => {
    return cvApi("aside");
};

export const getFormation = async (domains: string[]) => {
    const params = new URLSearchParams();
    domains.forEach(d => params.append('data', d));
    return cvApi(`formation?${params.toString()}`);
};
