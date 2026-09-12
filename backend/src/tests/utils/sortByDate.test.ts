import { describe, it, expect } from 'vitest';
import { compareByDateDesc, sortByDateDesc, sortByTypeThenDateDesc } from '../../utils/sortByDate.js';

describe('compareByDateDesc', () => {

    it('une date plus récente passe avant une date plus ancienne', () => {
        expect(compareByDateDesc('2025', '2020')).toBeLessThan(0);
        expect(compareByDateDesc('2020', '2025')).toBeGreaterThan(0);
    });

    it('compare correctement des précisions différentes (jj/mm/aaaa, mm/aaaa, aaaa)', () => {
        expect(compareByDateDesc('12/2020', '2020')).toBeLessThan(0);
        expect(compareByDateDesc('15/06/2020', '06/2020')).toBeLessThan(0);
    });

    it('une précision plus fine mais sur la même période par défaut (jour/mois 01) est considérée égale', () => {
        expect(compareByDateDesc('01/2020', '2020')).toBe(0);
    });

    it('une date absente (poste en cours) passe avant une date renseignée', () => {
        expect(compareByDateDesc(null, '2025')).toBeLessThan(0);
        expect(compareByDateDesc(undefined, '2025')).toBeLessThan(0);
        expect(compareByDateDesc('2025', null)).toBeGreaterThan(0);
    });

    it('deux dates absentes sont égales', () => {
        expect(compareByDateDesc(null, undefined)).toBe(0);
    });
});

describe('sortByDateDesc', () => {

    it('trie du plus récent au plus ancien, poste en cours en premier', () => {
        const items = [
            { id: 1, end_date: '2020' },
            { id: 2, end_date: null },
            { id: 3, end_date: '2023' },
        ];

        expect(sortByDateDesc(items, i => i.end_date).map(i => i.id)).toEqual([2, 3, 1]);
    });

    it('ne modifie pas le tableau d\'origine', () => {
        const items = [{ id: 1, end_date: '2020' }, { id: 2, end_date: '2023' }];
        const original = [...items];

        sortByDateDesc(items, i => i.end_date);

        expect(items).toEqual(original);
    });
});

describe('sortByTypeThenDateDesc', () => {

    it('regroupe toutes les "detail" avant les "summary", chaque groupe trié par date décroissante', () => {
        const items = [
            { id: 1, type: 'summary' as const, end_date: '2024' },
            { id: 2, type: 'detail' as const, end_date: '2020' },
            { id: 3, type: 'detail' as const, end_date: '2023' },
            { id: 4, type: 'summary' as const, end_date: '2022' },
        ];

        expect(sortByTypeThenDateDesc(items, i => i.type, i => i.end_date).map(i => i.id)).toEqual([3, 2, 1, 4]);
    });

    it('un poste en cours (sans date) passe en premier au sein de son groupe de type', () => {
        const items = [
            { id: 1, type: 'detail' as const, end_date: '2023' },
            { id: 2, type: 'detail' as const, end_date: null },
        ];

        expect(sortByTypeThenDateDesc(items, i => i.type, i => i.end_date).map(i => i.id)).toEqual([2, 1]);
    });
});
