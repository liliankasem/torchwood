[![Build Status](https://dev.azure.com/dwrdev/Torchwood/_apis/build/status/Torchwood-Master)](https://dev.azure.com/dwrdev/Torchwood/_build/latest?definitionId=114)

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
- The .sol file of the contract you want to watch
- An oracle file

## Getting Torchwood to read contracts not compiled with Torchwood
Torchwood uses the default solcjs settings when compiling, this is equivalent of running `solc --optimize` which should compile and optimize the contract for 200 runs. If you compiled and deployed the contract using Truffle or another testing framework, **make sure that it is compiling the contracts with the optimizer enabled.**

### Enabling optimizer for Truffle
By default Truffle **does not** have the optimizer enabled when compiled contracts. To enable the optimizer you must open your `truffle.js` or `truffle-config.js` file and adjust your `module.exports` object to look like the following:
```js
module.exports = {
  solc: { 
    optimizer: { 
      enabled: true, // Enable solc optimizer
    },
  }
};
```

Follow the README of this sample oracle project that uses Torchwood: https://github.com/liliankasem/torchwood-oracle
