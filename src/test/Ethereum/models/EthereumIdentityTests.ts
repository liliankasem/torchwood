import { EthereumIdentity } from './../../../Ethereum/models';
import { assert } from 'chai';
import Mocha = require('mocha');


Mocha.describe('EtheruemIdentity', () => {
    Mocha.describe('Normalized Network Id', () => {
        Mocha.it('should normalize and pad', () => {
            const id = new EthereumIdentity(100, '0x2d711642b726b04401627ca9fbac32f5c8530fb1903cc4db02258717921a4881');
            const expected = '0000000100-2d711642b7';
            const result = id.AsString();
            assert.equal(result, expected);
        });
    });
});