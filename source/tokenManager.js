import jwt from 'jsonwebtoken';
// Generazione e verifica JWT
const JWT_SECRET = "token_da_cambiare"; // Da cambiare
async function generateToken(id, username) {
    const payload = {
        id: id,
        username: username
    };
    const token =  jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
    console.log("Token generato per " + username + ": " + token);
    return token;
}

async function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (err) {
        return null;
    }


}
export { generateToken, verifyToken };