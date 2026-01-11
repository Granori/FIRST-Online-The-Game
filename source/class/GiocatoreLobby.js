//Il giocatore nella lobby, prima di iniziare la partita
class GiocatoreLobby {
    constructor(username, socketId, isHost = false) {
        this.username = username;
        this.socketId = socketId;
        this.isHost = isHost;
    }

    getUsername() {
        return this.username;
    }
    getSocketId() {
        return this.socketId;
    }

    isHost() {
        return this.isHost;
    }

}

export { GiocatoreLobby }