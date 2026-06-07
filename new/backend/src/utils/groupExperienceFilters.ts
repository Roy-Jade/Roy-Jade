type ExperienceFilter = { domain: string, type: "detail" | "summary" }
type GroupedExperienceFilter = { domains: string[], type: "detail" | "summary" }

export const groupExperienceFilters = (filters: ExperienceFilter[]): GroupedExperienceFilter[] => {

    const domainTypeMap = new Map<string, "detail" | "summary">();
    for (const filter of filters) {
        if (domainTypeMap.get(filter.domain) === "detail") continue;
        domainTypeMap.set(filter.domain, filter.type);
    }

    const groups = new Map<"detail" | "summary", string[]>();
    for (const [domain, type] of domainTypeMap) {
        if (!groups.has(type)) groups.set(type, []);
        groups.get(type)!.push(domain);
    }

    return Array.from(groups, ([type, domains]) => ({ domains, type }));
}
