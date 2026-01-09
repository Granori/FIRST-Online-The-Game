const fs = require("fs");
const path = require('path');

const http = require("http");

port = 8080

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css'
};

const cartelle = {
    '.html': 'cartellaHTML',
    '.css': 'cartellaCSS',
    '.jpg': 'cartellaIMG'
};

function requestHandler(req, res) {
    console.log("\nRichiesta: " + req.url);

    const objURL = new URL(req.url,`http://${req.headers.host}`);
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

function serviFile(res, percorsoFile) {
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

server.listen(port, () => {
    console.log(`Server in ascolto su http://localhost:${port}`);
});


const io = require("socket.io")(server, {
  cors: {
    origin: "http://127.0.0.1:3000",
    methods: ["GET", "POST"]
  }
});

io.sockets.on ('connection', function (socket) {
		socket.username=socket.id;
		users.push(socket.id);
		console.log ('cliente: connesso '+socket.id);
		socket.emit('connesso', `localhost porta: ${port}`);
		numClienti++;
		socket.broadcast.emit('stato',numClienti);
		socket.emit('stato',numClienti);
		console.log('Clienti connessi:',numClienti);
		
		
		//funzione che gestisce i dati che arrivano da un client  
		socket.on('messaggio', function(data) {  
			// if (Buffer.isBuffer(data)) {
			//	console.log("Il client ha inviato un Buffer!");
			//	const stringaConvertita = data.toString("utf8"); // Converti a stringa
			//	console.log("Contenuto convertito:", stringaConvertita);
			//	}
				// Verifica se è una stringa
			//	else if (typeof data === "string") {
			//		console.log("Il client ha inviato una stringa direttamente:", data);
			//	}
				// Altri tipi (oggetti, ecc.)
			//	else {
			//		console.log("Tipo di dato non gestito:", typeof data);
			//}
			//invio a tutti i client connessi il messaggio che è arrivato da un client
			//console.log(`client: ${data}`);
			socket.broadcast.emit('messaggio', data);
			io.to(users[0]).emit ('privilegiato', data);//invia il messaggio al client specifico indicato
		});
		// funzione che gestisce la disconnessione del client
		socket.on('disconnect', function() {
			numClienti--;
			console.log('Clienti connessi:', numClienti);
			socket.broadcast.emit('stato', numClienti);
			console.log('utente disconnesso:', socket.username);
			const index = users.indexOf(socket.id);
			if (index !== -1) users.splice(index, 1);
		});
});
