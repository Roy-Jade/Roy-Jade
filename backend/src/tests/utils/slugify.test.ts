import { describe, it, expect } from 'vitest';
import { slugify } from '../../utils/slugify.js';

describe('slugify', () => {

    it('supprime les accents et met en minuscule', () => {
        expect(slugify({ label: 'Développeur Full-Stack' })).toBe('developpeur-full-stack');
    });

    it('remplace les caractères spéciaux par un tiret et fusionne les tirets consécutifs', () => {
        expect(slugify({ label: "Développeur & Intégrateur Web" })).toBe('developpeur-integrateur-web');
    });

    it('retire les tirets de tête et de fin', () => {
        expect(slugify({ label: '  Café !!' })).toBe('cafe');
    });

    it('label seul : tronque à 97 caractères', () => {
        const long = 'a'.repeat(120);
        expect(slugify({ label: long })).toBe('a'.repeat(97));
    });

    it('agrège titre + entreprise + date avec un tiret entre chaque segment', () => {
        expect(slugify({ title: 'Développeur Fullstack', company: 'Les Tritons', date: '2027' }))
            .toBe('developpeur-fullstack-les-tritons-2027');
    });

    it('omet le segment et son séparateur quand un champ optionnel est absent', () => {
        expect(slugify({ title: 'Développeur Fullstack', date: '2027' }))
            .toBe('developpeur-fullstack-2027');
    });

    it('tronque chaque segment à son budget dédié (titre 60 / entreprise 25 / date 10)', () => {
        const title = 'x'.repeat(80);
        const company = 'y'.repeat(40);
        const date = '1'.repeat(20);
        expect(slugify({ title, company, date })).toBe(
            `${'x'.repeat(60)}-${'y'.repeat(25)}-${'1'.repeat(10)}`
        );
    });
});
