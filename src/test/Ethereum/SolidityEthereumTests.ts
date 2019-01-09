import "mocha";
import { assert } from 'chai';
import { IWeb3Adapter, Ethereum } from '../../Ethereum/index';
import { ArtifactFactory } from './../ArtifactFactory';
import { ContractFactory } from "../../modules/index";
import { IStorage, IIdentifier, INotary, ISigningNotary } from "../../interfaces/index";
import { Sha256Notary, SigningNotary, SigningNotaryCache } from "../../adapters/index";
import { EthereumWeb3Adapter, EthereumWeb3AdapterStorageCache } from "../../Ethereum/web3/index";
import { EthereumAddress } from "../../Ethereum/models/index";
import { TestRun } from "../TestRun";
import { EthereumWeb3Simulator } from "../simulators/EthereumWeb3Simulator";

const accountAddress = "0xaf0fe2d150fc4d015f251dde1fe8a2eb99243026";
const contractName = "ContractWithEvent";
const contractFileName = "Contract.sol";

const sat = TestRun.SlowAdapterTest;
const st = TestRun.SlowTest;

class EthereumFactory {
    public readonly web3: IWeb3Adapter;
    public readonly contractFactory: ContractFactory;
    public readonly notary: ISigningNotary;
    public readonly storage: IStorage;

    constructor() {
        this.storage = ArtifactFactory.SimulatedChainStorage();

        let baseWeb3: IWeb3Adapter;
        if (TestRun.UseAdapters()) {
            // tslint:disable-next-line
            baseWeb3 = new EthereumWeb3Adapter("http://localhost:8545");
        } else {
            baseWeb3 = EthereumWeb3Simulator.Create(this.storage);
        }

        const baseNotary = new SigningNotary(this.storage, "");
        this.notary = new SigningNotaryCache(this.storage, baseNotary);
        this.web3 = new EthereumWeb3AdapterStorageCache(baseWeb3, this.storage);
        this.contractFactory = new ContractFactory(this.web3, this.storage, new Sha256Notary());
    }
}

class SolidityEthereumTests {
    private readonly notary: ISigningNotary;
    private readonly web3: IWeb3Adapter;
    private readonly contractFactory: ContractFactory;
    private readonly storage: IStorage;

    constructor(factory: EthereumFactory) {
        this.notary = factory.notary;
        this.web3 = factory.web3;
        this.contractFactory = factory.contractFactory;
        this.storage = factory.storage;
    }

    public RunTests(account: EthereumAddress, fileName: string, contractName: string) {
        describe('SolidityEthereumTests', async () => {
            let contractId: IIdentifier;
            st('Should verify and store a contract', async () => {
                const rawContract = await this.storage.ReadItem(fileName);
                contractId = await this.contractFactory.UploadAndVerify(rawContract);
                assert.isNotEmpty(contractId);
            });

            let preparedTx;
            it('Should prepare deployment transaction', async () => {
                preparedTx = await this.contractFactory.PrepareTransaction(account, contractId, contractName);
                assert.isNotEmpty(preparedTx);
            });

            let signedTx;
            sat('Should sign transaction', async () => {
                signedTx = await this.notary.Sign(preparedTx);
                assert.isNotEmpty(signedTx);
            });

            let contractAddress: EthereumAddress;
            it('Should deploy contract to chain', async () => {
                const web3 = this.web3;
                const txHash = await web3.SendSignedTx(signedTx);
                const receipt = await this.VerifiyTransaction(txHash);
                contractAddress = new EthereumAddress(receipt.contractAddress);
            });

            it('Should prepare update transaction', async () => {
                preparedTx = await this.contractFactory.PrepareUpdate(account, contractAddress, contractId, contractName, "raiseEvent");
                assert.isNotEmpty(preparedTx);
            });

            it('Should sign update transaction', async () => {
                signedTx = await this.notary.Sign(preparedTx);
                assert.isNotEmpty(signedTx);
            });

            it('Should send and verify update tx', async () => {
                const txHash = await this.web3.SendSignedTx(signedTx);
                await this.VerifiyTransaction(txHash);
            });
        });
    }

    private async VerifiyTransaction(txHash: string): Promise<any> {
        const receipt = await this.web3.WaitForTx(txHash);
        const tx = await this.web3.GetTransaction(receipt.transactionHash);
        const txReceipt = await this.web3.GetTransactionReceipt(txHash);
        const block = await this.web3.GetBlock(tx.blockNumber);

        if (txReceipt.contractAddress) {
            await this.web3.GetCode(txReceipt.contractAddress);
        }
        assert.equal(tx.blockNumber, block.number);
        assert.equal(txReceipt.blockNumber, block.number);
        return txReceipt;
    }
}

const account = new EthereumAddress(accountAddress);
const factory = new EthereumFactory();
const test = new SolidityEthereumTests(factory);
test.RunTests(account, contractFileName, contractName);
