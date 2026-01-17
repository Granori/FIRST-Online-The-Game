import {LobbyPlayer} from "./LobbyPlayer.js"


class Lobby {
    //Id progressivo della lobby
    static lobbyId = 0


    /**
     * 
     * @param {Number} lobbyId 
     * @param {String} nome 
     * @param {LobbyPlayer} firstPlayer 
     */
    constructor(lobbyId, nome, firstPlayer) {
        this.lobbyId = Lobby.lobbyId;
        Lobby.lobbyId += 1;
        this.nome = nome;
        this.players = [firstPlayer]
    }

    getLobbyInfo(){
        let infoLobby =  {
            lobbyId : this.lobbyId,
            nome : this.nome,
            players : []
        }

        this.players.forEach(player => {
            infoLobby.players.push(player.getPlayerInfo())
        });
        


        return infoLobby
    }

}

export {Lobby}