const colori = ["rosso", "blu", "verde", "giallo", "jolly"];
const percentuali = [0.22, 0.22, 0.22, 0.22, 0.10]
const numeri = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "#2", "#stop", "#change"]
const jolly = ["#4, #colore"]

const comportamentoSpeciale = ["#2", "#stop", "#change", "#4, #colore"]


let idCarta = 0

export class Carta {
    constructor(numero, colore) {
        this.idCarta = idCarta
        idCarta += 1;
        this.numero = numero;
        this.colore = colore;
    }

    getNumero() {
        return this.numero;
    }

    getColore() {
        return this.colore;
    }
    toString() {
        return `Carta: ${this.numero}, ${this.colore}`;
    }

    /**
     * Genera una carta randomicamente
     * @returns {Carta} carta randomica
     */
    static generateCarta(){        

        let random = Math.random(); // Genera tra 0 e 1
        let cumulativo = 0;
        let coloreIndex = 0
        for (let i = 0; i < probabilities.length; i++) {
            cumulativo += probabilities[i];
            if (random < cumulativo) {
                coloreIndex = i;
                break;
            }
        }

        let colore = colori[coloreIndex]
        let numero = ""
        if (colore = "jolly"){
            //Generazione Jolly
            random = Math.floor(Math.random() * jolly.length);
            numero = jolly[random]
        } else {
            //Generazione colori standart
            random = Math.floor(Math.random() * numeri.length);
            numero = numeri[random]
        }
        
        return new Card(numero, colore)
        
    }

    /**
     * Metodo che restituirà cosa succederà una volta giocata quella carta
     * @param {Carta} latestCard 
     */
    play(latestCard){
        let objResult = {
            validMove: true,
            cardPlayed: this,
            additionalOperation: false,
            draw: 0,
            skip: false,
            reverse: false,
            jolly: false,
        }
        //Controllo se la mossa è valida
        if (this.colore == "jolly") {
            //Carta nera, sempre valida
            //TODO: validazione
            objResult.additionalOperation = true;
            objResult.jolly = true;

            if (this.numero == "#4") {
                objResult.draw = 4;
                objResult.skip = true;
            }
            
        }
        else if (this.colore in colori) {
            //Controllo se il colore o il numero sono coincidenti
            if ((this.colore == latestCard.colore) || (this.numero == latestCard.numero)) {
                //const numeri = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "#2", "#stop", "#change"]
                switch (this.numero){
                    case "#2":
                        objResult.additionalOperation = true;
                        objResult.skip = true;
                        objResult.draw = 2
                        break;
                    case "#stop":
                        objResult.additionalOperation = true;
                        objResult.skip = true;
                        break
                    case "#change":
                        objResult.additionalOperation = true;
                        objResult.reverse = true;
                    default:
                        break;
                }
            } else {
                objResult.validMove = false;
            }
        }
        return objResult;
    }
}


