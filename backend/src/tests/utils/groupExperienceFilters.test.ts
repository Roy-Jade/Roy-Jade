import { describe, it, expect } from 'vitest';
import { groupExperienceFilters } from '../../utils/groupExperienceFilters.js';

describe('groupExperienceFilters', () => {

    it('cas fonctionnel : regroupe les domaines par type', () => {
        const result = groupExperienceFilters([
            { domain: 'tech', type: 'detail' },
            { domain: 'science', type: 'detail' },
            { domain: 'art', type: 'summary' },
        ]);

        expect(result).toEqual([
            { domains: ['tech', 'science'], type: 'detail' },
            { domains: ['art'], type: 'summary' },
        ]);
    });

    it('cas particulier : un domaine demandé en detail et en summary est conservé en detail uniquement', () => {
        const result = groupExperienceFilters([
            { domain: 'tech', type: 'detail' },
            { domain: 'science', type: 'detail' },
            { domain: 'tech', type: 'summary' },
        ]);

        expect(result).toEqual([
            { domains: ['tech', 'science'], type: 'detail' },
        ]);
    });

    it('cas particulier : la priorité au detail est conservée même si le summary arrive en premier', () => {
        const result = groupExperienceFilters([
            { domain: 'tech', type: 'summary' },
            { domain: 'tech', type: 'detail' },
        ]);

        expect(result).toEqual([
            { domains: ['tech'], type: 'detail' },
        ]);
    });

    it('cas limite : tableau vide retourne un tableau vide', () => {
        const result = groupExperienceFilters([]);

        expect(result).toEqual([]);
    });
});
