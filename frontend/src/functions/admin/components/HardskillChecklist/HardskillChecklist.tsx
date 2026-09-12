import { useState } from 'react';
import { normalizeForSearch } from '../../../../utils/normalizeForSearch';
import type { Hardskill } from '../../../../types/Hardskill';

interface Props {
    hardskills: Hardskill[];
    checkedIds: number[];
    onToggle: (id: number) => void;
}

const UNCATEGORIZED = 'Sans catégorie';

function groupByCategory(hardskills: Hardskill[]): Map<string, Map<string, Hardskill[]>> {
    const categories = new Map<string, Map<string, Hardskill[]>>();
    for (const hardskill of hardskills) {
        const category = hardskill.category || UNCATEGORIZED;
        const subCategory = hardskill.sub_category || UNCATEGORIZED;
        if (!categories.has(category)) categories.set(category, new Map());
        const subCategories = categories.get(category)!;
        if (!subCategories.has(subCategory)) subCategories.set(subCategory, []);
        subCategories.get(subCategory)!.push(hardskill);
    }
    return categories;
}

export default function HardskillChecklist({ hardskills, checkedIds, onToggle }: Props) {
    const [search, setSearch] = useState('');

    const normalizedSearch = normalizeForSearch(search.trim());
    const filtered = normalizedSearch
        ? hardskills.filter(h => normalizeForSearch(h.label).includes(normalizedSearch))
        : hardskills;

    const categories = groupByCategory(filtered);
    const sortedCategories = Array.from(categories.keys()).sort((a, b) => a.localeCompare(b, 'fr'));

    return (
        <fieldset>
            <legend>Hard skills</legend>
            <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un hard skill…"
                aria-label="Rechercher un hard skill"
            />
            {sortedCategories.map(category => {
                const subCategories = categories.get(category)!;
                const sortedSubCategories = Array.from(subCategories.keys()).sort((a, b) => a.localeCompare(b, 'fr'));
                return (
                    <fieldset key={category}>
                        <legend>{category}</legend>
                        {sortedSubCategories.map(subCategory => (
                            <fieldset key={subCategory}>
                                <legend>{subCategory}</legend>
                                {subCategories.get(subCategory)!
                                    .slice()
                                    .sort((a, b) => a.label.localeCompare(b.label, 'fr'))
                                    .map(h => (
                                        <label key={h.id}>
                                            <input type="checkbox" checked={checkedIds.includes(h.id)} onChange={() => onToggle(h.id)} />
                                            {h.label}
                                        </label>
                                    ))}
                            </fieldset>
                        ))}
                    </fieldset>
                );
            })}
        </fieldset>
    );
}
