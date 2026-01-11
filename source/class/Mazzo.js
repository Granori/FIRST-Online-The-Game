import { Carta } from "./Carta"

const CARTE_INIZIALI = 7



class Mazzo {
    constructor() {
        this.carte = []
        this.popola()
        
    }

    popola(){
        for (let i = 0; i < 7; i++) {
            this.carte.push(Carta.generateCarta())
        }
    }

    pesca(){
        this.carte.push(Carta.generateCarta())
    }

}

export {Mazzo}