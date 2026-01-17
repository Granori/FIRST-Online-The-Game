class LobbyPlayer {


    constructor(id, username, pathImg, isHost) {
        this.id = id;
        this.username = username;
        this.pathImg = pathImg;
        this.isHost = isHost;
        this.socketId = null;
    }

    setSocket(socketId){
        this.socketId = socketId;
    }


    getPlayerInfo(){
        return {
            username: this.username,
            pathImg : this.pathImg,
            isHost : this.isHost,
        }
    }

}


export {LobbyPlayer}