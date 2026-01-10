import * as qs from 'querystring';
import * as url from 'url';

import * as cookie from 'cookie';

import { ClientRequest, ServerResponse } from 'http';
import { db, insertUser, getUserByUsername } from './dbManager.js';
import { generateToken, verifyToken } from './tokenManager.js';
import { hashPassword, comparePassword } from './passwordManager.js';







/**
 * Route manager per le API
 * @param {ClientRequest} request 
 * @param {ServerResponse} response 
 * @returns 
 */
async function API_manager(request, response){
    const urlObj = url.parse(request.url, true);

    if (urlObj.pathname === '/api/login') {
        return loginHandler(request, response);
    } else if (urlObj.pathname === '/api/register') {
        return registerHandler(request, response);
    } else if (urlObj.pathname === '/api') {
        // Default route (Not Found)
        response.writeHead(404, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: 'Route not found' }));
    } else {
        // Tutte le altre rotte API richiedono autenticazione
        var cookies = cookie.parse(request.headers.cookie || "");
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
            default:
                response.writeHead(404, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ message: 'Route not found' }));
                return;
        }

    }

}


async function loginHandler(request, response) {
    //Gestione login
    //Tentativo di login

    //Richiesta POST
    let body = '';
    request.on('data', (chunk) => {
        console.log('Ricevuto chunk di dati: ' + chunk);
        body += chunk;
    });
    request.on('end', async () => {
        console.log('Body ricevuto: ' + body);
        const data = qs.parse(body);
        console.log("Tentativo di login per utente: " + data.username);
        const user = getUserByUsername.get(data.username);
        if (!user) {
            //Utente non trovato
            response.writeHead(401, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ message: 'Utente non trovato' }));
            return;
        } else {
            //Utente trovato, verifico password
            let passwordMatch = await comparePassword(data.password, user.password_hash);
            if (!passwordMatch) {
                //Password errata
                response.writeHead(401, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ login: false, message: 'Utente o password errati' }));
                return;
            } else {
                //Login riuscito, genero token
                const token = await generateToken(user.id, user.username);
                
                //Genero cookie con la libreria cookie
                const cookieAuth = cookie.serialize('auth_token', token, {
                    httpOnly: true,
                    secure: false, // Non uso https in locale
                    sameSite: 'lax',
                    maxAge: 2 * 60 * 60, // 2 ore
                });
                response.setHeader('Set-Cookie', cookieAuth);
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ login: true, message: 'Login riuscito' , username: user.username}));
                return;
            }
        }});
}


async function registerHandler(request, response) {
    //Gestione registrazione nuovo utente
    //Richiesta POST
    let body = '';
    request.on('data', (chunk) => {
        console.log('Ricevuto chunk di dati: ' + chunk);
        body += chunk;
    });
    request.on('end', async () => {
        console.log('Body ricevuto: ' + body);
        const data = qs.parse(body);
        //Registrazione nuovo utente
        console.log("Tentativo di registrazione per utente: " + data.username);
        const user = getUserByUsername.get(data.username);
        if (user) {
            //Utente già esistente
            response.writeHead(409, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ register: false, message: 'Username già in uso' }));
            return;
        } else {
            //Controllo username e password validi
            //Username e password non vuoti, username con meno di 20 caratteri e password almeno 6 caratteri
            if (!data.username || !data.password || data.password.length < 6 || data.username.length > 20) {
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ register: false, message: 'Username o password non validi (min 6 caratteri, max 20 per username)' }));
                return;
            }


            //Creo nuovo utente
            const passwordHash = await hashPassword(data.password);
            insertUser.run(data.username, passwordHash);
            response.writeHead(201, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ register: true, message: 'Utente registrato con successo' }));
            return;
        }});
}




export { API_manager };