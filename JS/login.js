document.querySelectorAll("button#dropdown")
    .forEach(btn => btn.addEventListener("click", () => {
        toggleMenu(btn);
    })
);

function toggleMenu(btn) {
    let tendina = btn.nextElementSibling;

    btn.classList.toggle("bg-gray-50");
    btn.classList.toggle("bg-blue-50");

    tendina.classList.toggle("grid-rows-[0fr]");
    tendina.classList.toggle("grid-rows-[1fr]");
    tendina.classList.toggle("opacity-0");
    tendina.classList.toggle("opacity-100");

    btn.lastElementChild.classList.toggle("rotate-180");
}