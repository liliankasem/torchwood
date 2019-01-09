import { EthereumAddress } from './EthereumAddress';
import { EthereumTx } from './EthereumTx';

export class EthereumBlock {
    private readonly content;

    constructor(content: any) {
        this.content = content;
    }

    public TransactionCount(): number {
        return this.content.transactions.length;
    }

    public GetTransactionHash(index: number): string {
        return this.content.transactions[index];
    }

    public BlockNumber(): number {
        return this.content.number;
    }

    public BlockHash(): string {
        return this.content.hash;
    }

    public AsSerializable(): string {
        return JSON.stringify(this.content);
    }
}

export class EthereumBlockDetail {
    private block: EthereumBlock;
    public txs: EthereumTx[];
    public addresses: EthereumAddress[];

    constructor(block: EthereumBlock, txs: EthereumTx[], addresses: EthereumAddress[]) {
        this.block = block;
        this.txs = txs;
        this.addresses = addresses;
    }

    public Block(): EthereumBlock {
        return this.block;
    }
}