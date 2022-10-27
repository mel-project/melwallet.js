# Melwallet.js

The reference implementation of a wallet client in javascript.

`melwallet.js` is a client library for interacting with melwalletd. It exposes all endpoints through `MelwalletdClient` and nicely wraps wallet-specific endpoints in `MelwalletdWallet`. If you are familiar with our cli tool [`melwallet-cli`](https://github.com/themeliolabs/melwallet-client), that is starting point for the functionality to expect.

## Library Priorities

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

For more information, including a list of endpoints, visit the melwalletd [readme](https://github.com/themeliolabs/melwalletd)

## Basic Usage

```ts
/// create a melwalletd client at the default location `http://127.0.0.1:11773`
const client: MelwalletdClient = new MelwalletdClient();
// create your first wallet, `wallet_name`
await client.create_wallet('wallet_name', 'password');
// try to get the wallet
const wallet: MelwalletdWallet = client.get_wallet('wallet_name');
```

Keep in mind, these api's are wrapping network and database protocols, so there is always a chance for http server errors. The aim of `MelwalletdClient` and `MelwalletdWallet` is to only ever either 1. return the appropriate type or 2. throw an error.

## MelwalletdClient functions

| Name                   | Return type                             | Description                                                                                  |
| ---------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------- |
| get_name               | Promise&lt;string&gt;                   | Get the name of this wallet                                                                  |
| get_address            | Promise&lt;string&gt;                   | Get the wallet&#x27;s public key                                                             |
| get_summary            | Promise&lt;WalletSummary&gt;            | Get the associated WalletSummary                                                             |
| get_network            | Promise&lt;NetID&gt;                    | Get the NetID of the network to which this wallet belongs                                    |
| lock                   | Promise&lt;boolean&gt;                  | locks this wallet returns true if the request completes successfully                         |
| unlock                 | Promise&lt;boolean&gt;                  | unlocks this wallet given a password returns true if the request completes successfully      |
| export_sk              | Promise&lt;string&gt;                   | exports the wallets secret key this needs the wallet password even if the wallet is unlocked |
| get_balances           | Promise&lt;Map&lt;Denom, bigint&gt;&gt; | returns a map between a Denom and the amount of that denom in this wallet                    |
| prepare_transaction    | Promise&lt;Transaction&gt;              |
| send_faucet            | Promise&lt;string&gt;                   | send a faucet transaction throws an error if attempting this on the mainnet                  |
| send_tx                | Promise&lt;string&gt;                   | send a transaction                                                                           |
| get_transaction        | Promise&lt;Transaction&gt;              | request transaction information                                                              |
| melwalletd_request     | Promise&lt;JSONValue \| Object&gt;      | submits a request to melwalletd and parses the request as a json object                      |
| melwalletd_request_raw | Promise&lt;Response&gt;                 | submits a request to melwalletd                                                              |

### Dev Install

To install with npm

```
git clone https://github.com/themeliolabs/melwallet.js.git &&
npm install
```

### Tests

**ONLY RUN TESTS ON TESTNET WALLETS UNLESS YOU KNOW WHAT YOU ARE DOING**

It is recommended to use `jest` in your IDE with watch mode, but to manually run tests, run:

```
npm test
```

to automatically rerun tests when files change run

`npm test --watch`
