import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFilters } from '../../../../api/cvApi';
// import './CvFilters.scss';
import type { FiltersData } from '../../../../types/FiltersData';
import type { SetURLSearchParams } from '../../../../types/SetURLSearchParams';

interface Props {
    searchParams: URLSearchParams;
    setSearchParams: SetURLSearchParams;
}

export default function CvFilters({ searchParams, setSearchParams }: Props) {
    const { data: filtersData, isLoading, isError } = useQuery<FiltersData>({
        queryKey: ['filters'],
        queryFn: getFilters,
        staleTime: Infinity,
    });

    useEffect(() => {
        if (!filtersData) return;

        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            let isChanged = false;

            const context = prev.get('context');
            if (!context || !filtersData.context.includes(context)) {
                next.set('context', filtersData.context[0]);
                isChanged = true;
            }

            const level = prev.get('level');
            if (!level || !filtersData.level.includes(level)) {
                next.set('level', filtersData.level[0]);
                isChanged = true;
            }

            if (prev.getAll('category').length === 0) {
                filtersData.category.forEach(cat => next.append('category', cat));
                isChanged = true;
            }

            if (prev.getAll('experienceDomain').length === 0) {
                filtersData.domain.forEach(d => next.append('experienceDomain', d.slug));
                isChanged = true;
            }

            if (prev.getAll('formationDomain').length === 0) {
                filtersData.domain.forEach(d => next.append('formationDomain', d.slug));
                isChanged = true;
            }

            return isChanged ? next : prev;
        }, { replace: true });
    }, [filtersData, setSearchParams]);

    if (isLoading) return <aside className="cv-filters"><p>Chargement des filtres…</p></aside>;
    if (isError || !filtersData) return <aside className="cv-filters"><p>Erreur lors du chargement des filtres.</p></aside>;

    const currentContext = searchParams.get('context') ?? filtersData.context[0];
    const currentLevel = searchParams.get('level') ?? filtersData.level[0];
    const currentCategories = searchParams.getAll('category');
    const currentExperienceDomains = searchParams.getAll('experienceDomain');
    const currentFormationDomains = searchParams.getAll('formationDomain');

    const setContext = (value: string) =>
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('context', value);
            return next;
        }, { replace: true });

    const setLevel = (value: string) =>
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('level', value);
            return next;
        }, { replace: true });

    const toggleCategory = (category: string) =>
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            const current = prev.getAll('category');
            next.delete('category');
            (current.includes(category)
                ? current.filter(c => c !== category)
                : [...current, category]
            ).forEach(c => next.append('category', c));
            return next;
        }, { replace: true });

    const toggleExperienceDomain = (slug: string) =>
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            const current = prev.getAll('experienceDomain');
            next.delete('experienceDomain');
            (current.includes(slug)
                ? current.filter(d => d !== slug)
                : [...current, slug]
            ).forEach(d => next.append('experienceDomain', d));
            return next;
        }, { replace: true });

    const toggleFormationDomain = (slug: string) =>
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            const current = prev.getAll('formationDomain');
            next.delete('formationDomain');
            (current.includes(slug)
                ? current.filter(d => d !== slug)
                : [...current, slug]
            ).forEach(d => next.append('formationDomain', d));
            return next;
        }, { replace: true });

    return (
        <aside className="cv-filters">
            <fieldset>
                <legend>Contexte</legend>
                {filtersData.context.map(ctx => (
                    <label key={ctx}>
                        <input
                            type="radio"
                            name="context"
                            value={ctx}
                            checked={currentContext === ctx}
                            onChange={() => setContext(ctx)}
                        />
                        {ctx}
                    </label>
                ))}
            </fieldset>

            <fieldset>
                <legend>Niveau minimum</legend>
                <select value={currentLevel} onChange={e => setLevel(e.target.value)}>
                    {filtersData.level.map(lvl => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                </select>
            </fieldset>

            <fieldset>
                <legend>Catégories de compétences</legend>
                {filtersData.category.map(cat => (
                    <label key={cat}>
                        <input
                            type="checkbox"
                            value={cat}
                            checked={currentCategories.length === 0 || currentCategories.includes(cat)}
                            onChange={() => toggleCategory(cat)}
                        />
                        {cat}
                    </label>
                ))}
            </fieldset>

            <fieldset>
                <legend>Domaines d'expérience</legend>
                {filtersData.domain.map(domain => (
                    <label key={domain.slug}>
                        <input
                            type="checkbox"
                            value={domain.slug}
                            checked={currentExperienceDomains.length === 0 || currentExperienceDomains.includes(domain.slug)}
                            onChange={() => toggleExperienceDomain(domain.slug)}
                        />
                        {domain.label}
                    </label>
                ))}
            </fieldset>

            <fieldset>
                <legend>Domaines de formation</legend>
                {filtersData.domain.map(domain => (
                    <label key={domain.slug}>
                        <input
                            type="checkbox"
                            value={domain.slug}
                            checked={currentFormationDomains.length === 0 || currentFormationDomains.includes(domain.slug)}
                            onChange={() => toggleFormationDomain(domain.slug)}
                        />
                        {domain.label}
                    </label>
                ))}
            </fieldset>

        </aside>
    );
}
