import * as bc from 'bcrypt';
//Hash password
const PASSI = 10;
async function hashPassword(password) {
    const hash = await bc.hash(password, PASSI);
    return hash;
}
async function comparePassword(password, hash) {
    const isMatch = await bc.compare(password, hash);
    return isMatch;
}
export { hashPassword, comparePassword };