export default function Footer() {
    return (
        <footer>
            <h2>Sur les réseaux :</h2>
            <ul className="container">
                {/* <li>Sur les réseaux:</li> */}
                <li>
                    <a href="#">
                        <img src="logoface.png" alt="logo Github" /> GitHub</a>
                </li>
                <li>
                    <a href="#">
                        <img src="logoface.png" alt="logo Linkedin" /> LinkedIn</a>
                </li>
            </ul>
        </footer>
    )
}