import { Carta } from "./Carta.js";
import { Mano } from "./Mano.js";


export class Giocatore {
    constructor(idGiocatore) {
        this.id = idGiocatore;
        this.mano = new Mano();
    }

    /**
     * 
     * @param {*} idCarta 
     * @param {Carta} latestCard 
     */
    play(idCarta, latestCard){
        return this.mano.play(idCarta, latestCard)
    }

    draw(numero = 1){
        for (let i = 0; i < array.length; i++) {
            this.mano.draw()
        }
    }


    /**
     * Metodo che restituirà tutte le informazioni possibili sul giocatore giocante
     */
    toStringGiocatore(){
        return {
            id: this.id,
            mano : this.mano.carte
        }
    }
    
    /**
     * Quello che i nemici vedranno del giocatore
     */
    toStringOpponent(){
        return {
            id: this.id,
            numeroCarte: this.mano.carte.length
        }
    }
}