export default function Course({course}) {
    return (
        <li className="exp">
            <span className="periode">{course.date}</span>
            <span className="desc">{course.title}, {course.school}</span>
        </li>
    )
}

