import winston = require('winston');
import { IStorage } from './../interfaces/IStorage';
import { EthereumCode, EthereumEstimate, EthereumTxInput } from './models/index';
import { INotary } from '../interfaces/index';
import { Sha256Notary } from '../adapters/index';

export class EthereumStorage {
    private readonly storage: IStorage;
    private readonly notary: INotary;

    constructor(storage: IStorage) {
        this.storage = storage;
        this.notary = new Sha256Notary();
    }

    public async SaveBlock(block: any): Promise<any> {
        await this.storage.SaveItem(this.GetBlockPath(block.number), JSON.stringify(block));
    }

    public async ReadBlock(blockNumber: number): Promise<any> {
        return await this.ReadItem(this.GetBlockPath(blockNumber));
    }

    public async SaveTransaction(tx: any): Promise<any> {
        await this.storage.SaveItem(this.GetTxPath(tx.hash), JSON.stringify(tx));
    }

    public async ReadTransaction(txHash: string): Promise<any> {
        return await this.ReadItem(this.GetTxPath(txHash));
    }

    public async SaveTransactionReceipt(receipt: any): Promise<any> {
        await this.storage.SaveItem(this.GetTxReceiptPath(receipt.transactionHash), JSON.stringify(receipt));
        return receipt;
    }

    public async ReadTransactionReceipt(txHash: string): Promise<any> {
        return await this.ReadItem(this.GetTxReceiptPath(txHash));
    }

    public async SaveTrace(txHash: string, trace: any): Promise<any> {
        await this.storage.SaveItem(this.GetTxTracePath(txHash), JSON.stringify(trace));
    }

    public async ReadTrace(txHash: string): Promise<any> {
        return await this.ReadItem(this.GetTxTracePath(txHash));
    }

    public async SaveCode(address: string, code: EthereumCode): Promise<any> {
        const hash = code.Hash();
        await this.storage.SaveItem(this.GetCodePath(code.Hash()), JSON.stringify(code.Code()));
        await this.storage.SaveItem(this.GetCodeHashPath(address), JSON.stringify(hash));
    }

    public async ReadCode(address: string): Promise<EthereumCode> {
        const codeHash = await this.ReadItem<any>(this.GetCodeHashPath(address));
        const code = await this.ReadItem<any>(this.GetCodePath(codeHash));
        return new EthereumCode(code);
    }

    public async ReadTxEstimate(tx: EthereumTxInput): Promise<EthereumEstimate> {
        return this.ReadResult<EthereumEstimate>("EstimateTx", tx);
    }

    public async ReadPreparedTx(tx: EthereumEstimate): Promise<any> {
        return this.ReadResult<any>("PrepareEstimatedTx", tx);
    }

    public async ReadSignedTx(txAsBytes: string): Promise<any> {
        return this.ReadResult<any>("SendSignedTx", txAsBytes);
    }

    public async LogResult(category: string, input: any, result: any): Promise<any> {
        const serializedInput = JSON.stringify(input);
        const hash = this.notary.GetSignature(serializedInput);
        const path = `${category}/${hash}`;
        await this.storage.SaveItem(`${path}/input.json`, serializedInput);
        await this.storage.SaveItem(`${path}/resposne.json`, JSON.stringify(result));
    }

    private async ReadResult<T>(category: string, input: any): Promise<T> {
        const serializedInput = JSON.stringify(input);
        const hash = this.notary.GetSignature(serializedInput);
        const path = `${category}/${hash}`;
        return await this.ReadItem<T>(`${path}/resposne.json`);
    }

    private async ReadItem<T>(path: string): Promise<T> {
        if (await this.storage.Exists(path)) {
            return JSON.parse(await this.storage.ReadItem(path));
        }

        return null;
    }

    private GetCodePath(codeHash: string): string {
        return `Code/${codeHash}/code.json`;
    }

    private GetCodeHashPath(address: string): string {
        return `Addresses/${address}/codeHash.json`;
    }

    private GetBlockPath(blockNumber: number): string {
        return `Blocks/${blockNumber}/block.json`;
    }

    private GetTxPath(txHash: string): string {
        return `Tx/${txHash}/tx.json`;
    }

    private GetTxReceiptPath(txHash: string): string {
        return `Tx/${txHash}/receipt.json`;
    }

    private GetTxTracePath(txHash: string): string {
        return `Tx/${txHash}/trace.json`;
    }
}