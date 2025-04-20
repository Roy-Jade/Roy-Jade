export default function Aside({skills, langages, hobbies}) {
    return (
        <aside>

            <img src="null" alt="Photo de Grégoire"></img>

            <article>
                <h2>Compétences</h2>
                <ul>
                    {skills.map((skill) => <li key={skill}>{skill}</li>).slice(0, 10)}
                </ul>
            </article>

            <article>
                <h2>Langues</h2>
                <ul>
                    {langages.map((langage) => <li key={langage}>{langage}</li>).slice(0, 4)}
                </ul>
            </article>

            <article>
                <h2>Centres d'intérêts</h2>
                <ul className="noBorder">
                    {hobbies.map((hobby) => <li key={hobby}>{hobby}</li>).slice(0, 4)}
                </ul>
            </article>
            
        </aside>
    )
}