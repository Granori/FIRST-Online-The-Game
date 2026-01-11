import Database from 'better-sqlite3';
import { hashPassword } from './passwordManager.js';
//Database setup
const db = new Database('./db/database.db');
db.pragma('journal_mode = WAL');
db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT
)`).run();
//Query per inserire un nuovo utente
const insertUser = db.prepare(`INSERT INTO users (username, password_hash) VALUES (?, ?)`);
//Query per ottenere un utente tramite username
const getUserByUsername = db.prepare(`SELECT * FROM users WHERE username = ?`);
//Query per ottenere un utente tramite id
const getUserById = db.prepare(`SELECT * FROM users WHERE id = ?`);
//Inserisco un utente di test se non esiste
const testUser = getUserByUsername.get('testuser');
if (!testUser) {
    const passwordHash = await hashPassword('123456');
    insertUser.run('testuser', passwordHash);
}

export { db, insertUser, getUserByUsername };