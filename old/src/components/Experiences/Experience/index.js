export default function Experience({experience}) {
    return (
        <li>
            <p className="event">
                <span className="periode">{experience.date}</span>
                <span className="desc"><strong>{experience.title}</strong>, {experience.compagny} ({experience.duration})</span>
            </p>
            {experience.skills.map((skill) =>  
                <p className="event-skills" key={skill}>{skill}</p>
            )}
        </li>
    )
}

