import './Contact.scss';
import { useIdentityData } from '../../../cv/hooks/useIdentityData';
import { getUsername, socialLinks } from '../../constants/socialLinks';

// Numéros supposés français : le 0 initial devient +33 pour que le lien fonctionne aussi depuis l'étranger.
function toTelHref(telephone: string) {
    const digits = telephone.replace(/\D/g, '');
    return `tel:${digits.startsWith('0') ? `+33${digits.slice(1)}` : digits}`;
}

function MailIcon() {
    return (
        <svg className="contact__icon" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
        </svg>
    );
}

function PhoneIcon() {
    return (
        <svg className="contact__icon" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
            <path d="M10.5 18.5h3" />
        </svg>
    );
}

function NetworkIcon() {
    return (
        <svg className="contact__icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="6" cy="12" r="2.5" />
            <circle cx="18" cy="6" r="2.5" />
            <circle cx="18" cy="18" r="2.5" />
            <path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6" />
        </svg>
    );
}

export default function Contact() {
    const { data, isError } = useIdentityData();

    // Le squelette reste affiché quoi qu'il arrive : seules les valeurs attendent les données.
    // Si une donnée est déjà en cache, elle reste affichée même quand un rafraîchissement échoue.
    const placeholder = (
        <span className={isError ? 'contact__status contact__status--error' : 'contact__status'}>
            {isError ? 'Erreur' : 'Chargement…'}
        </span>
    );

    return (<>
        <title>Me contacter</title>

        <section className="contact">
            <h1 className="contact__title">Me contacter</h1>

            {isError && !data && (
                <p className="contact__error" role="alert">
                    Veuillez m'excuser, mais une erreur s'est produite lors de la récupération des données.
                </p>
            )}

            <address className="contact__address">
                <dl className="contact__list">
                    <div className="contact__card">
                        <dt className="contact__label"><PhoneIcon />Téléphone</dt>
                        <dd className="contact__value">
                            {data
                                ? <a className="contact__link" href={toTelHref(data.telephone)}>{data.telephone}</a>
                                : placeholder}
                        </dd>
                    </div>

                    <div className="contact__card">
                        <dt className="contact__label"><MailIcon />E-mail</dt>
                        <dd className="contact__value">
                            {data
                                ? <a className="contact__link" href={`mailto:${data.email}`}>{data.email}</a>
                                : placeholder}
                        </dd>
                    </div>

                    <div className="contact__card">
                        <dt className="contact__label"><NetworkIcon />Réseaux</dt>
                        <dd className="contact__value">
                            {data ? (
                                <ul className="contact__socials">
                                    {socialLinks.map(({ key, icon, label, showsRealName }) => {
                                        const href = data[key];
                                        if (!href) return null;
                                        const name = showsRealName ? `${data.firstname} ${data.lastname}` : getUsername(href);
                                        return (
                                            <li key={key}>
                                                {/* Même onglet, comme dans le pied de page : le visiteur choisit d'en ouvrir un autre. */}
                                                <a href={href} className={`contact__link contact__social contact__social--${key}`}>
                                                    <img src={icon} alt="" />
                                                    {name} sur {label}
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : placeholder}
                        </dd>
                    </div>
                </dl>
            </address>
        </section>
    </>)
}
