export default function Header({infos}) {
    return (
        <header className="CV_header">
            <h1 className="position-left">
                <span id="prenom">Grégoire</span> 
                <span id="nom">Portier</span>
            </h1>
            <div>
                <ul className="container position-right">
                    <li>
                        <strong>Adresse</strong>
                        {infos.postalCode} {infos.town}
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
                <h2 className="main-title">Alternant Architecte Logiciel</h2>
            </div>
        </header>
    )
}