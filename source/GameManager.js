import { ClientRequest, ServerResponse } from 'http';
import * as url from 'url';

let partiteLobby = []
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
        case '/game/joinLobby?lobbyId=?':
            //true/false
            //Redirect a stanza
    }


}

export {GameManager}