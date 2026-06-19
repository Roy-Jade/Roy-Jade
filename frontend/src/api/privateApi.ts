import { apiUrl } from "../config/env";

export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

export function isApiError(error: unknown): error is ApiError {
    return error instanceof Error && error.name === 'ApiError' && 'status' in error;
}

export const privateApi = async (path: string, options: RequestInit = {}) => {
    const isWriteMethod = options.method && options.method !== 'GET' && options.method !== 'HEAD';
    const response = await fetch(`${apiUrl}${path}`, {
        ...options,
        credentials: "include",
        headers: {
            ...(isWriteMethod ? { "Content-Type": "application/json" } : {}),
            ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new ApiError(response.status, data.message);
    }

    return data;
};
