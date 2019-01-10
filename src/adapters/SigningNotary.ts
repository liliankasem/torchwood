import Tx = require('ethereumjs-tx');
import KeyFactory = require("keythereum");

import { ISigningNotary } from './../interfaces/ISigningNotary';
import { IStorage } from './../interfaces/IStorage';

export class SigningNotary implements ISigningNotary {
    private readonly storage: IStorage;
    private readonly secret: string;
    private readonly activeKeys: Map<string, Buffer>;

    constructor(storage: IStorage, secret: string) {
        this.storage = storage;
        this.secret = secret;

        // TODO: Replace this with some caching service as this is not thread safe
        // could cause memory leaks.
        this.activeKeys = new Map<string, Buffer>();
    }

    public async Sign(rawTx: any): Promise<string> {
        const key = await this.ReadKey(rawTx.from);
        const tx = new Tx(rawTx);
        tx.sign(key);
        return `0x${tx.serialize().toString('hex')}`;
    }

    private async ReadKey(address: string): Promise<Buffer> {
        if (!this.activeKeys.has(address)) {
            const rawContent = await this.storage.ReadItem(`keystore/${address}.json`);
            const keyContent = JSON.parse(rawContent);
            const recovered = KeyFactory.recover(this.secret, keyContent);
            this.activeKeys.set(address, new Buffer(recovered, 'hex'));
        }

        return this.activeKeys.get(address);
    }
}