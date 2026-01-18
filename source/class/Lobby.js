let lobbyProgressivo = 0
import { EventEmitter } from "events";

/**
 * Lista statica di lobby
 */
export let lobby = []

/**
 * Classe Lobby
 */
export class Lobby extends EventEmitter {

    /**
     * 
     * @param {String} name 
     * @param {String} hostId 
     */
    constructor(name, hostId) {
        super();
        this.name = name

        //Id lobby
        this.lobbyId = lobbyProgressivo;
        lobbyProgressivo += 1

        //Giocatori
        this.players = []   //Lista di id di giocatori
        this.players
        this.maxPlayer = 4

        this.players.push(hostId)   //Aggiungo anche l'host alla lista di giocatori
        

        //Id giocatore host
        this.hostId = hostId
        
    }

    /**
     * Verifica se il giocatore può unirsi
     * @returns {boolean}
     */
    canJoin(){
        if (this.players.length < this.maxPlayer) {
            return true
        } return false
    }

    /**
     * Aggiunge il giocatore alla lobby
     * @param {String} userId Id giocatore da aggiungere
     * @returns {boolean}
     */
    addPlayer(userId) {
        if (this.players.find(player => player == userId)) {
            console.log("Il giocatore si è già unito alla lobby")
            return false;
        }
        if (this.canJoin()) {
            this.players.push(userId)
            this.emit("playerJoined", userId);
            return true
        } else {
            return false
        }
    }

    /**
     * Rimuove un giocatore dalla lobby
     * @param {String} userId Id giocatore da rimuovere
     * @returns {boolean}
     */
    removePlayer(userId) {
        let result = false

        let temp = []
        this.players.forEach(player => {
            if (player != userId) {
                temp.push(player)
            }
            else result = true
        });

        if (result) {
            //Se la lista cambia, cambio la lista della classe
            this.players = temp

            //Controllo se è host
            if (userId == this.hostId) {
                this.promoteNewHost()
            } else {
                this.emit("playerLeft", userId)
            }
        }
        
        return result
    }

    /**
     * Promuove un nuovo host se l'host abbandona la partita
     */
    promoteNewHost() {
        this.hostId = this.players[0]
        this.emit("hostChanged", this.hostId)
    }


    /**
     * Fa iniziare la partita
     * @param {String} requestingUserId 
     */
    start(requestingUserId) {
        if (this.hostId == requestingUserId) {
            //Logica per istanziare la partita
            const partita = 


            //Evento terminale
            this.emit("started")
        }
    }
    

    /**
     * Controlla se la partita è vuota
     * @returns {boolean}
     */
    isEmpty() {
        return this.players.size === 0;
    }

    destroy() {
        if (this.isEmpty()) {
            let tmp = []
            lobby.forEach(l => {
                if (this.lobbyId != l.lobbyId) {
                    tmp.push(l)
                }
            });

            lobby = tmp;

        }
    }

    toString() {
        return {
            nome: this.name,
            id: this.lobbyId,
            players: this.players.length,
            maxPlayers : this.maxPlayer
        }
    }

    snapshot() {
        return {
            nome: this.name,
            id: this.lobbyId,
            hostId: this.hostId,
            players : this.players
        }
    }
}

