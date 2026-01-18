import jwt from 'jsonwebtoken';
import {randomBytes} from 'crypto'
// Generazione e verifica JWT
//const JWT_SECRET = "token_da_cambiare"; // Da cambiare
const JWT_SECRET = randomBytes(32).toString('hex'); //Tutti i token delle connessioni precedenti vengono automaticamente scartati
async function generateToken(id, username) {
    const payload = {
        id: id,
        username: username
    };
    const token =  jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
    console.log("Token generato per " + username + ": " + token);
    return token;
}

function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (err) {
        return null;
    }


}
export { generateToken, verifyToken };