import { ClientRequest, ServerResponse } from 'http';
import * as url from 'url';
import {lobby, Lobby} from './class/Lobby.js'



/**
 * @param {ClientRequest} request 
 * @param {ServerResponse} response
 * @param {String} pathname 
 * @param {import("jsonwebtoken").JwtPayload} decoded 
 */
function RequestManager(request, response, decoded){
    //Ricevo la richiesta convalidata dalla api
    const urlObj = url.parse(request.url, true);
    /**
     * Tutte le lobby disponibili
     * 
     * 
     */
    switch (urlObj.pathname){
        case '/game/lobbies':
            console.log("Richiesta di tutte le lobby")
            let result = []
            lobby.forEach(l => {
                result.push(l.toString())
                //Nome
                //Id
                //Numero giocatori
            });
            console.log(JSON.stringify(result))
            response.writeHead(200, {'content-type': 'application/json'})
            response.end(JSON.stringify(result))
            return


        //Ritorna il lobbyID se la creazione è stata effettuata con successo
        case '/game/createLobby':
            //Post
            //Richiesta POST
            let body = '';
            request.on('data', (chunk) => {
                body += chunk;
            });
            request.on('end', async () =>{
                const data = JSON.parse(body)
                const nomeLobby = data.nome

                const nuovaLobby = new Lobby(nomeLobby, decoded.id)

                const lobbyId = nuovaLobby.lobbyId
                
                lobby.push(nuovaLobby)

                response.writeHead(201, {'content-type': 'application/json'})
                response.end(JSON.stringify({
                    lobbyId : lobbyId
                }))
                console.log("Lobby creata con successo e risposta inviata")
                return
                
            })
            return
            
        case '/game/joinLobby':
            //true/false
            //Redirect a stanza
            console.log(`${decoded.username} vuole unirsi alla lobby`)

            const lobbyId = urlObj.query.lobbyId
            let found = null

            lobby.forEach(l => {
                if (l.lobbyId == lobbyId) {
                    found = l;
                }
            });

            if (found == null) {
                //LobbyId non trovato
                console.log("Lobby non trovata")
                response.writeHead(409, {'content-type': 'application/json'})
                response.end(JSON.stringify({
                    canJoin: false,
                    lobbyId : null
                }))

                return 
            }

            //Lobby trovata

            //Provo ad unirmi
            let tmp = found.addPlayer(decoded.id)

            if (!tmp) {
                //Unione non riuscita
                console.log("Unione non riuscita")
                response.writeHead(409, {'content-type': 'application/json'})
                response.end(JSON.stringify({
                    canJoin: false,
                    lobbyId : null
                }))
                return
            }

            //Mi sono ufficialmente unito
            response.writeHead(200, {'content-type': 'application/json'})
            response.end(JSON.stringify({
                canJoin: true,
                lobbyId : lobbyId
            }))

            console.log("Lobby unita con successo e risposta inviata")
            return

    }


}

export { RequestManager}