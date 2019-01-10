import { IWeb3Adapter } from './../IWeb3Adapter';
import { IStorage } from './../../interfaces/IStorage';
import {
    EthereumCode,
    EthereumEstimate,
    EthereumTxInput
} from './../models';
import {
    EthereumStorage
} from './../EthereumStorage';
import winston = require('winston');
import { EthereumWeb3AdapterDecorator } from './EthereumWeb3AdapterDecorator';

type Func<T> = () => Promise<T>;

export class EthereumWeb3AdapterStorageCache extends EthereumWeb3AdapterDecorator {
    private readonly storage: EthereumStorage;

    constructor(baseClient: IWeb3Adapter, storage: IStorage) {
        super(baseClient);
        this.storage = new EthereumStorage(storage);
    }

    public async GetBlock(identifier: any): Promise<any> {
        const block = await super.GetBlock(identifier);
        await this.storage.SaveBlock(block);
        return block;
    }

    public async GetTransaction(txHash: string): Promise<any> {
        const tx = await super.GetTransaction(txHash);
        await this.storage.SaveTransaction(tx);
        return tx;
    }

    public async GetTransactionReceipt(txHash: string): Promise<any> {
        const receipt = await super.GetTransactionReceipt(txHash);
        await this.storage.SaveTransactionReceipt(receipt);
        return receipt;
    }

    public async GetTrace(txHash: string): Promise<any> {
        const trace = await super.GetTrace(txHash);
        await this.storage.SaveTrace(txHash, trace);
        return trace;
    }

    public async GetCode(address: string): Promise<EthereumCode> {
        const code = await super.GetCode(address);

        if (code) {
            await this.storage.SaveCode(address, code);
        }

        return code;
    }

    public async EstimateTx(tx: EthereumTxInput): Promise<EthereumEstimate> {
        return this.LogResult("EstimateTx", tx, async () => {
            return super.EstimateTx(tx);
        });
    }

    public async PrepareEstimatedTx(tx: EthereumEstimate): Promise<any> {
        return this.LogResult("PrepareEstimatedTx", tx, async () => {
            return super.PrepareEstimatedTx(tx);
        });
    }

    public async SendSignedTx(txBytesAsHex: string): Promise<string> {
        return this.LogResult("SendSignedTx", txBytesAsHex, async () => {
            return super.SendSignedTx(txBytesAsHex);
        });
    }

    public async WaitForTx(txHash: string): Promise<any> {
        return this.LogResult("WaitForTx", txHash, async () => {
            return super.WaitForTx(txHash);
        });
    }

    private async LogResult<T>(prefix: string, input: any, fn: Func<T>): Promise<T> {
        const result = await fn();
        await this.storage.LogResult(prefix, input, result);
        return result;
    }
}