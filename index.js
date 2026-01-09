import fs from 'fs';
import path from 'path';
import url from 'url';

import http from 'http';
import { Server } from 'socket.io';
import { LobbyTavolo } from './script/class/LobbyTavolo.js';
import { GiocatoreLobby } from './script/class/GiocatoreLobby';


const __dirname = path.dirname(url.fileURLToPath(import.meta.url)); //Alternativa per usare __dirname con ES6
const PORT = 3000;
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

async function requestHandler(req, res) {
    console.log("\nRichiesta: " + req.url);

    const objURL = new URL(req.url, `http://${req.headers.host}`);
    console.log(objURL);

    const estensione = path.extname(objURL.pathname == "/" ? "/index.html" : objURL.pathname);
    const cartella = cartelle[estensione];
    const nomeFile = path.basename(objURL.pathname == "/" ? "/index.html" : objURL.pathname);

    if (!cartella) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Pagina non trovata');
        return;
    }

    serviFile(res, path.join(__dirname, cartella, nomeFile));
}

async function serviFile(res, percorsoFile) {
    console.log("Percorso file: " + percorsoFile);

    const fileStream = fs.createReadStream(percorsoFile);

    fileStream.on('open', () => {
        console.log('File aperto');
        res.writeHead(200, { 'Content-Type': mimeTypes[path.extname(percorsoFile)] });
    });

    fileStream.on('error', (error) => {
        console.error('Errore nella lettura del file: ' + error.code + ' - ' + error.message);

        if (error.code === 'ENOENT') {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File non trovato');
        }
        else {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Errore interno del server');
        }

    });
    
    fileStream.pipe(res);
}

const server = http.createServer(requestHandler);

server.listen(PORT, HOSTNAME, () => {
    console.log(`Server in ascolto su http://${HOSTNAME}:${PORT}`);
});

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