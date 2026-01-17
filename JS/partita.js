const cartaCentro = document.getElementById("cartaCentro");
const mazzoGiocatore = document.getElementById("mazzo");

const bgClassMap = {
    red: "bg-red-600",
    blue: "bg-blue-600",
    green: "bg-green-600",
    yellow: "bg-yellow-600",
};
const textClassMap = {
    red: "text-red-600",
    blue: "text-blue-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
};

class Carta {
    constructor(numero, colore) {
        this.numero = numero;
        this.colore = colore;
    }
}

const cartaTurno = new Carta(8, "blue");

renderMazzo([new Carta(1, "yellow"), new Carta(2, "green"), new Carta(3, "blue"), new Carta(4, "red"), new Carta(1, "yellow"), new Carta(2, "green"), new Carta(3, "blue"), new Carta(4, "red")]);
caricaCartaTurno(cartaTurno)



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
            <div data-colore="${carta.colore}" data-numero="${carta.numero}" 
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
        <div class="relative w-32 h-50 2xl:w-36 2xl:h-54 rounded-3xl ${bgClass} text-white overflow-hidden border-4 border-white">
          <!-- bordo interno -->
          <div class="absolute inset-2 rounded-3xl ${bgClass}"></div>

          <!-- ovale centrale -->
          <div class="absolute inset-6 rounded-full bg-white/90 rotate-12 flex items-center justify-center">
            <span class="text-6xl font-black text-${carta.colore}-600 -rotate-12"> ${carta.numero} </span>
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
}

mazzoGiocatore.addEventListener("click", (e) => {
    const action = e.target.closest("[data-numero]");
    if (!action) return;

    const colore = action.dataset.colore;
    const numero = action.dataset.numero;

    if (colore == cartaTurno.colore || numero == cartaTurno.numero) console.log("giocata")
    else console.log("non giocata");
})