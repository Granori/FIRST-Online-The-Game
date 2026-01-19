const cartaCentro = document.getElementById("cartaCentro");
const mazzoGiocatore = document.getElementById("mazzo");

const mazziOtherGiocatori = document.querySelectorAll("[data-pos]");

const lobbyId = sessionStorage.getItem("lobbyId");

const numTurno = document.getElementById("hTurno");

const mazzoPesca = document.getElementById("btnPesca");

const bgClassMap = {
    rosso: "bg-red-600",
    blu: "bg-blue-600",
    verde: "bg-green-600",
    giallo: "bg-yellow-600",
    jolly: "bg-black"
};
const textClassMap = {
    rosso: "text-red-600",
    blue: "text-blue-600",
    verde: "text-green-600",
    giallo: "text-yellow-600",
    jolly: "text-black"
};

class Carta {
    static idCarte = 0;
    constructor(numero, colore) {
        this.id = Carta.idCarte;
        Carta.idCarte++;

        this.numero = numero;
        this.colore = colore;
    }
}

const giocatore = {
    carte: [],
    canPlay: false
}


const socket = io("/partita", {
    withCredentials: true
});
socket.emit("joinPartita", lobbyId);

//TODO: Il socket restituisce lo snapshot della partita, quindi rifattorizzare
//TODO: Gestione ulteriori eventi
socket.on("update", (snapshot) => {
    numTurno.innerHTML = snapshot.turno;

    // Aggiorno informazioni del giocatore
    giocatore.canPlay = snapshot.canPlay;
    giocatore.carte = [];
    snapshot.you.mano.forEach(carta => {
        giocatore.carte.push(new Carta(carta.numero, carta.colore))
    })

    // Aggiorno informazioni degli altri giocatori
    snapshot.opponents.forEach(opponent => {
        aggiornaMazzoOtherGiocatore(opponent.id, opponent.numeroCarte);
    })

    cartaTurno = new Carta(snapshot.latestCard.numero, snapshot.latestCard.colore);
    caricaCartaTurno(cartaTurno);

    renderMazzo(giocatore.carte);
});


function renderMazzo(carte) {
    mazzoGiocatore.innerHTML = "";

    const count = carte.length;
    if (count === 0) return;

    const maxRotation = 22; // gradi
    const maxOverlap = 64;  // px
    const maxYOffset = 45;  // px

    carte.forEach((carta, i) => {
        // t va da -1 a +1
        const t = count === 1 ? 0 : (i / (count - 1)) * 2 - 1;

        // Rotazione progressiva
        const rotation = t * maxRotation;

        // Sovrapposizione costante
        const overlap = -maxOverlap;

        // Curva quadratica: perfettamente monotona
        const yOffset = (t * t) * maxYOffset;

        const bgClass = bgClassMap[carta.colore];
        const textClass = textClassMap[carta.colore];
        const elemento = `
            <div data-id="${carta.id}" data-colore="${carta.colore}" data-numero="${carta.numero}" 
                class="relative w-28 h-42 2xl:w-32 2xl:h-48 rounded-3xl text-white overflow-hidden border-4 border-white cursor-pointer hover:-translate-y-4 hover:scale-110 duration-200 ${bgClass}"
                style="
                    margin-left: ${i === 0 ? "0px" : `${overlap}px`};
                    transform: rotate(${rotation}deg) translateY(${yOffset}px);
                    transform-origin: 50% 85%;">

                <!-- bordo interno -->
                <div class="absolute inset-2 rounded-3xl ${bgClass}"></div>

                <!-- ovale centrale -->
                <div class="absolute inset-6 rounded-full bg-white/90 rotate-12 flex items-center justify-center">
                    <span class="text-6xl font-black -rotate-12 ${textClass}">
                        ${carta.numero}
                    </span>
                </div>

                <!-- numero in alto a sinistra -->
                <div class="absolute top-2 left-3">
                    <span class="text-xl font-bold">${carta.numero}</span>
                </div>

                <!-- numero in basso a destra (rovesciato) -->
                <div class="absolute bottom-2 right-3 rotate-180">
                    <span class="text-xl font-bold">${carta.numero}</span>
                </div>
            </div>
            `;

        mazzoGiocatore.innerHTML += elemento;
    });
}

function caricaCartaTurno(carta) {
    const bgClass = bgClassMap[carta.colore];
    const textClass = textClassMap[carta.colore];

    cartaCentro.innerHTML = `
        <div class="relative w-32 h-50 2xl:w-36 2xl:h-54 rounded-3xl ${bgClass} text-white overflow-hidden border-4 border-white opacity-0 scale-50 transition-all duration-300 ease-out">
          <!-- bordo interno -->
          <div class="absolute inset-2 rounded-3xl ${bgClass}"></div>

          <!-- ovale centrale -->
          <div class="absolute inset-6 rounded-full bg-white/90 rotate-12 flex items-center justify-center">
            <span class="text-6xl font-black ${textClass} -rotate-12"> ${carta.numero} </span>
          </div>

          <!-- numero in alto a sinistra -->
          <div class="absolute top-2 left-3">
            <span class="text-xl font-bold">${carta.numero}</span>
          </div>

          <!-- numero in basso a destra (rovesciato) -->
          <div class="absolute bottom-2 right-3 rotate-180">
            <span class="text-xl font-bold">${carta.numero}</span>
          </div>

        </div>`
    
    setTimeout(() => { 
        cartaCentro.firstElementChild.classList.remove("opacity-0", "scale-50"); 
    }, 10);
}

mazzoGiocatore.addEventListener("click", (e) => {
    const action = e.target.closest("[data-id]");
    if (!action) return;

    const id = action.dataset.id;
    const colore = action.dataset.colore;
    const numero = action.dataset.numero;

    if ((colore == cartaTurno.colore || numero == cartaTurno.numero || colore == "jolly") && giocatore.canPlay) {
        console.log("giocata");

        socket.emit("playCarta", id);

        giocatore.canPlay = false;
    }
    else console.log("non giocata");
})

mazzoPesca.addEventListener("click", (e) => {
    const action = e.target.closest("[data-action]");
    if (!action) return;

    socket.emit("drawCarta");
    giocatore.canPlay = false;
})

function getCartaDaID(idCarta) {
    for (const carta in giocatore.carte) {
        if (carta.id == idCarta) {
            return carta;
        }
    }
}

function rimuoviCartaDalMazzo(idCarta) {
    giocatore.carte = giocatore.carte.filter(carta => carta.id != idCarta);
}

function inizializzaMazzoGiocatore(idGiocatore, numCarte) {
    let mazzo = prendiPrimoMazzoLibero();
    mazzo.dataset.id = idGiocatore;
    mazzo.querySelector("span").innerHTML = numCarte;

    mazzo.classList.remove("hidden");
}

function prendiPrimoMazzoLibero() {
    for(const mazzoOther of mazziOtherGiocatori) {
        if (mazzoOther.classList.contains("hidden")) {
            return mazzoOther;
        }
    }
    return null;
}

function aggiornaMazzoOtherGiocatore(idGiocatore, numCarte) {
    // Cerco e aggiorno il num di carte del mazzo del giocatore specificato
    mazziOtherGiocatori.forEach(mazzo => {
        if (mazzo.dataset.idPlayer == idGiocatore) {
            mazzo.querySelector("span").innerHTML = numCarte;
            return;
        }
    })

    // Se non lo trovo, gli assegno un nuovo mazzo
    inizializzaMazzoGiocatore(idGiocatore, numCarte);
}