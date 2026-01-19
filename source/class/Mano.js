import { Carta } from "./Carta.js";

const carteIniziali = 7

//Insieme di carte
export class Mano {
    constructor() {
        this.carte = []
        this.carteIniziali = carteIniziali;

        //Popolare la lista
        this.inizializeMano();


        
    }

    inizializeMano(){
        for (let i = 0; i < this.carteIniziali; i++) {
            this.draw();
        }
    }

    draw(){
        this.carte.push(Carta.generateCarta())
    }
    
    carteRimanenti(){
        return this.carte.length;
    }

    /**
     * 
     * @param {*} idCarta 
     * @param {Carta} latestCard 
     */
    play(idCarta, latestCard){
        //Controllo se la mano ha la carta in questione
        const findCarta = this.carte.find(carta => carta.idCarta == idCarta)
        if (findCarta == undefined)
            return { validMove: false };
        const objResult = findCarta.play(latestCard)

        //Rimuovo la carta dal mazzo
        if (objResult.validMove) {
            this.removeCarta(idCarta)
        }
        return objResult;
        

    }

    removeCarta(idCarta) {
        let tmp = []
        this.carte.forEach(carta => {
            if (carta.idCarta != idCarta) {
                tmp.push(carta)
            }
        });
        this.carte = tmp;

    }
}