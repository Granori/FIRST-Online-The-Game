const carteIniziali = 7

//Insieme di carte
class name {
    constructor() {
        this.carte = []
        this.carteIniziali = carteIniziali;

        //Popolare la lista
        this.inizializeMano();


        
    }

    inizializeMano(){
        for (let i = 0; i < carteIniziali; i++) {
            this.draw();
        }
    }

    draw(){
        
    }
}