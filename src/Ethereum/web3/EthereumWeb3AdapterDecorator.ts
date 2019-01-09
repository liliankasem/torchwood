import { IWeb3Adapter } from './../IWeb3Adapter';
import {
    EthereumCode,
    EthereumEstimate,
    EthereumTxInput
} from './../models';

export abstract class EthereumWeb3AdapterDecorator implements IWeb3Adapter {
    private readonly baseClient: IWeb3Adapter;

    constructor(baseClient: IWeb3Adapter) {
        this.baseClient = baseClient;
    }

    public async GetBlock(identifier: any): Promise<any> {
        return this.baseClient.GetBlock(identifier);
    }

    public async GetTransaction(txHash: string): Promise<any> {
        return this.baseClient.GetTransaction(txHash);
    }

    public async GetTransactionReceipt(txHash: string): Promise<any> {
        return this.baseClient.GetTransactionReceipt(txHash);
    }

    public async GetTrace(txHash: string): Promise<any> {
        return this.baseClient.GetTrace(txHash);
    }

    public async GetCode(address: string): Promise<EthereumCode> {
        return this.baseClient.GetCode(address);
    }

    public GetContractInstance(address: string, abi: any): Promise<any> {
        return this.baseClient.GetContractInstance(address, abi);
    }

    public async ReadContract(address: string, abi: any, block?: any): Promise<any> {
        return this.baseClient.ReadContract(address, abi, block);
    }

    public async GetEvents(address: string, abi: any, block?: any): Promise<any> {
        return this.baseClient.GetEvents(address, abi, block);
    }
    public async GetNetworkId(): Promise<number> {
        return this.baseClient.GetNetworkId();
    }

    public async EstimateTx(tx: EthereumTxInput): Promise<EthereumEstimate> {
        return this.baseClient.EstimateTx(tx);
    }

    public async PrepareEstimatedTx(tx: EthereumEstimate): Promise<any> {
        return this.baseClient.PrepareEstimatedTx(tx);
    }

    public async SendSignedTx(txBytesAsHex: string): Promise<string> {
        return this.baseClient.SendSignedTx(txBytesAsHex);
    }

    public async GetBalance(address: string): Promise<number> {
        return this.baseClient.GetBalance(address);
    }

    public async WaitForTx(txHash: string): Promise<any> {
        return this.baseClient.WaitForTx(txHash);
    }
}