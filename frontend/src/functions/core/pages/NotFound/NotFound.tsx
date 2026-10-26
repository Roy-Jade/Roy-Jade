import './NotFound.scss';
import { useState } from 'react';
import CtaLink from '../../components/CtaLink/CtaLink';
import MoleculeDrawing from './MoleculeDrawing';
import { molecules } from './molecules';

export default function NotFound() {
    // Initialiseur paresseux : tiré au premier rendu seulement, la molécule ne change plus ensuite.
    const [molecule] = useState(() => molecules[Math.floor(Math.random() * molecules.length)]);

    return (<>
        <title>Page introuvable</title>
        <meta name="robots" content="noindex" />

        <section className="not-found">
            <div className="not-found__text">
                <h1 className="not-found__title">Erreur 404</h1>
                <p className="not-found__pitch">
                    Il n'y a rien à voir ici, donc voici une molécule pour occuper la page.
                </p>
                <CtaLink to="/">Retour à l'accueil</CtaLink>
            </div>

            <figure className="not-found__molecule">
                <MoleculeDrawing molecule={molecule} />
                <figcaption className="not-found__caption">{molecule.name}</figcaption>
            </figure>
        </section>
    </>)
}
