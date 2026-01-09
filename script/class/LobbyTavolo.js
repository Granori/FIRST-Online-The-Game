class LobbyTavolo {
    constructor(idTavolo, nomeTavolo, maxGiocatori, password = null) {
        this.idTavolo = idTavolo;
        this.nomeTavolo = nomeTavolo;
        this.maxGiocatori = maxGiocatori;
        this.password = password;
        this.giocatori = [];
    }

    aggiungiGiocatore(giocatoreLobby) {
        if (this.giocatori.length < this.maxGiocatori) {
            this.giocatori.push(giocatoreLobby);
            return true;
        } else {
            return false;
        }
    }

    giocatoriPresenti() {
        return this.giocatori.length;
    }
}

export { LobbyTavolo }