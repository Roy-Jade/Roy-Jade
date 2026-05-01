import { createRoot } from "react-dom/client";
import App from "./components/App";
import "./assets/css/index.scss";

const CV_container = document.getElementById("cv");

const cv = createRoot(CV_container);

cv.render(<App />);