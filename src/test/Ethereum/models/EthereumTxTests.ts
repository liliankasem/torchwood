import { EthereumTx, EthereumAddress } from './../../../Ethereum/models';
import { assert } from 'chai';
import Mocha = require('mocha');

const tx = new EthereumTx({
    hash: '0x77367f722649e4e505afd1513c69b6e8bedf6191814e79fbdd5e126edb5f98f7',
    nonce: 34,
    blockHash: '0xf89669e5f4e5f1f50b4018be8f3159d52766a3f10e1c7fdd99290030f66e81b6',
    blockNumber: 35,
    transactionIndex: 0,
    from: '0xb35849fb3093c7f5dcca88b8c1f5982b327468b1',
    to: '0x31008543aa1875eb1db1c54e34ba98ba887e8976',
    value: 0,
    gas: 6721975,
    gasPrice: 100000000000,
    input: '0x43d726d6'
}, {
    transactionHash:
        '0x77367f722649e4e505afd1513c69b6e8bedf6191814e79fbdd5e126edb5f98f7',
        transactionIndex: 0,
        blockHash:
            '0xf89669e5f4e5f1f50b4018be8f3159d52766a3f10e1c7fdd99290030f66e81b6',
        blockNumber: 35,
        gasUsed: 41692,
        cumulativeGasUsed: 41692,
        contractAddress: null,
        logs: [],
        status: '0x1',
        logsBloom: '0x0000000000000000000000000000000000000000000000000000000'
    }
);

Mocha.describe('EthereumTx', () => {
    Mocha.describe('TargetAddress', () => {
        Mocha.it('should get the target address from the transaction', () => {
            const expected = new EthereumAddress('0x31008543aa1875eb1db1c54e34ba98ba887e8976');
            const result = tx.TargetAddress();
            assert.equal(JSON.stringify(result), JSON.stringify(expected));
        });
    });

    Mocha.describe('OriginatingAddress', () => {
        Mocha.it('should get the originating address from the transaction', () => {
            const expected = new EthereumAddress("0xb35849fb3093c7f5dcca88b8c1f5982b327468b1");
            const result = tx.OriginatingAddress();
            assert.equal(JSON.stringify(result), JSON.stringify(expected));
        });
    });

    Mocha.describe('Hash', () => {
        Mocha.it('should get the hash from the transaction', () => {
            const expected = "0x77367f722649e4e505afd1513c69b6e8bedf6191814e79fbdd5e126edb5f98f7";
            const result = tx.Hash();
            assert.equal(result, expected);
        });
    });
});