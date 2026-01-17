import Database from 'better-sqlite3';
import { hashPassword } from './passwordManager.js';
//Database setup
const db = new Database('./db/database.db');
db.pragma('journal_mode = WAL');
db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password_hash TEXT,
    pathImg TEXT
)`).run();
//Query per inserire un nuovo utente
const insertUser = db.prepare(`INSERT INTO users (username, password_hash, pathImg) VALUES (?, ?, 'user.svg')`);
//Query per ottenere un utente tramite username
const getUserByUsername = db.prepare(`SELECT * FROM users WHERE username = ?`);
//Query per ottenere un utente tramite id
const getUserById = db.prepare(`SELECT * FROM users WHERE id = ?`);
//Cambio l'username del giocatore
const changeUsernameById = db.prepare('UPDATE users SET username = ? WHERE id = ?');
//Cambio l'img del giocatore
const changePathImgById = db.prepare('UPDATE users SET pathImg = ? WHERE id = ?');
//Inserisco un utente di test se non esiste
const testUser = getUserByUsername.get('admin');
if (!testUser) {
    const passwordHash = await hashPassword('Aa1111@#@#');
    insertUser.run('admin', passwordHash);
}

export { db, insertUser, getUserByUsername, getUserById, changeUsernameById, changePathImgById };