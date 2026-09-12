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

    it('cas particulier : un domaine demandé en detail et en summary apparaît dans les deux groupes', () => {
        const result = groupExperienceFilters([
            { domain: 'tech', type: 'detail' },
            { domain: 'science', type: 'detail' },
            { domain: 'tech', type: 'summary' },
        ]);

        expect(result).toEqual([
            { domains: ['tech', 'science'], type: 'detail' },
            { domains: ['tech'], type: 'summary' },
        ]);
    });

    it('cas particulier : l\'ordre d\'apparition des types ne change rien au regroupement par domaine', () => {
        const result = groupExperienceFilters([
            { domain: 'tech', type: 'summary' },
            { domain: 'tech', type: 'detail' },
        ]);

        expect(result).toEqual([
            { domains: ['tech'], type: 'summary' },
            { domains: ['tech'], type: 'detail' },
        ]);
    });

    it('cas particulier : un même domaine demandé deux fois pour le même type n\'est pas dupliqué', () => {
        const result = groupExperienceFilters([
            { domain: 'tech', type: 'detail' },
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
