import { ClientRequest, ServerResponse } from 'http';
import * as url from 'url';
import {Lobby} from './class/Lobby.js'
import { LobbyPlayer } from './class/LobbyPlayer.js'; 






let lobby = []
let partite = []





/**
 * @param {ClientRequest} request 
 * @param {ServerResponse} response
 * @param {String} pathname 
 * @param {import("jsonwebtoken").JwtPayload} decoded 
 */
function GameManager(request, response, decoded){
    //Ricevo la richiesta convalidata dalla api
    const urlObj = url.parse(request.url, true);
    /**
     * Tutte le lobby disponibili
     * 
     * 
     */
    switch (urlObj.pathname){
        case '/game/lobbies':
            //Nome
            //Id
            //Numero giocatori

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
                
                let player = new LobbyPlayer(decoded.id,)
                
            })
            
        case '/game/joinLobby?lobbyId=?':
            //true/false
            //Redirect a stanza
        
        case '/game/leaveLobby':

    }


}

export {GameManager}