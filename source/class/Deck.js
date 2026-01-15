import { Card }from "./Card"

const CARTE_INIZIALI = 7



class Deck {
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
        let carta = Card.generateCarta()
        this.carte.push(carta)
        
    }

}

export {Deck}