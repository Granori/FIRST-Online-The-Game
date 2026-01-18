let lobbyProgressivo = 0

export class Lobby {

    constructor(name, hostId) {
        this.name = name

        //Id lobby
        this.lobbyId = lobbyProgressivo;
        lobbyProgressivo += 1

        //Giocatori
        this.players = []   //Lista di id di giocatori
        this.maxPlayer = 4

        

        //Id giocatore host
        this.hostId = hostId
        
    }

    canJoin(){
        if (this.players.length < this.maxPlayer) {
            return true
        } return false
    }

    addPlayer(userId) {
        if (this.canJoin()) {
            this.players.push(userId)
            return true
        } else {
            return false
        }
    }

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
            }
        }
        
        return result
    }

    promoteNewHost() {
        this.hostId = this.players[0]
    }

    start(requestingUserId) {
        if (this.hostId == requestingUserId) {
            //Logica per istanziare la partita
        }
    }
    

    isEmpty() {
        return this.players.size === 0;
    }

    toString() {
        return {
            nome: this.name,
            id: this.lobbyId,
            players: this.players.length
        }
    }

    snapshot() {
        return {
            id: this.lobbyId,
            hostId: this.hostId,
            players : this.players
        }
    }
}

