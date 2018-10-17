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

Example oracle project that uses torchwood: https://github.com/liliankasem/torchwood-demo/oracle

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

```
info: Local File System './demo/1539802767777-b78cdfceb7'
info: Console Event Bus
debug: Reading Block 0
info: {"_block":1,"_address":"0x48b85cc7abe6f551929890c0ac5f738177379f63","_balance":"99.9464578"}
info: {"_block":2,"_address":"0x48b85cc7abe6f551929890c0ac5f738177379f63","_balance":"99.9464578"}
info: {"_block":3,"_address":"0x48b85cc7abe6f551929890c0ac5f738177379f63","_balance":"99.9464578"}
info: {"_block":4,"_address":"0x48b85cc7abe6f551929890c0ac5f738177379f63","_balance":"99.9464578"}
info: {"_block":5,"_address":"0x48b85cc7abe6f551929890c0ac5f738177379f63","_balance":"99.9464578"}
```

NB: this is assuming you have made transactions on the chain.

### Seeing contract changes
You need to provide the abi.json for torchwood to pick up the details of changes that happen on the chain such as the state changing from 0 to 1.

To do that:

1. In the demo folder, create a `Contracts` folder and drop in the .sol files for the contracts you've deployed on the chain.

2. In the oracle, line 50, add or uncomment:

``` typescript
const contractFactory = new ContractFactory(web3Client, chainStorage, new Sha256Notary());
await contractFactory.UploadAndVerify(await chainStorage.ReadItem('Flag.sol')); //or name of your contract
```

3. Reset the `nextBlock` inside watcherConfig.json back to 0

4. Run `npm run build `

5. Run `npm run oracle`
   
This will create a folder `Code` folder inside of the `Contracts` folder with the `abi.json` inside it. This will need to be copied to the folders inside `demo/.../Code/..`, e.g. `demo/1539877-b7cdxxx/Code/89ebb48xxx/`
   - The names of the folders inside the `Code` folder are actually the hashes of the contract. However because torchwood uses a different version of solc to truffle, they end up having different hashes which is why we currently have to do this manually. Two solutions to this:
        - A) Use torchwood to compile and deploy the contracts onto the chain
        - B) A feature we want to develop is providing the ABI's to torchwood instead of having torchwood get the ABI's by compiling the contracts from the .sol files provided

You should see something like this:

``` LOG
debug: Compiling 14274a7e818b648d0c55db85e7a71445c48cdbc48925899c669e031ae7364215
debug: Persisting contract Flag
```

6. Reset the `nextBlock` inside watcherConfig.json back to 0
7. Run again `npm run oracle`

This time you should see the state changes that happened on the chain, in my example the state was set to 0 and then set to 1.

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

### Sample contract project
Example truffle contract project: https://github.com/liliankasem/torchwood-demo/truffle

The following will deploy a `Flag` contract onto the chain, it will also change the state of the flag from open (0) to closed (1).

1. `git clone https://github.com/liliankasem/torchwood-demo.git`
2. `cd torchwood-demo/truffle`
3. Update the `truffle.js` network with your chain instance
    - e.g.  `http://127.0.0.1:8545`
4. `truffle compile`
5. `truffle test`