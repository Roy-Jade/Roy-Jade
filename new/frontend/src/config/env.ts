function checkEnv(envKey:string, errorLabel:string) {
    const envValue = import.meta.env[envKey]
    if (envValue===undefined) { throw new Error(`${errorLabel} non défini`)};
    return envValue;
};

const apiUrl = checkEnv("VITE_API_URL", "URL de l'API");

export { apiUrl };