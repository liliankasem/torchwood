import winston = require('winston');
import solc = require('solc');

import { IStorage, INotary, IIdentifier } from './../interfaces';
import { ContractPathFactory } from './ContractPathFactory';
import { IWeb3Adapter, Ethereum } from './../Ethereum';
import { GenericIdentifier } from './../adapters';
import { EncodedContractCall } from './EncodedContractCall';

export class ContractFactory {

    private readonly web3: IWeb3Adapter;
    private readonly storage: IStorage;
    private readonly notary: INotary;
    private readonly paths: ContractPathFactory;

    constructor(web3: IWeb3Adapter, storage: IStorage, notary: INotary) {
        this.web3 = web3;
        this.storage = storage;
        this.notary = notary;
        this.paths = new ContractPathFactory(storage);
    }

    public async UploadAndVerify(content: string): Promise<IIdentifier> {
        const sourceSignature = this.notary.GetSignature(content);
        const sourceFile = this.paths.GetSourceFilePath(sourceSignature);

        if (!await this.storage.Exists(sourceFile)) {
            winston.debug(`Compiling ${sourceSignature}`);
            const compiled = solc.compile(content, 1);

            if (compiled.errors && compiled.errors.length > 0) {
                await this.storage.SaveItem(sourceFile, JSON.stringify(compiled));
                const error = new Error(compiled.errors.join('\n'));
                error.name = "Compilation failed";
                throw error;
            }
            const promises: Promise<void>[] = [];

            Object.keys(compiled.contracts).forEach(contractKey => {
                const contract = compiled.contracts[contractKey];
                const contractName = contractKey.substr(1);
                promises.push(this.WriteContractData(sourceSignature, contract, contractName));
            });

            await Promise.all(promises);
            await this.storage.SaveItem(sourceFile, "Success");
        }

        return new GenericIdentifier(sourceSignature);
    }

    private async WriteContractData(sourceSignature: string, contract: any, contractName: string): Promise<void> {
        winston.debug(`Persisting contract ${contractName}`);
        const runtimeByteCode = `0x${contract.runtimeBytecode}`;
        const byteCode = `0x${contract.bytecode}`;
        const byteSignature = this.notary.GetSignature(runtimeByteCode);
        const contractPaths = this.paths.GetContractPaths(sourceSignature, byteSignature, contractName);

        const fileWrites = [
            this.storage.SaveItem(contractPaths.CompiledPath(), JSON.stringify(contract)),
            this.storage.SaveItem(contractPaths.AbiPath(), JSON.stringify(JSON.parse(contract.interface))),
            this.storage.SaveItem(contractPaths.NamePath(), ""),
            this.storage.SaveItem(contractPaths.RuntimeBytecodePath(), JSON.stringify(runtimeByteCode)),
            this.storage.SaveItem(contractPaths.BytecodePath(), JSON.stringify(byteCode)),
            this.storage.SaveItem(contractPaths.SourceMapPath(), byteSignature)
        ];
        await Promise.all(fileWrites);
    }

    public async PrepareTransaction(address: Ethereum.Models.EthereumAddress, id: IIdentifier, contractName: string, method: string = null, argumentPayload: any[] = []) : Promise<any> {
        const encoded = await this.GetEncodedContract(id, contractName, method, argumentPayload);
        return this.PrepareEncodedTransaction(address, encoded);
    }


    private async PrepareEncodedTransaction(fromAddress: Ethereum.Models.EthereumAddress, payload: EncodedContractCall, toAddress: Ethereum.Models.EthereumAddress = null): Promise<any> {
        const rawTx = new Ethereum.Models.EthereumTxInput(fromAddress, payload.ByteCode(), payload.EncodedCall(), toAddress);
        const estimate = await this.web3.EstimateTx(rawTx);
        return await this.web3.PrepareEstimatedTx(estimate);
    }

    public async PrepareUpdate(fromAddress: Ethereum.Models.EthereumAddress, toAddress: Ethereum.Models.EthereumAddress, id: IIdentifier, contractName: string, method: string = null, argumentPayload: any[] = []): Promise<any> {
        const encoded = await this.GetEncodedContract(id, contractName, method, argumentPayload);
        return this.PrepareEncodedTransaction(fromAddress, encoded, toAddress);
    }

    private async GetEncodedContract(contractId: IIdentifier, contractName: string, method: string = null, argumentPayload: any[] = []): Promise<any> {
        const contractPath = await this.paths.GetCompiledPath(contractId.AsString(), contractName);
        const contract = JSON.parse(await this.storage.ReadItem(contractPath));
        return new EncodedContractCall(contract, method, argumentPayload);
    }
}