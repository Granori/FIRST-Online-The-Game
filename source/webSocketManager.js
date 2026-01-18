import {Server} from "socket.io"
import * as cookie from "cookie"
import { verifyToken } from "./tokenManager.js";
const options = {

}

let lobbyChat

/**
 * 
 * @param {import("http").Server} httpServer 
 */
function initializeServer(httpServer){
    lobbyChat = new Server(httpServer,{
        path: "/socket.io/lobby",
        cors: {
            allowedHeaders: ["mode","lobbyId"],
            credentials: true
        }
    });

    lobbyChat.on("connection", (socket) => {
        const headers = socket.handshake.headers;
        if (headers["mode"] == "lobby") {
            if (socket.recovered) {
                //Riconnessione
                
            } else {
                //Prima connessione
                
                let cookies = cookie.parse(headers.cookie);
                const token = cookies['auth_token'];
                const decoded = verifyToken(token)
                if (!decoded) {
                    socket.disconnect(true)
                } else {
                    console.log(headers);

                    //Aggiungo il socket alla stanza
                    socket.join(headers.lobbyId);

                    //Salvo tutto sul socket
                    socket.data.lobbyId = headers.lobbyId
                    socket.data.userId = decoded.id
                    socket.data.username = decoded.username


                    //TODO: inviare lista giocatori nella stanza a chi è appena entrato (isHost)
                    //socket.emit()

                    //Comunico l'ingresso in chat
                    lobbyChat.to(headers.lobbyId).emit("userJoin", decoded.username)


                    //Associo event Listener
                    socket.on("invia", (messaggio) => {

                        const messaggioObj = {
                            content: messaggio,
                            sender: {
                                id: socket.data.userId,
                                name: socket.data.username
                            },
                            timestamp: new Date().toISOString()
                        };

                        // Inviamo a tutti (escluso il mittente)
                        lobbyChat.to(headers.lobbyId).except(socket.id).emit("messaggio", messaggioObj)
                    })
                }

                
            }
        } else {
            //Logica del gioco da implementare
            socket.disconnect(true)
            
        }
        
    });
}

export {initializeServer, lobbyChat}