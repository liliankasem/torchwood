import { ISigningNotary } from './../interfaces/ISigningNotary';
import { IStorage } from './../interfaces/IStorage';
import { INotary } from '../interfaces/index';
import { Sha256Notary } from './Sha256Notary';

export class SigningNotaryCache implements ISigningNotary {
    private readonly storage: IStorage;
    private readonly baseNotary: ISigningNotary;
    private readonly hashingNotary: INotary;

    constructor(storage: IStorage, notary: ISigningNotary) {
        this.storage = storage;
        this.baseNotary = notary;
        this.hashingNotary = new Sha256Notary();
    }

    public async Sign(rawTx: any): Promise<string> {
        const cachePath = `SigningCache/${this.hashingNotary.GetSignature(JSON.stringify(rawTx))}.json`;

        let result: string;
        if (await this.storage.Exists(cachePath)) {
            result = await this.storage.ReadItem(cachePath);
        } else {
            result = await this.baseNotary.Sign(rawTx);
            await this.storage.SaveItem(cachePath, result);
        }

        return result;
    }
}