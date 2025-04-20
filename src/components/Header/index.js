export default function Header({infos}) {
    return (
        <header>
            <ul className="container">
                <li>
                    <strong>
                        <span id="prenom">Grégoire</span> 
                        <span id="nom">Portier</span>
                    </strong>
                </li>
                <li>
                    <strong>Adresse</strong>
                    {infos.adress}<br/>{infos.postalCode} {infos.town}
                </li >
                <li>
                    <strong>Téléphone</strong>
                    <a href={"tel:"+infos.phone} >{infos.phone}</a>
                </li >
                <li>
                    <strong>Mail</strong>
                    <a href={"mailto:"+infos.email}>{infos.email}</a>
                </li >
            </ul>
            <h1>Développeur full-stack</h1>
        </header>
    )
}