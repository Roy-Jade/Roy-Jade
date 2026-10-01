import './Home.scss';
import Logo from '../../components/Logo/Logo';
import CtaLink from '../../components/CtaLink/CtaLink';

export default function Home() {
    return (<>
        <title>Grégoire Portier, le développeur scientifique</title>
        <meta
            name="description"
            content="Développeur fullstack issu des sciences : la rigueur et l'analyse d'un ancien scientifique pour construire les outils web dont votre métier a besoin."
        />

        <section className="home-hero">
            <div className="home-hero__inner">
                <div className="home-hero__text">
                    <p className="home-hero__formula" aria-hidden="true">C₆H₆ → TypeScript</p>

                    <h1 className="home-hero__title">
                        <span>Un problème.</span>
                        <span>Une solution.</span>
                        <span>Un outil.</span>
                        <span className="home-hero__title-accent">Un développeur scientifique.</span>
                    </h1>

                    <p className="home-hero__pitch">
                        Vous avez une problématique à régler ou un outil à construire ? Je vous accompagne pour analyser vos besoins et créer les outils qui règleront vos problèmes.
                    </p>

                    <CtaLink to="/cv">Consulter mon CV</CtaLink>
                </div>

                <Logo variant="mark" decorative className="home-hero__mark" />
            </div>
        </section>
    </>)
}
