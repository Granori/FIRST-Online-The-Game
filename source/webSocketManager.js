import {Server} from "socket.io"
import * as cookie from "cookie"
import { verifyToken } from "./tokenManager";
const options = {

}

/**
 * 
 * @param {import("http").Server} httpServer 
 */
function initializeServer(httpServer){
    const lobbyChat = new Server(httpServer,{
        path: "/socket.io/lobby",
        cors: {
            origin: ["https://example.com", "https://dev.example.com"],
            allowedHeaders: ["mode","lobbyId"],
            credentials: true
        }
    });

    lobbyChat.on("connection", (socket) => {
        const headers = socket.handshake.headers;
        if (headers["mode"] == "chat") {
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
                    socket.join(headers.lobbyId);

                    //Salvo tutto sul socket
                    socket.data.lobbyId = headers.lobbyId
                    socket.data.userId = decoded.id
                    socket.data.username = decoded.username



                    //Comunico l'ingresso in chat
                    lobbyChat.to(headers.lobbyId).except(socket.id).emit("userJoin", decoded.username)


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

                        // Inviamo a tutti (incluso il mittente)
                        io.emit("new_message", messaggioObj);
                        lobbyChat.to(headers.lobbyId).except(socket.id).emit("messaggio", messaggio)
                    })
                }

                
            }
        } else {
            //Logica del gioco da implementare
            socket.disconnect(true)
            
        }
        
    });





    
}