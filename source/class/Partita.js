import { Giocatore } from "./Giocatore.js";
import { EventEmitter } from "events";

export let partite = []

export class Partita extends EventEmitter {
    /**
     * Crea una partita a partire da una lobby già creata
     * @param {*} idPartita 
     * @param {[String]} giocatori 
     */
    constructor(idPartita, nomePartita, giocatori) {
        this.id = idPartita
        this.name = nomePartita
        this.giocatori = []
        
        giocatori.forEach(giocatore => {
            this.giocatori.push(new Giocatore(giocatore))
        })
        

        //Lista dei giocatori creata
        //I mazzi sono stati inizializzati
        //Attendo i giocatori
        this.playerLoaded = 0
        this.on("userJoin", (userId) =>{
            this.playerLoaded += 1
            this.emit("userJoinPartita", null)
        })

        //Variabili della logica del gioco
        this.turno = 0
        this.verso = +1; //-1 per senso opposto
        this.latestCard = null
        this.canplay = true     //Ci sono alcune carte che richiedono un input aggiuntivo prima di continuare il gioco
        this.objrisposta = null


        //Event Handler
        this.on("jollyColor", (color) => {
            //Ho il colore del prossimo jolly
            this.latestCard.color = color;


            this.canplay = true;
        })
    }

    canPlay() {
        return (this.playerLoaded == this.giocatori.length) && this.canplay
    }

    addTurno(numeroTurni = 1){
        this.turno = (this.turno + numeroTurni)%this.giocatori.length
    }

    findPlayer(turniGap = 0){
        let indexPlayer = (this.turno + turniGap)%this.giocatori.length
        if (indexPlayer == -1) {
            indexPlayer = this.giocatori.length - 1
        }
        return this.giocatori[indexPlayer]
    }

    /**
     * Metodo per giocare una carta in una partita
     * @param {*} idGiocatore 
     * @param {*} idCarta 
     * @returns {boolean}
     */
    play(idGiocatore, idCarta) {
        const findGiocatore = this.giocatori.find(g => g.id == idGiocatore)
        
        if (findGiocatore == undefined) {
            
            return false
        }

        const indexGiocatore = this.giocatori.findIndex(g => g == findGiocatore)

        if (indexGiocatore != this.turno) {
            return false
        }

        const objRisposta = findGiocatore.play(idCarta, this.latestCard)
        
        //Gestione della risposta
        /*
        let objResult = {
            validMove: true,
            cardPlayed: {},
            additionalOperation: false,
            draw: 0,
            skip: false,
            reverse: false,
            jolly: false,
        }
        */
        if (objRisposta.validMove) {
            //Mossa valida
            if (objRisposta.additionalOperation){
                //Sono richieste operazioni aggiuntive
                if (objRisposta.jolly) {
                    //I jolly sovrascrivono la logica
                    this.canplay = false;   //Blocco le prossime azioni
                    this.latestCard = objRisposta.cardPlayed
                    this.objrisposta = objRisposta  //Salvo l'obj per le future azioni
                    this.emit("requestJollyColor")  //Chiedo il colore a cui cambiare
                    return
                }
                if (objRisposta.draw) {
                    //Devo trovare il giocatore alla posizione del turno successivo (in base al verso)
                    const giocatoreSuccessivo = this.findPlayer(this.verso)
                    giocatoreSuccessivo.draw
                }
                //Skip turno gestito più avanti
                if (objRisposta.reverse) {
                    //Inverti la direzione del gioco
                    this.verso = -(this.verso)
                }
            }
            this.latestCard = objRisposta.cardPlayed
            this.emit("cardPlayed")
            nextTurno(objRisposta.skip) //Gestisco lo skip direttamente nel turno
            return true
        } else return false

    }

    nextTurno(skip = true){
        this.turno = (this.turno + (skip ? this.verso : this.verso*2))%this.giocatori.length
        if (this.turno == -1) { //Senso inverso
            this.turno = this.giocatori.length - 1
        }
        this.emit("nextTurno")
    }

    snapshot(idGiocatore){
        let objRisultato = {
            canPlay: this.canPlay(),
            idGiocatoreTurno : (this.findPlayer()).id,
            turno: this.turno,
            verso: this.verso,
            latestCard: this.latestCard,
            you: {},        //Output di toStringGiocatore() in Giocatore
            opponents: []   //Lista di toStringOpponent() in Giocatore
        }

        let you;
        let opponents = []

        this.giocatori.forEach(giocatore => {
            if (giocatore.id == idGiocatore) {
                you = giocatore
            } else {
                opponents.push(giocatore)
            }
        });

        objRisultato.you = you.toStringGiocatore();
        opponents.forEach(opponent => {
            objRisultato.opponents.push(opponent.toStringOpponent())
        });

        return objRisultato;

    }

}