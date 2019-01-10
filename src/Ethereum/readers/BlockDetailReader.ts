import { IEthereumReader } from './../IEthereumReader';
import { TxReader } from './TxReader';

import {
    EthereumBlockDetail,
    EthereumTx,
    EthereumAddress,
    EthereumBlock
} from './../models';

class MapHelper {
    public static AddAddress(addressSet: Set<string>, array: EthereumAddress[], address: EthereumAddress) {
        const asHex = address.AsHex();

        if (!addressSet.has(asHex)) {
            addressSet.add(asHex);
            array.push(address);
        }
    }
}

export class BlockDetailReader {
    private eth: IEthereumReader;

    constructor(eth: IEthereumReader) {
        this.eth = eth;
    }

    public async Read(block: EthereumBlock): Promise<EthereumBlockDetail> {
        const txs : EthereumTx[] = [];
        const addressSet = new Set<string>();
        const addresses : EthereumAddress[] = [];

        if (block.TransactionCount() > 0) {
            const txReader = new TxReader(this.eth, block);

            while (await txReader.MoveNext()) {
                const tx = await txReader.ReadTx();
                txs.push(tx);
                MapHelper.AddAddress(addressSet, addresses, tx.OriginatingAddress());
                MapHelper.AddAddress(addressSet, addresses, tx.TargetAddress());

                const traceReader = await this.eth.GetTrace(tx);
                while (await traceReader.MoveNext()) {
                    MapHelper.AddAddress(addressSet, addresses, await traceReader.Read());
                }
            }
        }

        return new EthereumBlockDetail(block, txs, addresses);
    }
}