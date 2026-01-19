import {Server} from "socket.io"
import * as cookie from "cookie"
import { verifyToken } from "./tokenManager.js";

import * as lobby from './class/Lobby.js'
import * as partite from './class/Partita.js'

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

    

    const lobbySpace = io.of("/lobby")

    lobbySpace.use((socket, next) => middlewareVerifyToken(socket, next))

    lobbySpace.on("connection", (socket) => {
        socket.on("joinLobby", (lobbyId) => {
            console.log(`${socket.data.username} con id ${socket.data.id} vuole unirsi alla lobby con id ${lobbyId}`)

            //I giocatori sono già stati assegnati alla stanza precedentemente
            //L'unione della classe è già avvenuta precedentemente
            
            //Faccio solo un controllo di autenticità
            console.log(lobby.lobby)
            const foundLobby = lobby.lobby.find(l => l.lobbyId == lobbyId);
            if (foundLobby == undefined) {
                let e = "Lobby non trovata"
                console.log(e);
                socket.emit("joinFailed", e);
                socket.disconnect(true)
                return;
            }

            //Lobby trovata, controllo se il giocatore si è unito a questa lobby
            const foundPlayer = foundLobby.players.find(player => player == socket.data.id);

            if (foundPlayer == undefined) {
                let e = "Giocatore non in lobby"
                console.log(socket.data.username + " non in lobby " + foundLobby.name)
                socket.emit("joinFailed", e);
                socket.disconnect(true);
                return;
            }


            //Controllo effettuato, l'userId fa parte della lobby

            socket.join(lobbyId);
            socket.data.lobbyId = lobbyId;
            socket.to(lobbyId).emit("userJoin", socket.data.username)

            lobbySpace.to(lobbyId).emit("lobbyUpdate", foundLobby.snapshot());

            const update = () => lobbySpace.to(lobbyId).emit("lobbyUpdate", foundLobby.snapshot());

            foundLobby.on("playerJoined", update);
            foundLobby.on("playerLeft", update);
            foundLobby.on("hostChanged", update);
            foundLobby.on("started", () =>
                lobbySpace.to(lobbyId).emit("start")
            );

            socket.on("sendMessaggio", (messaggio) => {
                
                socket.to(lobbyId).except(socket.id).emit("messaggio", socket.data.username, messaggio)
            })

            
            socket.on("startGame", () => {
                foundLobby.start(socket.data.id);
            });

            socket.on("disconnect", () => {
                console.log('\x1b[36m%s\x1b[0m', `Il giocatore ${socket.data.username} ha abbandonato la lobby N°${socket.data.lobbyId}`)
                console.log('\x1b[36m%s\x1b[0m', JSON.stringify(foundLobby))
                foundLobby.removePlayer(socket.data.id);
                console.log('\x1b[36m%s\x1b[0m', JSON.stringify(foundLobby))
                if (foundLobby.isEmpty()) {
                    foundLobby.destroy()
                }
                socket.disconnect(true)
            })
        })
    })

    const partitaSpace = io.of("/partita")

    partitaSpace.use((socket, next) => middlewareVerifyToken(socket, next))
    
    partitaSpace.on("connection", (socket) => {
        socket.on("joinPartita", (idPartita) =>{
            console.log(`${socket.data.username} con id ${socket.data.id} vuole unirsi alla lobby con id ${idPartita}`)

            //I giocatori sono già stati assegnati alla partita precedentemente

            //Faccio solo un controllo di autenticità
            
            console.log(partite.partite)
            
            
            
            const foundPartita = partite.partite.find(partita => partita.idPartita = idPartita);
            if (foundPartita == undefined) {
                let e = "Partita non trovata"
                console.log(e);
                socket.emit("joinFailed", e);
                socket.disconnect(true);
                return;
            }

            //Partita trovata, controllo se il giocatore si è unito a questa partita
            const foundPlayer = foundPartita.giocatori.find(giocatore => giocatore.id == socket.data.id);

            if (foundPlayer == undefined) {
                let e = "Giocatore non in partita"
                console.log(socket.data.username + " non in partita " + foundPartita.name)
                socket.emit("joinFailed", e);
                socket.disconnect(true);
                return;
            }

            //Controllo effettuato, l'userId fa parte della lobby
            socket.join(idPartita);
            socket.data.idPartita = idPartita;

            //Avviso il gioco che il giocatore ha caricato
            foundPartita.emit("userJoin")

            const update = async () => {
                // Esempio per ottenere tutti i socket nella stanza
                const sockets =  await partitaSpace.in(idPartita).fetchSockets();

                for (const socket of sockets) {
                    socket.emit("update", foundPartita.snapshot(socket.data.id))
                }

            }

            socket.on("drawCarta", () => {
                const giocatore = foundPartita.findPlayer()
                giocatore.draw()
                update()
            })
            
            socket.on("playCarta", (idCartaGiocata) => {
                const result = foundPartita.play(socket.data.id, idCartaGiocata)
                if (!result) {
                    let e = "Mossa non valida"
                    socket.emit("invalidMove", e)
                }
                //Il true viene gestito dall'update
            })
            
            foundPartita.on("cardPlayed", update)
            foundPartita.on("userJoinPartita", update)
            foundPartita.on("requestJollyColor", () => {
                socket.data.pendingColorChange = true
                socket.emit("requestJollyColor")
                update()
            })
            foundPartita.on("nextTurno", update)

            socket.on("jollyColor", (color) => {
                if (socket.data.pendingColorChange) {
                    socket.data.pendingColorChange = false
                    foundPartita.emit("jollyColor", color)
                }
            })


        })
        

    })




}

function middlewareVerifyToken(socket, next){
        //Middleware per gestire la verifica del token dal cookie
        
        const headers = socket.handshake.headers;
        let cookies = cookie.parse(headers.cookie);
        console.log(headers)
        console.log(cookies)
        const token = cookies['auth_token'];
        console.log(token)
        const decoded = verifyToken(token)
        console.log(decoded)
        if (!decoded) {
            console.log("Verifica token fallita")
            socket.disconnect(true)
            return

        } else {
            console.log("Verifica token riuscita per user " + decoded.username)
        }

        socket.data.id = decoded.id
        socket.data.username = decoded.username

        next()
    }

export {initializeServer, io as lobbyChat}