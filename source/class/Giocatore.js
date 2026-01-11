class Giocatore {
    constructor(username, socketId) {
        this.username = username;
        this.socketId = socketId;
        this.mazzo = new Mazzo();
    }
}

export { Giocatore }