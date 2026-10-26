import './MoleculeDrawing.scss';
import type { Atom, Molecule } from './molecules';

// Pixels par longueur de liaison : toutes les molécules sont dessinées à la même échelle. Garde aussi des
// tailles de police normales (une police de 0.5px risquerait d'être relevée par le réglage de taille minimale).
const SCALE = 60;
// Distances suivantes en longueurs de liaison, comme les coordonnées.
const LABEL_GAP = 0.32;
const MULTIPLE_BOND_SPACING = 0.16;
const PADDING = 0.6;

interface Point {
    x: number;
    y: number;
}

interface Segment {
    start: Point;
    end: Point;
}

// Un trait par ordre de liaison, répartis de part et d'autre de l'axe A→B.
// Chaque extrémité étiquetée recule de LABEL_GAP le long de la liaison pour ne pas barrer le texte.
function bondSegments(a: Atom, b: Atom, order: number): Segment[] {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy);
    const u = { x: dx / length, y: dy / length };
    const normal = { x: -u.y, y: u.x };

    const startGap = a.label ? LABEL_GAP : 0;
    const endGap = b.label ? LABEL_GAP : 0;

    return Array.from({ length: order }, (_, i) => {
        const offset = (i - (order - 1) / 2) * MULTIPLE_BOND_SPACING;
        return {
            start: {
                x: a.x + startGap * u.x + offset * normal.x,
                y: a.y + startGap * u.y + offset * normal.y,
            },
            end: {
                x: b.x - endGap * u.x + offset * normal.x,
                y: b.y - endGap * u.y + offset * normal.y,
            },
        };
    });
}

interface Props {
    molecule: Molecule;
    className?: string;
}

export default function MoleculeDrawing({ molecule, className }: Props) {
    const xs = molecule.atoms.map(atom => atom.x);
    const ys = molecule.atoms.map(atom => atom.y);
    const minX = (Math.min(...xs) - PADDING) * SCALE;
    const minY = (Math.min(...ys) - PADDING) * SCALE;
    const width = (Math.max(...xs) - Math.min(...xs) + 2 * PADDING) * SCALE;
    const height = (Math.max(...ys) - Math.min(...ys) + 2 * PADDING) * SCALE;

    return (
        <svg
            className={['molecule', className].filter(Boolean).join(' ')}
            viewBox={`${minX} ${minY} ${width} ${height}`}
            width={width}
            height={height}
            role="img"
            aria-label={molecule.name}
        >
            {molecule.bonds.flatMap((bond, bondIndex) =>
                bondSegments(molecule.atoms[bond.from], molecule.atoms[bond.to], bond.order).map((segment, i) => (
                    <line
                        key={`${bondIndex}-${i}`}
                        className="molecule__bond"
                        x1={segment.start.x * SCALE}
                        y1={segment.start.y * SCALE}
                        x2={segment.end.x * SCALE}
                        y2={segment.end.y * SCALE}
                    />
                )),
            )}

            {/* dy plutôt que dominant-baseline : centrage vertical identique dans les trois moteurs. */}
            {molecule.atoms.map((atom, i) => atom.label && (
                <text key={i} className="molecule__label" x={atom.x * SCALE} y={atom.y * SCALE} dy="0.35em">
                    {atom.label}
                </text>
            ))}
        </svg>
    );
}
