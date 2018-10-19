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

Follow the README of this sample oracle project that uses Torchwood: https://github.com/liliankasem/torchwood-oracle