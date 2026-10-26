// Coordonnées en longueurs de liaison (1 = une liaison), axe y vers le bas comme en SVG.
// Zigzag à 120° : les atomes se placent sur des multiples de cos 30° (≈ 0.866) et de 0.5.
export interface Atom {
    x: number;
    y: number;
    label?: string;
}

export interface Bond {
    from: number;
    to: number;
    order: 1 | 2 | 3;
}

export interface Molecule {
    name: string;
    atoms: Atom[];
    bonds: Bond[];
}

export const molecules: Molecule[] = [
    {
        name: 'Éthanol',
        atoms: [
            { x: 0, y: 0.5 },
            { x: 0.866, y: 0 },
            { x: 1.732, y: 0.5, label: 'OH' },
        ],
        bonds: [
            { from: 0, to: 1, order: 1 },
            { from: 1, to: 2, order: 1 },
        ],
    },
    {
        name: 'Acide acétylsalicylique (aspirine)',
        atoms: [
            // Groupe acétyle, accroché au cycle par l'oxygène 3.
            { x: 3.464, y: -1 },
            { x: 2.598, y: -0.5 },
            { x: 2.598, y: 0.5, label: 'O' },
            { x: 1.732, y: -1, label: 'O' },
            // Cycle benzénique centré sur (0, 0), parcouru dans le sens horaire depuis l'atome 4.
            { x: 0.866, y: -0.5 },
            { x: 0.866, y: 0.5 },
            { x: 0, y: 1 },
            { x: -0.866, y: 0.5 },
            { x: -0.866, y: -0.5 },
            { x: 0, y: -1 },
            // Acide carboxylique, au-dessus du sommet 9.
            { x: 0, y: -2 },
            { x: -0.866, y: -2.5, label: 'O' },
            { x: 0.866, y: -2.5, label: 'OH' },
        ],
        bonds: [
            { from: 0, to: 1, order: 1 },
            { from: 1, to: 2, order: 2 },
            { from: 1, to: 3, order: 1 },
            { from: 3, to: 4, order: 1 },
            { from: 4, to: 5, order: 2 },
            { from: 5, to: 6, order: 1 },
            { from: 6, to: 7, order: 2 },
            { from: 7, to: 8, order: 1 },
            { from: 8, to: 9, order: 2 },
            { from: 9, to: 4, order: 1 },
            { from: 9, to: 10, order: 1 },
            { from: 10, to: 11, order: 2 },
            { from: 10, to: 12, order: 1 },
        ],
    },
    {
        name: 'Méthylthéobromine (caféine)',
        atoms: [
            // Cycle à six (pyrimidine) centré sur (0, 0), côté droit vertical partagé avec le pentagone.
            { x: -0.866, y: -0.5, label: 'N' },
            { x: -0.866, y: 0.5 },
            { x: 0, y: 1, label: 'N' },
            { x: 0.866, y: 0.5 },
            { x: 0.866, y: -0.5 },
            { x: 0, y: -1 },
            // Pentagone (imidazole) hors de la grille à 120° : centre en x = 0.866 + 0.688 (apothème),
            // sommets à 0.851 du centre (rayon d'un pentagone de côté 1).
            { x: 1.817, y: -0.809, label: 'N' },
            { x: 2.405, y: 0 },
            { x: 1.817, y: 0.809, label: 'N' },
            // Deux carbonyles et trois méthyles, dans le prolongement de chaque sommet.
            { x: -1.732, y: 1, label: 'O' },
            { x: 0, y: -2, label: 'O' },
            { x: -1.732, y: -1 },
            { x: 0, y: 2 },
            { x: 2.126, y: -1.76 },
        ],
        bonds: [
            { from: 0, to: 1, order: 1 },
            { from: 1, to: 2, order: 1 },
            { from: 2, to: 3, order: 1 },
            { from: 3, to: 4, order: 2 },
            { from: 4, to: 5, order: 1 },
            { from: 5, to: 0, order: 1 },
            { from: 4, to: 6, order: 1 },
            { from: 6, to: 7, order: 1 },
            { from: 7, to: 8, order: 2 },
            { from: 8, to: 3, order: 1 },
            { from: 1, to: 9, order: 2 },
            { from: 5, to: 10, order: 2 },
            { from: 0, to: 11, order: 1 },
            { from: 2, to: 12, order: 1 },
            { from: 6, to: 13, order: 1 },
        ],
    },
];
