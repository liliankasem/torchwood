import { Sha256Notary } from './../../adapters';
import Mocha = require('mocha');

Mocha.describe('Sha256Notary', () => {
    Mocha.describe('BasicSigning', () => {
        Mocha.it('should sign x as "2d711642b726b04401627ca9fbac32f5c8530fb1903cc4db02258717921a4881"', () => {
            const notary = new Sha256Notary();
            const expected = '2d711642b726b04401627ca9fbac32f5c8530fb1903cc4db02258717921a4881';
            const result = notary.GetSignature('x');
            if (result !== expected) {
                throw new Error(`${result} != ${expected}`);
            }
        });
    });
});