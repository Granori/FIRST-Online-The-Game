const colori = ["rosso", "blu", "verde", "giallo", "jolly"];
const percentuali = [0.22, 0.22, 0.22, 0.22, 0.10]
const numeri = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "#2", "#stop", "#change"]
const jolly = ["#4, #colore"]


class Carta {
    constructor(numero, colore) {
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
        if (colore = colori[4]){
            //Generazione Jolly
            random = Math.floor(Math.random() * jolly.length);
            numero = jolly[random]
        } else {
            //Generazione colori standart
            random = Math.floor(Math.random() * numeri.length);
            numero = numeri[random]
        }
        
        return new Carta(numero, colore)
        
    }


}

export {Carta}