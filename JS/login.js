const overlay = document.getElementById("overlay");
const anchorMuovi = document.querySelectorAll("a.switch-move");

const loginForm = document.getElementById("logForm");
const registraForm = document.getElementById("regForm");

const rgUsername = document.getElementById("rgUsername");
const rgPassword = document.getElementById("rgPassword");
const lgUsername = document.getElementById("lgUsername");
const lgPassword = document.getElementById("lgPassword");

const bottoniTendine = document.querySelectorAll("button.dropdown");

bottoniTendine.forEach(btn => btn.addEventListener("click", () => {
        gestoreMenu(btn);
    })
);

function gestoreMenu(btn) {
    if (btn.lastElementChild.classList.contains("rotate-180")) {
        chiudiMenu(btn);
    }
    else {
        bottoniTendine.forEach(bott => chiudiMenu(bott));
        apriMenu(btn);
    }
}

function apriMenu(btn) {
    if (btn.lastElementChild.classList.contains("rotate-180")) return;

    let tendina = btn.nextElementSibling;

    btn.classList.remove("bg-gray-50");
    btn.classList.add("bg-blue-50");

    tendina.classList.remove("grid-rows-[0fr]");
    tendina.classList.add("grid-rows-[1fr]");

    tendina.classList.remove("opacity-0");
    tendina.classList.add("opacity-100");
    
    btn.lastElementChild.classList.add("rotate-180");
}

function chiudiMenu(btn) {
    if (!btn.lastElementChild.classList.contains("rotate-180")) return;

    let tendina = btn.nextElementSibling;

    btn.classList.add("bg-gray-50");
    btn.classList.remove("bg-blue-50");

    tendina.classList.add("grid-rows-[0fr]");
    tendina.classList.remove("grid-rows-[1fr]");

    tendina.classList.add("opacity-0");
    tendina.classList.remove("opacity-100");

    btn.lastElementChild.classList.remove("rotate-180");
}

anchorMuovi.forEach(anchor => {
    anchor.addEventListener("click", () => {
        overlay.classList.toggle("translate-x-full");
        registraForm.classList.toggle("opacity-0");
        registraForm.classList.toggle("invisible");
        registraForm.classList.toggle("absolute");

        rgUsername.value = "";
        rgPassword.value = "";
        lgUsername.value = "";
        lgPassword.value = "";

        loginForm.classList.toggle("opacity-0");
        loginForm.classList.toggle("invisible");
        loginForm.classList.toggle("absolute");
    });

});


registraForm.addEventListener("submit", (e) => {
    // e.preventDefault();
});
loginForm.addEventListener("submit", (e) => {
    // e.preventDefault();
});