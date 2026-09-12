import { useState } from 'react';
import { normalizeForSearch } from '../../../../utils/normalizeForSearch';
import type { Softskill } from '../../../../types/Softskill';

interface Props {
    softskills: Softskill[];
    checkedIds: number[];
    onToggle: (id: number) => void;
}

export default function SoftskillChecklist({ softskills, checkedIds, onToggle }: Props) {
    const [search, setSearch] = useState('');

    const normalizedSearch = normalizeForSearch(search.trim());
    const filtered = (normalizedSearch
        ? softskills.filter(s => normalizeForSearch(s.label).includes(normalizedSearch))
        : softskills
    ).slice().sort((a, b) => a.label.localeCompare(b.label, 'fr'));

    return (
        <fieldset>
            <legend>Soft skills</legend>
            <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un soft skill…"
                aria-label="Rechercher un soft skill"
            />
            {filtered.map(s => (
                <label key={s.id}>
                    <input type="checkbox" checked={checkedIds.includes(s.id)} onChange={() => onToggle(s.id)} />
                    {s.label}
                </label>
            ))}
        </fieldset>
    );
}
