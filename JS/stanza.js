const divIdStanza = document.getElementById("idStanza");
const formLeaveLobby = document.getElementById("formLeaveLobby")

const divGiocatori = document.getElementById("listGiocatori");
const listaGiocatori = divGiocatori.querySelectorAll("div");

const divChat = document.getElementById("chat");

const stanza = {
    id: null,
    nome: null
}

const giocatore = {
    username: "Tu",
    ishost: null
}

fetch('/api/user')
    .then(response => response.json())
    .then(data => {
        giocatore.username = data.user.username;
    })
    .catch(error => {
        console.error('Non è stato possibile ottenere i dati utente', error);
    });


fetch('/api/stanza')
    .then(response => response.json())
    .then(data => {
        stanza.id = data.lobbyId;
        stanza.nome = data.nome;
        
        divIdStanza.innerText = stanza.id;
        caricaGiocatori(data.players);
    })
    .catch(error => {
        console.error('Non è stato possibile ottenere i dati degli utenti', error);
});

const socket = io();

// Gestione chat

function caricaGiocatori(giocatori) {
    giocatori.forEach(g => {
        if (g.username === giocatore.username) {
            giocatore.ishost = g.isHost;
        }

        addGiocatore(g);
    });
}

function addGiocatore(g) {
    divGiocatori.innerHTML += `
        <div class="hidden rounded-lg p-6 text-center">
            <img src="${g.pathImg}" alt="Profilo" class="w-45 h-45 rounded-full mx-auto mb-4 object-cover"/>

            <h2 class="text-xl font-semibold text-gray-800">${g.username}</h2>

        </div>`
}

function caricaMessaggioArrivato(username, text) {
    let messaggio = document.createElement("div");

    messaggio = `
    <div>
        <p class="ms-1 font-semibold text-sm">${username}</p>
        <div class="bg-red-200 w-fit rounded-3xl rounded-ss-none p-1.5">${text}</div>
    </div>`

    divChat.innerHTML += messaggio
}

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

formLeaveLobby.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();

    fetch('/game/leaveLobby', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "idLobby": stanza.id
        })
    })
        .catch(error => {
            console.error('Errore uscita dalla lobby', error);
        });
})