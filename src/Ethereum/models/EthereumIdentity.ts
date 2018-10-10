import { format } from 'url';

export class EthereumIdentity {
    private networkId: number;
    private originHash: string;
    private identity: string;

    constructor(networkId: number, originHash: string) {
        this.networkId = networkId ? networkId : 0;
        this.originHash = originHash;
        this.identity = `${this.PadLeft(this.networkId.toString(), 10, "0")}-${originHash.substr(2, 10)}`;
    }

    public AsString(): string {
        return this.identity;
    }

    private PadLeft(input: string, size: number, char: string): string {
        let result = input;
        if (input.length < size) {
            const padSize = size - input.length;
            result = char.repeat(padSize).slice(0, padSize) + input;
        }

        return result;
    }
}