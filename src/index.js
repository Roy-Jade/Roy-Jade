import { createRoot } from "react-dom/client";
import App from "./components/App";
import "./assets/css/index.scss";

const container = document.getElementById("cv");

const cv = createRoot(container);

cv.render(<App />);