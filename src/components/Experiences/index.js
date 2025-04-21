import Experience from "./Experience";

export default function Experiences({experiences}) {
    return (
        <section>
            <h2>Expériences professionnelles</h2>
            <ul className="top10">
                {experiences.map((experience) =>  <Experience key={experience.title} experience={experience} />).slice(0, 6)}
            </ul>
        </section>
    )
}

