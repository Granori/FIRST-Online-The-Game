const divIdStanza = document.getElementById("idStanza");
const formLeaveLobby = document.getElementById("formLeaveLobby")

const inpNomeStanza = document.getElementById("nomeStanza");
const numGiocatoriStanza = document.getElementById("giocatoriStanza");
const btnAvviaPartita = document.getElementById("avviaPartita");

const divGiocatori = document.getElementById("listGiocatori");
const listaGiocatori = divGiocatori.querySelectorAll("div");

const formChat = document.getElementById("chatForm");
const divChat = document.getElementById("chat");

const formAvvio = document.getElementById("formAvvio");

const lobbyId = sessionStorage.getItem("lobbyId");

class Player {
    constructor(username, pathImg) {
        this.username = username;
        this.pathImg = pathImg;
    }
}

const stanza = {
    id: null,
    nome: null,
    playersId: []
}

const giocatore = {
    username: "Tu",
    isHost: null
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
        stanza.playersId = data.players;

        inpNomeStanza.innerText = stanza.nome;
        numGiocatoriStanza.innerText = `${data.players.length}/4`;
        
        divIdStanza.innerText = stanza.id;
        caricaGiocatori(stanza.playersId);
    })
    .catch(error => {
        console.error('Non è stato possibile ottenere i dati degli utenti', error);
    });

const socket = io("/lobby", {
    withCredentials: true
});
socket.emit("joinLobby", lobbyId);

socket.on("lobbyUpdate", (messaggio) => {
    stanza.playersId = messaggio.players;
    caricaGiocatori(stanza.playersId);
});

socket.on("userJoin", (messaggio) => {
    console.log(messaggio)
});

// const messaggioObj = {
//     content: messaggio,
//     sender: {
//         id: socket.data.userId,
//         name: socket.data.username
//     },
//     timestamp: new Date().toISOString()
// };

socket.on("messaggio", (messaggio) => {
    caricaMessaggioArrivato(messaggio.sender.name, messaggio.content);
})

// Carica tutti i giocatori
async function caricaGiocatori(giocatoriId) {
    for (const giocatoreId of giocatoriId) {
        // Per ogni id ottengo le relative informazioni
        const g = await getInformazioniGiocatore(giocatoreId);

        if (g.username === giocatore.username) {
            giocatore.isHost = g.isHost;

            if (giocatore.isHost) {
                btnAvviaPartita.disabled = false;
            }
        }

        addGiocatore(g);
    }
}


async function getInformazioniGiocatore(giocatoreId) {
    try {
        const response = await fetch(`/api/user?${giocatoreId}`);
        const data = await response.json();

        return new Player(data.username, data.pathImg);
    } catch (error) {
        console.error("Non è stato possibile ottenere i dati dell'utente", error);
        return null;
    }
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

    socket.emit("disconnect", null);
    sessionStorage.clear();
    window.location.href = "hub.html";
})

formChat.addEventListener("submit", (e) => {
    e.stopPropagation();
    e.preventDefault();

    let messaggio = formChat.messaggio.value;

    if (messaggio.length <= 0) return;

    socket.emit(messaggio);
    caricaMessaggioInviato(messaggio);

    formChat.messaggio.value = "";
})

formAvvio.addEventListener("submit", (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (giocatore.isHost) {
        socket.emit("startGame", null);
    }
})