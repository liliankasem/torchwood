import { EthereumWeb3Simulator } from './simulators/EthereumWeb3Simulator';
import { FileSystemStorage } from './../adapters';
import './../Ethereum';

import { IWeb3Adapter, Ethereum } from './../Ethereum/index';
import { IStorage } from './../interfaces/index';

export class ArtifactFactory {

    private static CreateWeb3(path: string) : IWeb3Adapter {
        const storage: IStorage = new FileSystemStorage(path);
        return EthereumWeb3Simulator.Create(storage);
    }

    public static ChainWithContractEvents() : IWeb3Adapter {
        return this.CreateWeb3(`${__dirname}/artifacts/SerializedChainWithContractEvents`);
    }

    public static SimulatedChainStorage() : IStorage {
        return new FileSystemStorage(`${__dirname}/artifacts/RecordedTestRpc`);
    }
}