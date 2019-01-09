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

export class EthereumWeb3AdapterStorageCacheReader extends EthereumWeb3AdapterDecorator {
    private readonly storage: EthereumStorage;

    constructor(baseClient: IWeb3Adapter, storage: IStorage) {
        super(baseClient);
        this.storage = new EthereumStorage(storage);
    }

    public async GetBlock(identifier: any): Promise<any> {
        return await this.CacheRead(
            async () => await this.storage.ReadBlock(identifier),
            async () => await super.GetBlock(identifier));
    }

    public async GetTransaction(txHash: string): Promise<any> {
        return await this.CacheRead(
            async () => await this.storage.ReadTransaction(txHash),
            async () => await super.GetTransaction(txHash));
    }

    public async GetTransactionReceipt(txHash: string): Promise<any> {
        return await this.CacheRead(
            async () => await this.storage.ReadTransactionReceipt(txHash),
            async () => await super.GetTransactionReceipt(txHash));
    }

    public async GetTrace(txHash: string): Promise<any> {
        return await this.CacheRead(
            async () => await this.storage.ReadTrace(txHash),
            async () => await super.GetTrace(txHash));
    }

    public async GetCode(address: string): Promise<EthereumCode> {
        return await this.CacheRead(
            async () => await this.storage.ReadCode(address),
            async () => await super.GetCode(address));
    }

    public async EstimateTx(tx: EthereumTxInput): Promise<EthereumEstimate> {
        return await this.CacheRead(
            async() => await this.storage.ReadTxEstimate(tx),
            async() => await super.EstimateTx(tx));
    }

    public async PrepareEstimatedTx(tx: EthereumEstimate): Promise<any> {
        return await this.CacheRead(
            async() => await this.storage.ReadPreparedTx(tx),
            async() => await super.PrepareEstimatedTx(tx));
    }

    public async SendSignedTx(txBytesAsHex: string): Promise<string> {
        return await this.CacheRead(
            async() => await this.storage.ReadSignedTx(txBytesAsHex),
            async() => await super.SendSignedTx(txBytesAsHex));
    }

    public async WaitForTx(txHash: string): Promise<any> {
        return await this.CacheRead(
            async() => await this.storage.ReadTransactionReceipt(txHash),
            async() => await super.WaitForTx(txHash));
    }


    private async CacheRead<T>(readFn: Func<T>, baseFn: Func<T>): Promise<T> {
        let result = await readFn();

        if (!result) {
            result = await baseFn();
        }

        return result;
    }
}