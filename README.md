# Melwallet.js
[![melwallet.js](https://img.shields.io/badge/melwallet.js-docs-grey?labelColor=green&style=flat&link=https://themeliolabs.github.io/melwallet.js/)](https://themeliolabs.github.io/melwallet.js/)

The reference implementation of a wallet client in typescript.


## Quick start

First install the library and melwalletd
```bash
npm install melwallet.js
cargo install --locked melwalletd
melwalletd --wallet-dir /tmp/themelio-wallet-test --network testnet
```

then you can start using it in your project

```ts
import {MelwalletdClient, MelwalletdWallet} from 'melwallet.js'
/// create a melwalletd client at the default location `http://127.0.0.1:11773`
const client: MelwalletdClient = new MelwalletdClient();
// create your first wallet, `wallet_name`
await client.create_wallet('wallet_name', 'password');
// try to get the wallet
const wallet: MelwalletdWallet = client.get_wallet('wallet_name');
```

## Library Priorities

`melwallet.js` is a client library for interacting with melwalletd. It exposes all melwalletd methods through `MelwalletdClient`, an rpc interface, and nicely wraps wallet-specific endpoints in `MelwalletdWallet`. If you are familiar with our cli tool [`melwallet-cli`](https://github.com/themeliolabs/melwallet-client), that is starting point for the functionality to expect.

- type safety
- ease of use
- flexibility

`melwallet.js` uses `typescript-is` to ensure type safety at runtime; a method will never return an unexpected or incomplete type.

These api's were designed with ease of use in mind without sacrificing the ability to perform in advanced usecases.

Lastly, this library to provides a minimal interface, `ThemelioWallet`, to create wallets with other backends. This interface will serve as the foundation for wallet-generic tooling.

## Getting Started

Before this library can be of any use, `melwalletd` must be running in the background. If it isn't open, spawn a terminal and run this script:

```
cargo install --locked melwalletd
melwalletd --wallet-dir /tmp/themelio-wallet-test --network testnet
```


For more information, including a list of rpc methods, visit the melwalletd [readme](https://github.com/themeliolabs/melwalletd)

## Basic Usage

Keep in mind, these api's are wrapping network and database protocols, so there is always a chance for http server errors. The aim of `MelwalletdClient` and `MelwalletdWallet` is to only ever either 

1. return the appropriate type or 
2. throw an error.

Here is an example of creating a wallet and then sending a faucet transaction based on user input, then waiting for the transaction to be confirmed
```ts
import {MelwalletdClient, MelwalletdWallet} from 'melwallet.js'
import {PrepareTxArgsHelpers} from 'melwallet.js/types'
/// create a melwalletd client at the default location `http://127.0.0.1:11773`
const client: MelwalletdClient = await new MelwalletdClient();
// create a first wallet, `faucet_wallet`
await client.create_wallet('faucet_wallet', '123');
// try to get the wallet
const wallet: MelwalletdWallet = await client.get_wallet('wallet_name');
// be sure to unlock the wallet before trying to send transactions 
await wallet.unlock('123')
// tapping the faucet, aka printing fake MEL, only works when not on the mainnet
// prepare the args for a faucet transaction sending a user defined amount of fake coins to send to this wallet
const ptx: PrepareTxArgs = await PrepareTxArgsHelpers.faucet(wallet, get_user_input_about_how_much_fake_money_they_want());
// prepare a faucet transaction 
const tx: Transaction = await wallet.prepare_tx(ptx);
// at this point it's possible to inspect the transaction to make the fields are to your users liking
get_user_input_about_transaction_fields(tx) // it could throw an error if the user doesn't like what they see
// send the transaction, this hash can then be used to check on the status of the transaction
const tx_hash = await wallet.send_tx(tx); 
// check if transaction has been confirmed, in a loop, waiting 1 second between checks
while(true){
    if(await wallet.tx_status(tx_hash)){
        break
    }
    setTimeout(1000)
}
console.log("sent faucet tx to: ", await wallet.get_name())
```
Another note, the Themelio blockchain doesn't have rollbacks! Once a transaction is confirmed it has become a part of the state forever. Unlike other blockchains, you can immediately trust the validity of a transaction without having to wait for far after a transaction has been added to the chain.



## Give us feedback

We are in the process of creating a platform to build the next generate of decentralized, off-chain, web3 protocols. To do that we need to be as user friendly as possible. If you have any ideas about how we can make this better, or you're interested in knowing more, please reach out to us on [discord](https://discord.gg/themelio) or [element](https://matrix.to/#/#community:matrix.themelio.org)!


### Tests

**ONLY RUN TESTS ON TESTNET WALLETS UNLESS YOU KNOW WHAT YOU ARE DOING**

It is recommended to use `jest` in your IDE with watch mode, but to manually run tests, run:

```
npm test
```

to automatically rerun tests when files change run

`npm test --watch`
