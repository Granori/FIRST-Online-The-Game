import * as qs from 'querystring';
import * as url from 'url';
import * as fs from 'fs/promises'
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
            case '/api/advaibleImgs':
                // Ottieni la lista dei file nella cartella /IMG
                const filePath = './IMG/';
                const files = fs.readdirSync(filePath);
                
                // Filtra solo i file (escludi cartelle)
                const imageFiles = files.filter(file => fs.statSync(`${filePath}${file}`).isFile());
                
                // Rispondi con la lista dei file
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ files: imageFiles }));
                return;
            case '/api/changeUsernameInfo':
                //Per cambiare username
                //Valido prima la regex
                let body = '';
                request.on('data', (chunk) => {
                    body += chunk;
                });
                request.on('end', () => {
                    const data = JSON.parse(body).dati
                    console.log(data)
                    
                    let objResponse = {
                        executed: true,
                        message: "Nothing happened ;)"
                    }

                    let statusCode = 204;

                    
                    

                    //Controllo se cambia img
                    if ("img" in data){
                        const pathImg = data.img
                        //TODO: check validità del percorso
                        console.log("Sto per cambiare il path dell'immagine")
                        db.changePathImgById.run(pathImg, decoded.id)
                        statusCode = 204
                        objResponse.executed = true
                        objResponse.message = "Immagine cambiata con successo"
                    }

                    //Controllo se cambia username
                    if ("username" in data){
                        const username = data.username
                        console.log(username)
                        if (auth.regexUsername.test(username)) {
                            //Regex success
                            console.log("Controllo regex passato")
                            const usernameConflitto = db.getUserByUsername.get(username)
                            if (!usernameConflitto) {
                                //Cambio username può avvenire
                                console.log("Controllo conflitto avvenuto")
                                console.log("Sto per cambiare l'username")
                                db.changeUsernameById.run(username, decoded.id)
                                console.log(response.getHeaders())

                                console.log("Inizializzo la disconnessione")
                                return auth.disconnectHandler(request, response)
                            } else {
                                //Username già registrato
                                console.log("Username già registrato")
                                objResponse.executed = false
                                objResponse.message = "Username già registrato"
                                statusCode = 409 //Conflitto
                                
                            }
                        } else {
                            //Regex Fallita
                            console.log("Regex fallita")
                            objResponse.executed = false
                            objResponse.message = "Username non valido"
                            statusCode = 400 //Bad Request
                        }
                        
                        


                    } 
                    
                    response.writeHead(statusCode, { 'Content-Type': 'application/json' })
                    response.end(JSON.stringify(objResponse))

                    
                });
                break;
            case '/api/user':
                // Restituisco le informazioni dell'utente
                console.log(decoded)
                const user = db.getUserById.get(decoded.id)
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ user: { id: user.id, username: user.username, pathImg: user.pathImg } }));
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
                response.end(JSON.stringify({ user: { id: idUtente, username: infoUtente.username, pathImg: infoUtente.pathImg } }));
                return;

            default:
                response.writeHead(404, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ message: 'Route not found' }));
                return;
        }

    }

}







export { API_manager };