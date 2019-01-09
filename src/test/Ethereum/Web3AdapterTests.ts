import "mocha";
import { assert } from 'chai';
import { IWeb3Adapter, Ethereum } from '../../Ethereum/index';
import { ArtifactFactory } from './../ArtifactFactory';

const originBlock = 0;
const blockWithTx = 1;

describe('Web3AdapterTests', async () => {
    const web3: IWeb3Adapter = ArtifactFactory.ChainWithContractEvents();

    it('Should read origin block', async () => {
        const block = await web3.GetBlock(originBlock);
        assert.equal(0, block.number);
    });

    describe('Block, Tx, Receipt and Trace enumeration', () => {
        let txs: any[];
        let activeTxHash : any;

        it('Should read a block with transactions', async () => {
            const block = await web3.GetBlock(blockWithTx);
            txs = block.transactions;
            assert.isArray(txs, "block.transactions is expected to be an array");
            assert.isNotEmpty(txs, "transactions must not be empty");
            activeTxHash = txs[0];
        });

        it('Should read transaction', async () => {
            const tx = await web3.GetTransaction(activeTxHash);
            assert.equal(activeTxHash, tx.hash, "Invalid transaction. Hashes do not match.");
        });

        it('Should read transaction receipt', async () => {
            const txReceipt = await web3.GetTransactionReceipt(activeTxHash);
            assert.equal(activeTxHash, txReceipt.transactionHash, "Invalid tx receipt. Hashes do not match.");
        });

        it('Should read transaction trace', async () => {
            const trace = await web3.GetTrace(activeTxHash);
            assert.isNotEmpty(trace, "Unable to read tx trace");
        });
    });
});