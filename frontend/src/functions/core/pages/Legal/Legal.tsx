import './Legal.scss';
import { useIdentityData } from '../../../cv/hooks/useIdentityData';

const SOURCE_CODE_URL = 'https://github.com/Roy-Jade/Roy-Jade';

// TODO : à compléter une fois l'hébergeur choisi (mention obligatoire).
const HOST = {
    name: 'Hébergeur à définir',
    address: 'Adresse à définir',
    telephone: 'Téléphone à définir',
};

export default function Legal() {
    const { data, isError } = useIdentityData();
    const fullName = data ? `${data.firstname} ${data.lastname}` : null;

    // Seules les informations issues de la base attendent le fetch : le reste de la page s'affiche quoi qu'il arrive.
    const placeholder = (
        <span className={isError ? 'legal__status legal__status--error' : 'legal__status'}>
            {isError ? 'Informations momentanément indisponibles' : 'Chargement…'}
        </span>
    );

    return (<>
        <title>Mentions légales</title>

        <article className="legal">
            <h1 className="legal__title">Mentions légales</h1>

            <section className="legal__section">
                <h2 className="legal__heading">Éditeur du site</h2>
                {data ? (
                    <address className="legal__address">
                        <dl className="legal__list">
                            <div className="legal__row">
                                <dt>Nom</dt>
                                <dd>{fullName}{data.siret && ', entrepreneur individuel (micro-entreprise)'}</dd>
                            </div>
                            {data.siret && (<>
                                <div className="legal__row">
                                    <dt>SIRET</dt>
                                    <dd>{data.siret}</dd>
                                </div>
                                <div className="legal__row">
                                    <dt>Adresse</dt>
                                    <dd className="legal__multiline">{data.domiciliation}</dd>
                                </div>
                            </>)}
                            <div className="legal__row">
                                <dt>E-mail</dt>
                                <dd><a className="legal__link" href={`mailto:${data.email}`}>{data.email}</a></dd>
                            </div>
                            <div className="legal__row">
                                <dt>Téléphone</dt>
                                <dd>{data.telephone}</dd>
                            </div>
                        </dl>
                    </address>
                ) : <p>{placeholder}</p>}
            </section>

            <section className="legal__section">
                <h2 className="legal__heading">Directeur de la publication</h2>
                <p>{fullName ?? placeholder}</p>
            </section>

            <section className="legal__section">
                <h2 className="legal__heading">Hébergement</h2>
                <address className="legal__address">
                    <dl className="legal__list">
                        <div className="legal__row">
                            <dt>Hébergeur</dt>
                            <dd>{HOST.name}</dd>
                        </div>
                        <div className="legal__row">
                            <dt>Adresse</dt>
                            <dd>{HOST.address}</dd>
                        </div>
                        <div className="legal__row">
                            <dt>Téléphone</dt>
                            <dd>{HOST.telephone}</dd>
                        </div>
                    </dl>
                </address>
            </section>

            <section className="legal__section">
                <h2 className="legal__heading">Données personnelles</h2>
                <p>
                    Ce site ne collecte aucune donnée personnelle de ses visiteurs : il ne comporte ni formulaire,
                    ni création de compte, ni outil de mesure d'audience, ni publicité.
                </p>
                <p>
                    Comme tout serveur web, celui de l'hébergeur peut enregistrer des données techniques de connexion
                    (adresse IP, date, page demandée) à des fins de sécurité et de bon fonctionnement du service.
                </p>
                <p>
                    Pour toute question relative à vos données, vous pouvez écrire à l'adresse indiquée
                    dans la rubrique « Éditeur du site ».
                </p>
            </section>

            <section className="legal__section">
                <h2 className="legal__heading">Cookies et stockage local</h2>
                <p>
                    Ce site ne dépose aucun cookie chez ses visiteurs. Un cookie de session, strictement nécessaire,
                    n'est créé que lors de la connexion à l'espace d'administration privé.
                </p>
                <p>
                    La dernière page consultée est enregistrée dans la session du navigateur, uniquement pour
                    la navigation : cette information n'est jamais transmise et elle est effacée à la fermeture de l'onglet.
                    Aucun consentement n'est donc requis.
                </p>
            </section>

            <section className="legal__section">
                <h2 className="legal__heading">Liens externes</h2>
                <p>
                    Les liens vers des sites tiers (réseaux sociaux notamment) font quitter ce site.
                    Leurs éditeurs sont seuls responsables de leur contenu et du traitement des données de leurs visiteurs.
                </p>
            </section>

            <section className="legal__section">
                <h2 className="legal__heading">Propriété intellectuelle</h2>
                <p>
                    Les contenus de ce site (textes, informations du CV, visuels) appartiennent
                    à {fullName ?? 'son éditeur'}, sauf mention contraire. Toute reproduction sans autorisation est interdite.
                </p>
                <p>
                    Le code source du site est publié sous licence{' '}
                    <a className="legal__link" href="https://www.gnu.org/licenses/agpl-3.0.html">AGPL-3.0</a>
                    {' '}et disponible sur <a className="legal__link" href={SOURCE_CODE_URL}>GitHub</a>.
                </p>
            </section>
        </article>
    </>)
}
