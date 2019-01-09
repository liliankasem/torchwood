
import { EthereumAddress } from './EthereumAddress';
import { HexString } from '../../interfaces/index';

export class EthereumTxInput {
    private readonly fromAddress: EthereumAddress;
    private readonly toAddress: EthereumAddress;
    private readonly byteCode: HexString;
    private readonly paramCode: HexString;

    constructor(fromAddress: EthereumAddress, byteCode: HexString, paramCode: HexString, toAddress: EthereumAddress = null) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.byteCode = byteCode;
        this.paramCode = paramCode;
    }

    public AsRawTx(): any {
        let toAddress = null;
        let data : HexString = null;

        if (this.toAddress !== null) {
            toAddress = this.toAddress.AsHex();
            data = this.paramCode;
        } else {
            data = this.byteCode.Prefix(this.paramCode);
        }

        return {
            from: this.fromAddress.AsHex(),
            to: toAddress,
            data: data.AsHex()
        };
    }

    public FromAddress(): EthereumAddress {
        return this.fromAddress;
    }
}