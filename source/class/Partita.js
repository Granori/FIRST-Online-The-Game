import { Giocatore } from "./Giocatore.js";


export let partite = []

export class Partita {
    /**
     * Crea una partita a partire da una lobby già creata
     * @param {*} idPartita 
     * @param {[String]} giocatori 
     */
    constructor(idPartita, giocatori) {
        this.id = idPartita
        this.giocatori = []
        
        giocatori.forEach(giocatore => {
            this.giocatori.push(new Giocatore(giocatore))
        })

        //Lista dei giocatori creata
    }
}