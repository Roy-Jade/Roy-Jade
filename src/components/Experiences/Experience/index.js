export default function Experience({experience}) {
    return (
        <li>
            <span className="periode">{experience.date}</span>
            <span className="desc"><strong>{experience.title}</strong>, {experience.compagny} ({experience.duration})</span>
        </li>
    )
}

