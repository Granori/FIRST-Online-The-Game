import fs from 'fs';
import path from 'path';
import url from 'url';
import http from 'http';
import { API_manager } from './source/api.js';
//cookie, bcrypt, JWT per autenticazione

const __dirname = path.dirname(url.fileURLToPath(import.meta.url)); //Alternativa per usare __dirname con ES6
const PORT = 8080;
const HOSTNAME = "127.0.0.1";

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css'
};

const cartelle = {
    '.html': 'HTML',
    '.css': 'CSS',
    '.jpg': 'IMG'
};


/**
 * Request handler principale del server
 * @param {http.ClientRequest} request 
 * @param {http.ServerResponse} response
 */
async function requestHandler(request, response) {
    console.log("\nRichiesta: " + request.url);

    const objURL = url.parse(request.url, true);

    if (objURL.pathname.startsWith("/api")) {
        //Gestione API
        API_manager(request, response);
        return;
    }

    const estensione = path.extname(objURL.pathname == "/" ? "/index.html" : objURL.pathname);
    const cartella = cartelle[estensione];
    const nomeFile = path.basename(objURL.pathname == "/" ? "/index.html" : objURL.pathname);

    if (!cartella) {
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.end('Pagina non trovata');
        return;
    }

    //Controllo token a tutte le pagine tranne /index.html e /register.html
    if ((nomeFile !== "index.html" && nomeFile !== "register.html") && cartella === "HTML") {
        // Richiesta interna al server per /api/validate_token
        const options = {
            hostname: HOSTNAME,
            port: PORT,
            path: '/api/validate_token',
            method: 'POST',
            headers: {
                'Cookie': request.headers.cookie || ""
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const tokenValidJSON = JSON.parse(data);
                if (!tokenValidJSON.token_valid) {
                    response.writeHead(302, { 'Location': '/index.html' });
                    response.end();
                    return;
                }
            });
        });

        req.on('error', (e) => {
            console.error('Errore durante la richiesta:', e.message);
            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.end('Errore interno del server');
        });

        req.end();
    }

    serviFile(response, path.join(__dirname, cartella, nomeFile));
}

async function serviFile(response, percorsoFile) {
    console.log("Percorso file: " + percorsoFile);

    const fileStream = fs.createReadStream(percorsoFile);

    fileStream.on('open', () => {
        console.log('File aperto');
        response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(percorsoFile)] });
    });

    fileStream.on('error', (error) => {
        console.error('Errore nella lettura del file: ' + error.code + ' - ' + error.message);

        if (error.code === 'ENOENT') {
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.end('File non trovato');
        }
        else {
            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.end('Errore interno del server');
        }

    });
    
    fileStream.pipe(response);
}

const server = http.createServer(requestHandler);

server.listen(PORT, HOSTNAME, () => {
    console.log(`Server in ascolto su http://${HOSTNAME}:${PORT}`);
});
/*
let lobby = new LobbyTavolo(0, "Stanza di prova", 4);


const io = new Server(server);
io.on('connection', (socket) => {

    //Socket istanziato
    console.log('Nuovo client connesso: ' + socket.id);

    //Ricevo username dal client
    socket.on("connessione", (username) => {
        console.log("Username ricevuto: " + username);
        let response = null;
        if (username.length < 3 || username.length > 12) {
            response = false;
        }
        else {
            //Pratica di connessione accettata
            let giocatore = new GiocatoreLobby(username, socket.id, (lobby.giocatoriPresenti() == 0));
            lobby.aggiungiGiocatore(giocatore);
            console.log("Giocatori in lobby: " + lobby.giocatoriPresenti());

            //Invio al client le info sulla lobby
            response = {
                lobbyName: lobby.nomeTavolo,
                maxPlayers: lobby.maxGiocatori,
                playersPresent: lobby.giocatoriPresenti(),
                isHost: giocatore.isHost,
                players: lobby.giocatori.map(g => g.getUsername())
            };

        }
        socket.emit("esitoConnessione", response);
        socket.broadcast.emit("nuovoGiocatore", lobby.giocatori.map(g => g.getUsername()));
    })

    

    socket.on('disconnect', () => {
        console.log('Client disconnesso: ' + socket.id);
    });



});
*/