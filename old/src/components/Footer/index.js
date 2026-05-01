export default function Footer() {
    return (
        <footer className="CV_footer">
            <h2 className="position-left">Sur les réseaux :</h2>
            <ul className="container position-right">
                {/* <li>Sur les réseaux:</li> */}
                <li>
                    <a href="https://github.com/Roy-Jade">
                        <img src="/img/github-mark.png" alt="logo Github" /> Roy-Jade</a>
                </li>
                <li>
                    <a href="https://www.linkedin.com/in/gregoire-portier">
                        <img src="/img/LI-In-Bug.png" alt="logo Linkedin" /> Grégoire Portier</a>
                </li>
            </ul>
        </footer>
    )
}