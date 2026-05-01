import Header from "../Header";
import Aside from "../Aside/script";
import Presentation from "../Presentation";
import Courses from "../Courses";
import Experiences from "../Experiences";
import Footer from "../Footer/index.js";
import skills from "../../assets/data/skills.js";

import personalInfos from "../../assets/data/personalInfos";
import courses from "../../assets/data/courses.js";
import experiences from "../../assets/data/experiences.js";

export default function App() {
    return (
        <div className="CV">
            <Header infos={personalInfos} />
            <main className="CV_main container">
                <Aside skills={skills.hard.coding} langages={skills.hard.langages} hobbies={skills.hobbies} />
                <div className="container main-content position-right">
                    <Presentation />
                    <Experiences experiences={experiences} />
                    <Courses courses={courses} />
                </div>
            </main>
            <Footer />
        </div>
    )
}