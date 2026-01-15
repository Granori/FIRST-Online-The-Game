const divGiocatori = document.getElementById("listGiocatori");
const listaGiocatori = divGiocatori.querySelectorAll("div");

const divChat = document.getElementById("chat");


class Giocatore {
    constructor(username, img) {
        this.username = username;
        this.img = img;
    }
}
// {
//     [
//         "username": "nome",
//         "img": "src"
//     ],
//     [
//         "username": "nome",
//         "img": "src"
//     ]
// }

// fetch('/api/stanza')
//     .then(response => response.json())
//     .then(data => {
//     })
//     .catch(error => {
//         console.error('Non è stato possibile ottenere i dati degli utenti', error);
// });

function addGiocatore(giocatore, pos) {
    let divGiocatore = listaGiocatori[pos];

    divGiocatore.classList.remove("hidden");
    divGiocatore.querySelector("img").src = giocatore.img;
    divGiocatore.querySelector("h2").innerText = giocatore.username;
}

addGiocatore(new Giocatore("nome", "./IMG/user.svg"), 0)


function caricaMessaggioArrivato(username, text) {
    let messaggio = document.createElement("div");

    messaggio = `
    <div>
        <p class="ms-1 font-semibold text-sm">${username}</p>
        <div class="bg-red-200 w-fit rounded-3xl rounded-ss-none p-1.5">${text}</div>
    </div>`

    divChat.innerHTML += messaggio
}
caricaMessaggioArrivato("Pippo", "Hello World!")

function caricaMessaggioInviato(text) {
    let messaggio = document.createElement("div");

    messaggio =  `
    <div class="text-right">
        <p class="me-1 font-semibold text-sm">
            Tu
        </p>
        <div class="bg-blue-400 w-fit ml-auto rounded-3xl rounded-se-none p-1.5">${text}</div>
    </div>`

    divChat.innerHTML += messaggio
}
caricaMessaggioInviato("Hello World!")