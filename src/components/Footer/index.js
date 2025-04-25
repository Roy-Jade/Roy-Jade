export default function Footer() {
    return (
        <footer>
            <h2 className="position-left">Sur les réseaux :</h2>
            <ul className="container position-right">
                {/* <li>Sur les réseaux:</li> */}
                <li>
                    <a href="#">
                        <img src="/img/github-mark.png" alt="logo Github" /> GitHub</a>
                </li>
                <li>
                    <a href="#">
                        <img src="/img/LI-In-Bug.png" alt="logo Linkedin" /> LinkedIn</a>
                </li>
            </ul>
        </footer>
    )
}