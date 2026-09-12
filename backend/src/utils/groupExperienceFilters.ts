type ExperienceFilter = { domain: string, type: "detail" | "summary" }
type GroupedExperienceFilter = { domains: string[], type: "detail" | "summary" }

export const groupExperienceFilters = (filters: ExperienceFilter[]): GroupedExperienceFilter[] => {

    const domainsByType = new Map<"detail" | "summary", string[]>();
    for (const filter of filters) {
        if (!domainsByType.has(filter.type)) domainsByType.set(filter.type, []);
        const domains = domainsByType.get(filter.type)!;
        if (!domains.includes(filter.domain)) domains.push(filter.domain);
    }

    return Array.from(domainsByType, ([type, domains]) => ({ domains, type }));
}
