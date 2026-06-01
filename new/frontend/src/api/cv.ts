import { apiUrl } from "../config/env"

export const cvApi = async (path:string) => {
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