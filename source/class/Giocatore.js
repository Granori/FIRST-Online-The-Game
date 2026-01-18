export class Giocatore {
    constructor(idGiocatore) {
        this.id = idGiocatore;
        this.hasLoaded = false
    }

    loaded(){
        this.hasLoaded = true
        return this.hasLoaded
    }

    
    play(idCarta){

    }


    /**
     * Metodo che restituirà tutte le informazioni possibili sul giocatore giocante
     */
    toStringGiocatore(){

    }
    
    /**
     * Quello che i nemici vedranno di te
     */
    toStringOpponent(){

    }
}