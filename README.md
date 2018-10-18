# Torchwood

An ethereum library for watching contract changes on the chain.

## Setup
- Clone this repo and cd into Torchwood
-  `npm i`
-  `npm build` to build the project (creates release folder with js files & maps)
-  `npm run package` same as npm build, but also creates a `package.json` file for release and a `package.zip`
-  `npm test` to run all tests

## Using the library
You can use Torchwood to create your own oracle. For this you need:

- A running blockchain
    - e.g. `ganache-cli`
- Some transactions on the chain
- A config file pointing to the blockchain
- An oracle file

Example oracle project that uses torchwood: https://github.com/liliankasem/torchwood-demo/tree/master/oracle

1. `git clone https://github.com/liliankasem/torchwood-demo.git`
2. `cd torchwood-demo/oracle`
3. `npm i`
4. Run `ganache-cli`
   - Run some transactions on the chain (you can use the sample contract project)
5. Inside `config/default.json`, update rpcUrl to your chain instance
    - e.g.  `http://127.0.0.1:8545`
6. `npm run build`
7. `npm run oracle`

You should see things that have happened on the chain:

``` LOG
info: Local File System './demo/1539802767777-b78cdfceb7'
info: Console Event Bus
debug: Reading Block 0
info: {"_block":1,"_address":"0x48b85cc7abe6f551929890c0ac5f738177379f63","_balance":"99.9464578"}
info: {"_block":2,"_address":"0x48b85cc7abe6f551929890c0ac5f738177379f63","_balance":"99.9464578"}
info: {"_block":3,"_address":"0x48b85cc7abe6f551929890c0ac5f738177379f63","_balance":"99.9464578"}
info: {"_state":"0","_block":3,"_address":"0x715ed963a60658126c5e86801f448ec8fee5ecc3","_balance":"0"}
info: {"_block":4,"_address":"0x48b85cc7abe6f551929890c0ac5f738177379f63","_balance":"99.9464578"}
info: {"_block":5,"_address":"0x48b85cc7abe6f551929890c0ac5f738177379f63","_balance":"99.9464578"}
info: {"_state":"1","_block":5,"_address":"0x715ed963a60658126c5e86801f448ec8fee5ecc3","_balance":"0"}
```

NB: this is assuming you have made transactions on the chain.

If you don't see any details about specific changes of a contract, it's probably because the hashes of the contracts are different. The names of the folders inside the `Code` folder are actually the hashes of the contract. However because torchwood uses a different version of solc to truffle, they end up having different hashes which is why we currently have to do this manually. Two possible solutions for this:

- A) Use torchwood to compile and deploy the contracts onto the chain
- B) A feature we want to develop is providing the ABI's to torchwood instead of having torchwood get the ABI's by compiling the contracts from the .sol files provided

In the case that this happens:

1. Stop the oracle
2. Reset block value in `watcherConfig.json` block back to 0
3. Copy the `abi.json` file (from the folder in `demo/chainid/Code` that contains it) into the other hash folders inside the `Code` folder
4. Run the oracle again `npm run oracle`

### Sample contract project
Example truffle contract project: https://github.com/liliankasem/torchwood-demo/tree/master/truffle

The following will deploy a `Flag` contract onto the chain, it will also change the state of the flag from open (0) to closed (1).

1. `git clone https://github.com/liliankasem/torchwood-demo.git`
2. `cd torchwood-demo/truffle`
3. Update the `truffle.js` network with your chain instance
    - e.g.  `http://127.0.0.1:8545`
4. `truffle compile`
5. `truffle test`