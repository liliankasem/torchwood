import Web3 = require('web3');
import winston = require('winston');
import { JobQueue, Task } from './../../modules';
import { IWeb3Adapter } from './../IWeb3Adapter';
import { EthereumEstimate, EthereumTxInput, EthereumCode } from './../models';


export class EthereumWeb3Adapter implements IWeb3Adapter {
    private readonly web3: Web3;
    private readonly queue: JobQueue;

    constructor(public rpcUrl: string, public provider?: Web3) {
        if (provider) {
            this.web3 = provider;
        }
        else {
            this.web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl, 2000));
        }
        this.queue = new JobQueue();
    }

    public async GetTrace(txHash: string): Promise<any> {

        const traceLog = await this.queue.ExecuteJob(() => new Promise((resolve, reject) => {
            this.web3.currentProvider.sendAsync({
                jsonrpc: "2.0",
                method: "debug_traceTransaction",
                params: [txHash],
                id: new Date().getTime()
            }, (err: any, result: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result.result);
                }
            });
        }));

        return traceLog ? traceLog.structLogs : "";
    }

    public async GetCode(address: string): Promise<EthereumCode> {
        const code = await this.queue.ExecuteJob(() => new Promise((resolve, reject) => {
            this.web3.eth.getCode(address, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
        }));

        let result: EthereumCode;

        if (code && code.length > 10) {
            result = new EthereumCode(code);
        }

        return result;
    }

    public GetContractInstance(address: string, abi: any): Promise<any> {
        return new Promise<any>((resolve) => {
            resolve(this.web3.eth.contract(abi).at(address));
        });
    }

    public async GetEvents(address: string, abi: any, block?: any): Promise<any> {
        if (!block) {
            block = 'latest';
        }

        return await this.queue.ExecuteJob(() => new Promise((resolve, reject) => {
            const all_events = [];

            // construct the contract
            const contract = this.web3.eth.contract(abi).at(address);

            // get all events listed in the contract on current block
            const contract_event = contract.allEvents({ fromBlock: block, toBlock: block });

            contract_event.get((error, result) => {
                if (!error && result.length > 0) {
                    const single_event = {};

                    result.forEach(entry => {
                        const event_identifier = 'event';
                        const event_args_identifier = 'args';
                        single_event[event_identifier] = entry.event;
                        single_event[event_args_identifier] = entry.args;

                        all_events.push(single_event);
                    });
                }
            });

            resolve(all_events);
        }));
    }

    public async ReadContract(address: string, abi: any, block?: any): Promise<any> {
        if (!block) {
            block = 'latest';
        }

        return await this.queue.ExecuteJob(() => new Promise((resolve, reject) => {
            const contract = this.web3.eth.contract(abi).at(address);
            const contractData = {};

            abi.forEach(x => {
                if (x.constant && x.inputs.length === 0) {
                    let value = null;

                    try {
                        value = contract[x.name](block);
                    } catch (e) {
                        winston.debug(e);
                        reject("The ABI provided does not match the address.");
                    }

                    if (x.outputs[0].type === 'uint256') {
                        contractData[x.name] = value.toNumber();
                    }
                    else {
                        contractData[x.name] = value;
                    }
                }
            });

            resolve(contractData);
        }));
    }

    public async GetBlock(identifer: string): Promise<any> {
        return await this.queue.ExecuteJob(() =>
            new Promise((resolve, reject) => {
                this.web3.eth.getBlock(identifer, (error, block) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(block);
                    }
                });
            }));
    }

    public async GetTransactionReceipt(txHash: string): Promise<any> {
        return await this.queue.ExecuteJob(() => new Promise((resolve, reject) => {
            this.web3.eth.getTransactionReceipt(txHash, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        }));
    }

    public async GetTransaction(txHash: string): Promise<any> {
        return await this.queue.ExecuteJob(async () => new Promise((resolve, reject) => {
            this.web3.eth.getTransaction(txHash, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        }));
    }

    public async GetNetworkId(): Promise<number> {
        return await this.queue.ExecuteJob(async () => new Promise((resolve, reject) => {
            this.web3.version.getNetwork((err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        }));
    }

    public async EstimateTx(tx: EthereumTxInput): Promise<EthereumEstimate> {
        return await this.queue.ExecuteJob(async () => new Promise((resolve, reject) => {
            const rawEstimate = this.web3.eth.estimateGas(tx.AsRawTx());
            const gasPrice = this.web3.eth.gasPrice.toNumber();
            const nonce = this.web3.eth.getTransactionCount(tx.FromAddress().AsHex());

            resolve(new EthereumEstimate(tx, nonce, rawEstimate, gasPrice));
        }));
    }

    public async PrepareEstimatedTx(tx: EthereumEstimate): Promise<any> {
        const prepared = tx.TxInput().AsRawTx();
        prepared.nonce = tx.Nonce();
        prepared.gasPrice = this.web3.toHex(tx.GasPrice());
        prepared.gasLimit = this.web3.toHex(tx.GasEstimate());

        return new Promise<any>(resolve => resolve(prepared));
    }

    public async SendSignedTx(txBytesAsHex: string): Promise<string> {
        return await this.queue.ExecuteJob(async () => new Promise((resolve, reject) => {
            this.web3.eth.sendRawTransaction(txBytesAsHex, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        }));
    }

    public async WaitForTx(txHash: string): Promise<any> {
        let tx: any;

        while (tx === undefined) {
            tx = await this.GetTransactionReceipt(txHash);

            if (tx == null) {
                await Task.Wait(3000);
                tx = undefined;
            }
        }

        return tx;
    }

    public async GetBalance(address: string): Promise<number> {
        return await this.queue.ExecuteJob(async () => new Promise((resolve, reject) => {
            this.web3.eth.getBalance(address, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    const wei = result.toNumber();
                    const ether = this.web3.fromWei(wei, 'ether');
                    resolve(ether);
                }
            });
        }));
    }
}