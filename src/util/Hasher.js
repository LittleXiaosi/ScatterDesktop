const ecc = require('eosjs-ecc');
const scrypt = require('scrypt-async');
import StorageService from '../services/StorageService'

export default class Hasher {

    /***
     * Hashes a cleartext using the SHA-256 algorithm.
     * This is INSECURE and should only be used for fingerprinting.
     * @param cleartext
     */
    static insecureHash(cleartext) {
        return ecc.sha256(cleartext);
    }

    /***
     * Hashes a cleartext using scrypt.
     * @param cleartext
     */
    static async secureHash(cleartext) {
        return new Promise(async resolve => {
            const salt = await StorageService.getSalt();
            scrypt(cleartext, salt, {
                N: 16384,
                r: 8,
                p: 1,
                dkLen: 16,
                encoding: 'hex'
            }, (derivedKey) => {
                resolve(derivedKey);
            })
        });
    }
}