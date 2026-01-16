import * as cookie from 'cookie';

import { ClientRequest, ServerResponse } from 'http';
import {insertUser, getUserByUsername } from './dbManager.js';
import { generateToken} from './tokenManager.js';
import { hashPassword, comparePassword } from './passwordManager.js';


const regexUsername = /^.{5,20}$$/
const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[~!@#$%^&*]).{8,}$/
/**
 * Handler per il login
 * @param {ClientRequest} request 
 * @param {ServerResponse} response 
 */
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
        const data = JSON.parse(body)
        console.log("Tentativo di login per utente: " + data.username);
        const user = getUserByUsername.get(data.username);
        if (!user) {
            //Utente non trovato
            response.writeHead(401, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ login: false, message: 'Utente non trovato' }));
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
                    maxAge: 2 * 60 * 60, // 2 ore
                    path: '/',
                    sameSite: 'lax',
                    expires: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 ore
                });
                //response.writeHead(302, {
                //    'Location': '/hub.html',
                //    'Set-Cookie': cookieAuth
                //});
                response.writeHead(200, {
                     'Content-Type': 'application/json',
                     'Set-Cookie': cookieAuth
                    });
                response.end(JSON.stringify({ login: true }));
                response.end();

                //response.setHeader('Set-Cookie', cookieAuth);
                //response.writeHead(200, { 'Content-Type': 'application/json' });
                //response.end(JSON.stringify({ login: true, message: 'Login riuscito' , username: user.username}));
                return;
            }
        }});
}

/**
 * Handler per la registrazione
 * @param {ClientRequest} request 
 * @param {ServerResponse} response 
 */
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
        const data = JSON.parse(body)
        //Registrazione nuovo utente
        console.log("Tentativo di registrazione per utente: " + data.username);
        let user = getUserByUsername.get(data.username);
        if (user) {
            //Utente già esistente
            console.log("Utente già esistente")
            response.writeHead(409, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ register: false, message: 'Username già in uso' }));
            return;
        } else {
            //Controllo username e password usando regex
            if (!regexUsername.test(data.username) && !regexPassword.test(data.password)) {
                console.log((regexUsername.test(data.username) ? "" : "Username errato ") + (regexPassword.test(data.password) ? "" : "Password errata"))
                response.writeHead(400, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ register: false, message: 'Username o password non validi' }));
                return;
            }


            //Creo nuovo utente
            console.log("Sto per creare un nuovo utente")
            const passwordHash = await hashPassword(data.password);
            insertUser.run(data.username, passwordHash);


            //Pesco dal db per avere l'id
            user = getUserByUsername.get(data.username)

            //Ho la certezza ipotetica che l'user esista, non necessito controlli
            
            //Registrazione riuscita, genero token
            const token = await generateToken(user.id, user.username);
            
            //Genero cookie con la libreria cookie
            const cookieAuth = cookie.serialize('auth_token', token, {
                httpOnly: true,
                secure: false, // Non uso https in locale
                maxAge: 2 * 60 * 60, // 2 ore
                path: '/',
                sameSite: 'lax',
                expires: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 ore
            });
            //response.writeHead(302, {
            //    'Location': '/hub.html',
            //    'Set-Cookie': cookieAuth
            //});
            response.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Set-Cookie': cookieAuth
                });
            response.end(JSON.stringify({ register: true }));
            //response.end(JSON.stringify({ register: true, message: 'Utente registrato con successo' }));
            //return;
        }});
}


async function disconnectHandler(request, response) {
    //Invalido la sessione client invalidando il cookie
    const cookieAuth = cookie.serialize('auth_token', "", {
        httpOnly: true,
        secure: false, // Non uso https in locale
        path: '/',
        sameSite: 'lax',
        expires: new Date(Date.now() - 2 * 60 * 60 * 1000) // Data nel passato
    });
    response.writeHead(302, {
        'Location': '/',
        'Set-Cookie': cookieAuth
    });
    response.end();
}

export { loginHandler, registerHandler, disconnectHandler };