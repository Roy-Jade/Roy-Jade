import './Home.scss';
import {Link} from 'react-router';

export default function Home() {
    return (<>
        <h1>
            <span>Votre problème</span>
            <span>Votre développeur</span>
            <span>Votre solution</span>
        </h1>

        <p>Vous avez une problématique à régler ou un outil à construire ? Je vous accompagne pour analyser vos besoins et créer les outils qui règleront vos problèmes.</p>

        <Link to='/contact'>Prenez contact maintenant !</Link>
    </>)
}