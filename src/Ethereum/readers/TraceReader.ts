import { IReader } from './../../interfaces';
import { EthereumAddress } from './../models';

class TraceAddressExtractor {
    public static ExtractAddressesFromTrace(trace: any): EthereumAddress {
        let address: EthereumAddress;

        if (trace.op === "CALL" || trace.op === "DELEGATECALL" || trace.op === "CALLER") {
            let possibleAddress = trace.stack[0];

            if (possibleAddress) {
                if (trace.op === "CALL" || trace.op === "DELEGATECALL") {
                    possibleAddress = trace.stack[trace.stack.length - 2];
                }
                address = EthereumAddress.ParseFromStack(possibleAddress);
            }
        } else if (trace.op === "SSTORE") {
            for (const key of Object.keys(trace.storage)) {
                address = EthereumAddress.ParseFromStack(trace.storage[key]);
                break;
            }
        }

        return address;
    }
}

export class TraceReader implements IReader<EthereumAddress> {
    private readonly traceLog: any;
    private readonly addressSet: Map<string, EthereumAddress>;
    private index: number;
    private currentAddress: EthereumAddress;

    constructor(traceLog: any) {
        this.traceLog = traceLog;
        this.index = -1;
        this.addressSet = new Map<string, EthereumAddress>();
    }

    public async MoveNext(): Promise<boolean> {
        const lastCount = this.addressSet.size;
        this.currentAddress = null;

        while (lastCount === this.addressSet.size && (this.index += 1) < this.traceLog.length) {
            const address = TraceAddressExtractor.ExtractAddressesFromTrace(this.traceLog[this.index]);

            if (address && !this.addressSet.has(address.AsHex())) {
                this.addressSet.set(address.AsHex(), address);
                this.currentAddress = address;
            }
        }

        return this.addressSet.size > lastCount;
    }

    public async Read(): Promise<EthereumAddress> {
        return new Promise<EthereumAddress>(resolve => resolve(this.currentAddress));
    }
}