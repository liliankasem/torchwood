import { IBlockTracker } from './../../interfaces/';
import { IEthereumReader } from './../IEthereumReader';
import { BlockReader } from './BlockReader';
import { BlockDetailReader } from './BlockDetailReader';

import {
    EthereumBlockDetail
} from './../models';

export class BlockDetailIterator {
    private details: BlockDetailReader;
    private readonly blockReader: BlockReader;

    constructor(eth: IEthereumReader, blockTracker: IBlockTracker) {
        this.details = new BlockDetailReader(eth);
        this.blockReader = new BlockReader(eth, blockTracker);
    }

    public async MoveNext(): Promise<boolean> {
        return this.blockReader.MoveNext();
    }

    public async Read(): Promise<EthereumBlockDetail> {
        const block = await this.blockReader.ReadBlock();
        return await this.details.Read(block);
    }
}
