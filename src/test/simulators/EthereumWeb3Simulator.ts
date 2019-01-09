import { IStorage } from './../..';
import { IWeb3Adapter } from './../../Ethereum/IWeb3Adapter';
import { EthereumAddress, EthereumEstimate, EthereumTxInput, EthereumCode } from './../../Ethereum/models';
import { EthereumStorage } from '../../Ethereum/EthereumStorage';
import { EthereumWeb3AdapterStorageCache, EthereumWeb3AdapterStorageCacheReader } from '../../Ethereum/web3/index';


class EthereumWeb3NoOpAdapter implements IWeb3Adapter {
    public async GetTrace(txHash: string): Promise<any> {
        throw new Error("Not Implemented");
    }

    public async GetCode(address: string): Promise<EthereumCode> {
        throw new Error("Not Implemented");
    }

    public GetContractInstance(address: string, abi: any): Promise<any> {
        throw new Error("Not Implemented");
    }

    public async ReadContract(address: string, abi: any, block?: any): Promise<any> {
        throw new Error("Not Implemented");
    }

    public async GetBlock(identifer: string): Promise<any> {
        throw new Error("Not Implemented");
    }

    public async GetTransactionReceipt(txHash: string): Promise<any> {
        throw new Error("Not Implemented");
    }

    public async GetTransaction(txHash: string): Promise<any> {
        throw new Error("Not Implemented");
    }

    public async GetNetworkId(): Promise<number> {
        throw new Error("Not Implemented");
    }

    public async EstimateTx(tx: EthereumTxInput): Promise<EthereumEstimate> {
        throw new Error("Not Implemented");
    }

    public async PrepareEstimatedTx(tx: EthereumEstimate): Promise<any> {
        throw new Error("Not Implemented");
    }

    public async SendSignedTx(txBytesAsHex: string): Promise<string> {
        throw new Error("Not Implemented");
    }

    public async WaitForTx(txHash: string): Promise<any> {
        throw new Error("Not Implemented");
    }

    public async GetBalance(address: string): Promise<number> {
        throw new Error("Not Implemented");
    }

    public async GetEvents(address: string, abi: any, block: any): Promise<any> {
        throw new Error("Not Implemented");
    }
}

export class EthereumWeb3Simulator {
    public static Create(storage: IStorage): IWeb3Adapter {
        const base =  new EthereumWeb3AdapterStorageCache(new EthereumWeb3NoOpAdapter(), storage);
        return new EthereumWeb3AdapterStorageCacheReader(base, storage);
    }
}