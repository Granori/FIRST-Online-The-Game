import * as qs from 'querystring';
import * as url from 'url';

import * as cookie from 'cookie';

import * as db from './dbManager.js';
import { ClientRequest, ServerResponse } from 'http';
import { generateToken, verifyToken } from './tokenManager.js';
import * as auth from './authenticationHandler.js';







/**
 * Route manager per le API
 * @param {ClientRequest} request 
 * @param {ServerResponse} response 
 * @returns 
 */
async function API_manager(request, response){
    const urlObj = url.parse(request.url, true);

    if (urlObj.pathname === '/api/login') {
        return auth.loginHandler(request, response);
    } else if (urlObj.pathname === '/api/register') {
        return auth.registerHandler(request, response);
    } else if (urlObj.pathname === '/api/disconnect') {
        return auth.disconnectHandler(request, response);   //Fa redirect alla pagina login.html invalidando il cookie
    } else if (urlObj.pathname === '/api') {
        // Default route (Not Found)
        response.writeHead(404, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: 'Route not found' }));
    } else {
        // Tutte le altre rotte API richiedono autenticazione
        let cookies = cookie.parse(request.headers.cookie || "");
        const token = cookies['auth_token'];
        if (!token) {
            response.writeHead(401, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ token_valid: false, message: 'Unauthorized: No token provided' }));
            return;
        }
        const decoded = await verifyToken(token);
        if (decoded == null) {
            response.writeHead(401, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ token_valid: false, message: 'Unauthorized: Invalid token' }));
            return;
        }
        //Token valido

        switch (urlObj.pathname) {
            //Aggiungere qui le altre rotte API protette
            case '/api/validate_token':
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ token_valid: true, message: 'Token valido', user: {id: decoded.id, username: decoded.username} }));
                return;
            case '/api/user':
                // Restituisco le informazioni dell'utente
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ user: {id: decoded.id, username: decoded.username} }));
                return;
            case '/api/user/:id_utente':
                // Estrai l'ID dall'URL
                const idUtente = urlObj.pathname.split('/').pop();
                const infoUtente = db.getUserById.get(idUtente);
                if (!infoUtente) {
                    // Utente non trovato
                    response.writeHead(404, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ message: 'Utente non trovato' }));
                    return;
                }
                // Restituisco le informazioni dell'utente
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ user: { id: idUtente, username: infoUtente.username } }));
                return;

            default:
                response.writeHead(404, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ message: 'Route not found' }));
                return;
        }

    }

}







export { API_manager };