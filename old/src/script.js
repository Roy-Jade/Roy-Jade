document.addEventListener("DOMContentLoaded", () => {
    let printLink = document.getElementById("print");
    let CV_container = document.getElementById("CV");

    printLink.addEventListener("click", event => {
        event.preventDefault();
        printLink.style.display = "none";
        window.print();
    }, false);

    CV_container.addEventListener("click", event => {
        printLink.style.display = "flex";
    }, false);

}, false);