const overlay = document.getElementById("overlay");
const anchorMuovi = document.querySelectorAll("a.switch-move");

const loginForm = document.getElementById("logForm");
const lgUsernameForm = document.getElementById("lgUsername");
const lgPasswordForm = document.getElementById("lgPassword");

const registraForm = document.getElementById("regForm");
const rgUsernameForm = document.getElementById("rgUsername");
const rgPasswordForm = document.getElementById("rgPassword");

const erroreUsername = document.getElementById("rgUsernameError");
const errorePassword = document.getElementById("rgPasswordError");
const erroreMaiusc = document.getElementById("charMaiuscErr");
const erroreCifra = document.getElementById("numberErr");
const erroreSpecial = document.getElementById("specialCharErr");
const erroreLunghezza = document.getElementById("lengthErr")
const erroreLogin = document.getElementById("loginError");

const bottoniTendine = document.querySelectorAll("button.dropdown");

const regexUsername = /^.{5,20}$/;
const regexPassword = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[~!@#$%^&*]).{8,}$/;

const regexMaiusc = /^(?=.*[A-Z]).*$/;
const regexNum = /^(?=.*[0-9]).*$/;
const regexSpec = /^(?=.*[~!@#$%^&*]).*$/;
const regexLung = /^.{8,}$/;

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

        loginForm.classList.toggle("opacity-0");
        loginForm.classList.toggle("invisible");
        loginForm.classList.toggle("absolute");

        lgUsernameForm.value = "";
        lgPasswordForm.value = "";
        rgUsernameForm.value = "";
        rgPasswordForm.value = "";

        erroreLogin.classList.add("hidden");

        erroreUsername.classList.add("hidden");
        errorePassword.classList.add("hidden");

        erroreMaiusc.classList.remove("text-red-600")
        erroreCifra.classList.remove("text-red-600")
        erroreSpecial.classList.remove("text-red-600")
        erroreLunghezza.classList.remove("text-red-600")
    });
});

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (managerLogin()) inviaLogin();
});

function managerLogin() {
    const username = loginForm.username.value;
    const password = loginForm.password.value;

    if (!regexUsername.test(username) || !regexPassword.test(password)) {
        erroreLogin.classList.remove("hidden");
        return false;
    }

    erroreLogin.classList.add("hidden");
    return true;
}

async function inviaLogin() {
    const formData = new FormData(loginForm);
    const postData = Object.fromEntries(formData.entries());

    try {
        const res = await fetch('api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        });

        if (!res.ok) {
            throw new Error(`HTTP error status: ${res.status}`);
        }

        const result = await response.json();
        console.log('Successo:', result);

        if (!result.login) managerLogin();
        else {
            window.location.href = "hub.html";
        }
    } catch (error) {
        console.error('Errore invio form:', error);
    }
}

registraForm.addEventListener("submit", (e) => {
    e.preventDefault();    

    if (managerRegister()) inviaRegister();
});

function managerRegister() {
    const username = registraForm.username.value;
    const password = registraForm.password.value;

    let errUsername = false;
    if (regexUsername.test(username)) {
        erroreUsername.classList.add("hidden");
    }
    else {
        erroreUsername.classList.remove("hidden");
        errUsername = true;
    }

    let errPassword = false;
    if (!regexMaiusc.test(password)) {
        erroreMaiusc.classList.add("text-red-600");
        errPassword = true;
    }
    else {
        erroreMaiusc.classList.remove("text-red-600");
    }

    if (!regexNum.test(password)) {
        erroreCifra.classList.add("text-red-600");
        errPassword = true;
    }
    else {
        erroreCifra.classList.remove("text-red-600");
    }

    if (!regexSpec.test(password)) {
        erroreSpecial.classList.add("text-red-600");
        errPassword = true;
    }
    else {
        erroreSpecial.classList.remove("text-red-600");
    }

    if (!regexLung.test(password)) {
        erroreLunghezza.classList.add("text-red-600");
        errPassword = true;
    }
    else {
        erroreLunghezza.classList.remove("text-red-600");
    }

    if (errPassword) {
        errorePassword.classList.remove("hidden");
    }
    else {
        errorePassword.classList.add("hidden");
    }

    if (errUsername || errPassword) return false;
    return true;
}

async function inviaRegister() {
    const formData = new FormData(registraForm);
    const postData = Object.fromEntries(formData.entries());

    try {
        const res = await fetch('api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        });

        if (!res.ok) {
            throw new Error(`HTTP error status: ${res.status}`);
        }

        const result = await response.json();
        console.log('Successo:', result);

        if (!result.register) managerRegister();
        else {
            window.location.href = "hub.html";
        }

    } catch (error) {
        console.error('Errore invio form:', error);
    }
}