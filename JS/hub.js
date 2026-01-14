const overlayProfilo = document.getElementById("overlayProfile");

const btnProfiloNav = document.getElementById("navbarProfileIMG");
const imgProfiloNav = btnProfiloNav.querySelector("img");
const tendinaNav = document.getElementById("dropdownMenu");

const btnProfiloProfilo = document.getElementById("profileProfileImg");
const imgProfiloProfilo = btnProfiloProfilo.querySelector("img");
const divProfiloProfilo = btnProfiloProfilo.querySelector("div");
const tendinaProfilo = document.getElementById("dropdownImgProfile");

const imgPreviewProfile = document.getElementById("previewProfile").querySelector("img");
const namePreviewProfile = document.getElementById("previewProfile").querySelector("h2");

const formUsername = document.getElementById("formUsername");
const btnCambiaForm = document.getElementById("btnChangeUsername");
const inputNomeForm = formUsername.firstElementChild.querySelector("input");
const divBottoniForm = formUsername.lastElementChild;




const giocatore = {
    username: null,
    img: null
}

fetch('/api/user')
    .then(response => response.json())
    .then(data => {
        giocatore.username = data.user.username;
        giocatore.img = data.user.img;

        refreshUsername();
        refreshIMG();
    })
    .catch(error => {
        console.error('Non è stato possibile ottenere i dati utente', error);
});


function refreshIMG() {
    let src = giocatore.img;
    imgProfiloNav.src = src;
    imgProfiloProfilo.src = src;
    imgPreviewProfile.src = src;
}
function refreshUsername() {
    let nome = giocatore.username;
    namePreviewProfile.innerHTML = nome;
    document.getElementById("inNickname").value = nome;
}

// Evento per aprire/chiudere la tendina con click diretti
btnProfiloNav.addEventListener("click", (e) => {
    // Blocca l'evento prima che raggiunga il document
    e.stopPropagation();

    imgProfiloNav.classList.toggle("ring-2");
    imgProfiloNav.classList.toggle("shadow-md");

    tendinaNav.classList.toggle("hidden");
});

// Evento per aprire le overlay dei button
// Ogni button ha una data-action
tendinaNav.addEventListener("click", (e) => {
    e.stopPropagation();

    const action = e.target.dataset.action;
    // Se non è stata trovata la data-action il click non era nella tendina
    if (!action) return;

    // Se è stata trovata la data-action, tolgo la tendina e apro la relativa overlay
    tendinaNav.classList.add("hidden");
    imgProfiloNav.classList.remove("ring-2", "shadow-md"); 
    switch (action) { 
        case "profilo": 
            overlayProfilo.classList.remove("hidden");
            break;

        case "impostazioni": 
            console.log("Apri impostazioni"); 
            break; 
    }
});

// Chiude la tendina o le overlay se il click è esterno
document.addEventListener("click", (e) => { 
    const clickDentroTendina = tendinaNav.contains(e.target); 
    const clickSulProfilo = btnProfiloNav.contains(e.target);
    // Se il click non è contenuto né dentro la tendina né dentro l'immagine
    // del profilo, allora chiudo la tendina
    if (!clickDentroTendina && !clickSulProfilo) { 
        tendinaNav.classList.add("hidden");
        imgProfiloNav.classList.remove("ring-2", "shadow-md"); 
    } 

    // *l'overlay contiene anche lo sfondo
    // prendo il primo div al suo interno, ovvero il blocco che appare al centro
    const clickDentroOverlayProfilo = overlayProfilo.querySelector("div").contains(e.target);
    if (!clickDentroOverlayProfilo) {
        overlayProfilo.classList.add("hidden");
    }

    const clickDentroTendinaImg = tendinaProfilo.contains(e.target);
    if (!clickDentroTendinaImg) { 
        tendinaProfilo.classList.add("hidden");
        divProfiloProfilo.classList.add("hidden");
    } 
});

// Apro la tendina delle immagini se l'utente clicca sulla sua immagine profilo
btnProfiloProfilo.addEventListener("click", (e) => {
    e.stopPropagation();

    divProfiloProfilo.classList.toggle("hidden");
    tendinaProfilo.classList.toggle("hidden");
});

tendinaProfilo.addEventListener("click", (e) => {
    e.stopPropagation();

    let elemento = e.target.closest('[data-action="select-img"]');
    if (!elemento) return;

    let src = elemento.querySelector("img")?.src;
    if (!src) return;

    giocatore.img = src;
    refreshIMG();
});

btnCambiaForm.addEventListener("click", (e) => {
    divBottoniForm.classList.remove("hidden");
    btnCambiaForm.classList.add("hidden");

    inputNomeForm.disabled = false;
});

function annullaCambioNome() {
    inputNomeForm.value = giocatore.username;
    inputNomeForm.disabled = true;

    btnCambiaForm.classList.remove("hidden");
    divBottoniForm.classList.add("hidden");
    nascondiErrore();
}

formUsername.addEventListener("reset", (e) => {
    e.preventDefault();
    annullaCambioNome();
});

formUsername.addEventListener("submit", (e) => {
    e.preventDefault();

    let nome = e.target.elements["username"].value
    if (nome.length > 1) {
        // fetch
        giocatore.username = nome;
        refreshUsername();

        annullaCambioNome();
    }
    else {
        mostraErrore();
    }

});

function nascondiErrore() {
    const errore = btnCambiaForm.nextElementSibling;
    if (errore.classList.contains("hidden")) return;
    errore.classList.add("hidden");
}

function mostraErrore() {
    const errore = btnCambiaForm.nextElementSibling;
    errore.classList.remove("hidden")
    setTimeout(nascondiErrore, 5000);
}