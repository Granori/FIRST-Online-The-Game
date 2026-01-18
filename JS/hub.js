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

const formProfilo = document.getElementById("formProfile");
const btnCambiaForm = document.getElementById("btnChangeUsername");
const btnAnnullaForm = document.getElementById("btnUndoUsername");
const inputNomeForm = formProfilo.querySelector("input");
const divBottoniForm = document.getElementById("divButtons");
const errCambiaInfo = document.getElementById("errorChange");

const formCreaStanza = document.getElementById("formCreaStanza");
const errCreaStanza = document.getElementById("erroreCreazioneStanza");

const regexUsername = /^.{5,20}$/;

const divStanze = document.getElementById("divStanze")
const riga = `
    <tr>
        <td class="px-4 py-2 text-left">STANZA #1</td>
        <td class="px-4 py-2 text-left">#0000</td>
        <td class="px-4 py-2 text-left">Giocatore</td>
        <td class="px-4 py-2 text-right">1/4</td>
        <td class="px-4 py-2 text-right">
            <button class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500">
            Entra
            </button>
        </td>
    </tr>`

const giocatore = {
    username: "NomeGiocatore",
    img: "cane1.jpg"
}

const modificheTemp = {
    username: null,
    img: null
}

fetch('/api/user')
    .then(response => response.json())
    .then(data => {
        giocatore.username = data.user.username;
        giocatore.img = data.user.pathImg;

        refreshUsername();
        refreshIMG();
    })
    .catch(error => {
        console.error('Non è stato possibile ottenere i dati utente', error);
    });

aggiornaStanza();

setInterval(aggiornaStanza, 15000);

function aggiornaStanza() {
    fetch('/game/lobbies')
        .then(response => response.json())
        .then(data => {
            caricaStanze(data);
        })
        .catch(error => {
            console.error('Non è stato possibile caricare le stanze', error);
        })
}

function caricaStanze(stanze) {
    divStanze.innerHTML = "";
    stanze.forEach(stanza => {
        divStanza = `
            <tr>
                <td class="px-4 py-2 text-left">${stanza.nome}</td>
                <td class="px-4 py-2 text-left">${stanza.id}</td>
                <td class="px-4 py-2 text-left">${stanza.host}</td>
                <td class="px-4 py-2 text-right">${stanza.numGiocatori}</td>
                <td class="px-4 py-2 text-right">
                    <button class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500 disabled:bg-gray-600 disabled:text-gray-200 disabled:cursor-not-allowed disabled:hover:bg-gray-400" ${stanza.numGiocatori >= 4 ? "disabled" : ""} data-id="${stanza.id}">
                        Entra
                    </button>
                </td>
            </tr>`
        
        divStanze.innerHTML += divStanza;
    })
}

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

// Nasconde errore del nome
function nascondiErroreUser() {
    const errore = btnCambiaForm.nextElementSibling;
    if (errore.classList.contains("hidden")) return;
    errore.classList.add("hidden");
}

// Mostra errore del nome
function mostraErroreUser() {
    const errore = btnCambiaForm.nextElementSibling;
    errore.classList.remove("hidden")
    setTimeout(nascondiErroreUser, 5000);
}

function apriModifiche() {
    divBottoniForm.classList.remove("hidden");
}

function chiudiModifiche() {
    imgProfiloProfilo.src = giocatore.img;
    // inputNomeForm.value = giocatore.username;

    modificheTemp.img = giocatore.img;
    modificheTemp.username = giocatore.username;

    divBottoniForm.classList.add("hidden");

    disattivaInput();
    nascondiErroreUser();
}

function attivaInput() {
    inputNomeForm.disabled = false;
    btnCambiaForm.classList.add("hidden");
    btnAnnullaForm.classList.remove("hidden");
}

function disattivaInput() {
    inputNomeForm.disabled = true;
    inputNomeForm.value = giocatore.username;
    btnCambiaForm.classList.remove("hidden");
    btnAnnullaForm.classList.add("hidden");
}


