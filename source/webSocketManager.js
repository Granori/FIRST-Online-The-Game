import {Server} from "socket.io"
import * as cookie from "cookie"
import { verifyToken } from "./tokenManager.js";

import * as lobby from './class/Lobby.js'

let io

/**
 * 
 * @param {import("http").Server} httpServer 
 */
function initializeServer(httpServer){
    io = new Server(httpServer,{
        cors: {
            credentials: true
        }
    });

    io.use((socket, next) => {
        //Middleware per gestire la verifica del token dal cookie
        const headers = socket.handshake.headers;
        let cookies = cookie.parse(headers.cookie);
        const token = cookies['auth_token'];
        const decoded = verifyToken(token)
        if (!decoded) {
            console.log("Verifica token fallita")
        } else {
            console.log("Verifica token riuscita per user " + decoded.username)
        }

        socket.data.id = decoded.id
        socket.data.username = decoded.username

        next()
    })

    const lobbySpace = io.of("/lobby")

    

    lobbySpace.on("connection", (socket) => {
        socket.on("joinLobby", (lobbyId) => {
            console.log(`${socket.data.username} con id ${socket.data.id} vuole unirsi alla lobby con id ${lobbyId}`)

            //I giocatori sono già stati assegnati alla stanza precedentemente
            //L'unione della classe è già avvenuta precedentemente
            
            //Faccio solo un controllo di autenticità
            const foundLobby = lobby.lobby.find(lobby => lobby.lobbyId === lobbyId);
            if (!foundLobby) {
                let e = "Lobby non trovata"
                console.log(e);
                socket.emit("joinFailed", e);
                return;
            }

            //Lobby trovata, controllo se il giocatore si è unito a questa lobby
            const foundPlayer = foundLobby.players.find(player => player == socket)

            if (!foundPlayer) {
                let e = "Giocatore non in lobby"
                console.log(socket.data.username + " non in lobby " + foundLobby.name)
                socket.emit("joinFailed", e);
                return;
            }


            //Controllo effettuato, l'userId fa parte della lobby

            socket.join(lobbyId);
            socket.data.lobbyId = lobbyId;

            lobbySpace.to(lobbyId).emit("lobbyUpdate", lobby.snapshot());

            const update = () => lobbySpace.to(lobbyId).emit("lobbyUpdate", lobby.snapshot());

            foundLobby.on("playerJoined", update);
            foundLobby.on("playerLeft", update);
            foundLobby.on("hostChanged", update);
            foundLobby.on("started", () =>
                lobbySpace.to(lobbyId).emit("start")
            );

            
            socket.on("startGame", () => {
                foundLobby.start(socket.data.id);
            });

            socket.on("disconnect", () => {
                foundLobby.removePlayer(socket.data.id);
                if (foundLobby.isEmpty()) {
                    foundLobby.destroy()
                }
            })
    })
})


    /*
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
        
    });*/
}

export {initializeServer, io as lobbyChat}