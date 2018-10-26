import { EthType } from './EthType';
import Web3 = require('web3');

export class FakeWeb3 extends Web3 {
    public eth: EthType;
}