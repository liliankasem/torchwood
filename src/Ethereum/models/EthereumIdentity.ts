import pad = require('pad');

export class EthereumIdentity {
    private networkId: number;
    private originHash: string;
    private identity: string;

    constructor(networkId: number, originHash: string) {
        this.networkId = networkId ? networkId : 0;
        this.originHash = originHash;
        this.identity = `${pad(this.networkId.toString(), 10, "0")}-${originHash.substr(2, 10)}`;
    }

    public AsString(): string {
        return this.identity;
    }
}