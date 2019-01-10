import { EthereumWeb3Adapter } from './../../Ethereum/web3';
import { FakeWeb3 } from './../utils/FakeWeb3';
import { EthType } from './../utils/EthType';
import { Contract } from './../utils/Contract';
import { assert } from 'chai';

import "mocha";

describe('EventTests', () => {
    describe('Read events from the chain', () => {
        it('should read the existing events on a block', async () => {
            const fake_contract = new Contract();
            const fake_eth = new EthType();
            const fake_web3 = new FakeWeb3();

            const test_payload = [{
                "logIndex": 0,
                "transactionIndex": 0,
                "transactionHash": "0x8e71ee5d6778785d6a8f104154776218625bb376a74476e0cb75b2a4167087dd",
                "blockHash": "0xa6345f613f59b612e787a77da37342598e7a3df168c249d73cc6d1246ce6ec42",
                "blockNumber": 8,
                "address": "0xe88e6a060c5f5f71cd9f284605548ec46874e699",
                "type": "mined",
                "event": "DownloadRequestEvent",
                "args": {
                    "sender": "0x87f0a3ce6db9a48e599de3ef67cc56ef865abde2"
                }
            }];

            const expected = [{ "event": "DownloadRequestEvent", "args": { "sender": "0x87f0a3ce6db9a48e599de3ef67cc56ef865abde2" } }];

            fake_contract.payload = test_payload;
            fake_eth.contract_instance = fake_contract;
            fake_web3.eth = fake_eth;

            const Web3Adapter = new EthereumWeb3Adapter("FakeProvider", fake_web3);

            const events = await Web3Adapter.GetEvents("123", "abi", 0);
            assert.equal(JSON.stringify(expected), JSON.stringify(events));
        });
    });
});