divStanze.addEventListener("click", (e) => {
    e.stopPropagation();
    const actionId = e.target.dataset.id;
    if (!actionId) return;

    console.log("Entra nella stanza:", actionId);
    
    fetch(`/game/joinLobby?lobbyId=${actionId}`)
        .then(response => response.json())
        .then(data => {
            if (data.canJoin) {
                sessionStorage.setItem("lobbyId", actionId);
                window.location.href = `/game/joinLobby?lobbyId=${actionId}`;
            }
            else {
                console.log("Richiesta ingresso negata");
            }
        })
        .catch(error => {
            console.error('Non è stato possibile inviare la richiesta di unione', error);
        });

});

// Evento per aprire/chiudere la tendina con click diretti
btnProfiloNav.addEventListener("click", (e) => {
    // Blocca l'evento prima che raggiunga il document
    e.stopPropagation();

    imgProfiloNav.classList.toggle("ring-2");
    imgProfiloNav.classList.toggle("shadow-md");

    tendinaNav.classList.toggle("hidden");
});

formCreaStanza.addEventListener("submit", (e) => {
    e.stopPropagation();
    e.preventDefault();

    let nomeStanza = formCreaStanza.nomeStanza.value;
    if (nomeStanza === "") {
        errCreaStanza.classList.remove("hidden");
        return;
    }

    fetch('/game/createLobby', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "nome": nomeStanza
        })
    })
        .then(response => response.json())
        .then(data => {
            sessionStorage.setItem("lobbyId", data.lobbyId)
            window.location.href = `stanza.html`;
        })
        .catch(error => {
            console.error('Errore invio richiesta di creazione stanza', error);
            errCambiaInfo.classList.remove("hidden");
        });
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

// Click sull'immagine che si vuole avere
tendinaProfilo.addEventListener("click", (e) => {
    e.stopPropagation();

    let elemento = e.target.closest('[data-action="select-img"]');
    if (!elemento) return;

    let src = elemento.querySelector("img")?.src;
    if (!src) return;

    modificheTemp.img = src;
    imgProfiloProfilo.src = modificheTemp.img;
    apriModifiche();
});

// Attiva il campo cambio nome quando si clicca sul bottone Cambia
btnCambiaForm.addEventListener("click", (e) => {
    e.stopPropagation();
    apriModifiche();

    attivaInput();
});

btnAnnullaForm.addEventListener("click", (e) => {
    e.stopPropagation();

    disattivaInput();
});

// Pulisce il form
formProfilo.addEventListener("reset", (e) => {
    e.stopPropagation();
    e.preventDefault();

    chiudiModifiche();
});

// Carica le modifiche
formProfilo.addEventListener("submit", (e) => {
    e.preventDefault();

    let nome = e.target.elements["username"].value;

    let userCambiato = nome !== giocatore.username;
    let imgCambiato = giocatore.img !== modificheTemp.img && modificheTemp.img != null;

    // Se l'utente non ha cambiato nulla
    if (!userCambiato && !imgCambiato) {
        chiudiModifiche();
        return;
    }
    // Se l'utente inserisce un nome non valido mostro l'errore
    if (!regexUsername.test(nome)) {
        mostraErroreUser();
        return;
    }

    const dati = {}
    if (userCambiato) {
        dati.username = nome;
    }
    if (imgCambiato) {
        dati.img = modificheTemp.img;
    }

    fetch('/api/changeUsernameInfo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({dati})
    })
        .then(response => {
            // Verifica se la risposta è un redirect
            if (response.redirected) {
                // Esegui il redirect
                window.location.href = response.url;
                return;
            }
            return response.json();
        })
        .then(result => {
            //TODO: gestione degli errori della API
            if (result.executed) {
                giocatore.username = nome;
                giocatore.img = modificheTemp.img;

                modificheTemp.img = null;
                refreshUsername();
                refreshIMG();
                errCambiaInfo.classList.add("hidden");
            }
            else {
                errCambiaInfo.classList.remove("hidden");
            }

        })
        .catch(error => {
            console.error('Errore invio api', error);
            errCambiaInfo.classList.remove("hidden");
        });

});