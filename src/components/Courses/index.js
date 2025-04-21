import Course from "./Course";

export default function Courses({courses}) {
    return (
        <section>
            <h2>Formations et diplômes</h2>
            <ul>
                {courses.map((course) =>  <Course key={course.title} course={course} />).slice(0, 5)}
            </ul>
        </section>
    )
}

