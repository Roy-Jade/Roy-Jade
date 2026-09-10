import { describe, it, expect } from 'vitest';
import { DATE_REGEX, normalizeDate } from '../../utils/normalizeDate.js';

describe('DATE_REGEX', () => {

    it('accepte une année seule', () => {
        expect(DATE_REGEX.test('2020')).toBe(true);
    });

    it('accepte mois/année, avec ou sans zéro de tête', () => {
        expect(DATE_REGEX.test('3/2020')).toBe(true);
        expect(DATE_REGEX.test('03/2020')).toBe(true);
    });

    it('accepte jour/mois/année, avec ou sans zéro de tête', () => {
        expect(DATE_REGEX.test('5/3/2020')).toBe(true);
        expect(DATE_REGEX.test('05/03/2020')).toBe(true);
    });

    it('rejette un jour sans mois', () => {
        expect(DATE_REGEX.test('05//2020')).toBe(false);
    });

    it('rejette une année qui ne fait pas 4 chiffres', () => {
        expect(DATE_REGEX.test('20')).toBe(false);
        expect(DATE_REGEX.test('03/20')).toBe(false);
    });

    it('rejette un format non numérique', () => {
        expect(DATE_REGEX.test('An 1872')).toBe(false);
        expect(DATE_REGEX.test('mars 2020')).toBe(false);
    });
});

describe('normalizeDate', () => {

    it('ajoute un zéro de tête au mois et au jour, laisse l\'année intacte', () => {
        expect(normalizeDate('5/3/2020')).toBe('05/03/2020');
    });

    it('laisse un format déjà à deux chiffres inchangé', () => {
        expect(normalizeDate('05/03/2020')).toBe('05/03/2020');
    });

    it('ajoute un zéro de tête au mois seul (mois/année)', () => {
        expect(normalizeDate('3/2020')).toBe('03/2020');
    });

    it('laisse une année seule inchangée', () => {
        expect(normalizeDate('2020')).toBe('2020');
    });
});
