# Melwallet.js

The reference implementation of a wallet client in javascript.

`melwallet.js` is a client library for interacting with melwalletd. It exposes all endpoints through `MelwalletdClient` and nicely wraps wallet-specific endpoints in `MelwalletdWallet`. If you are familiar with our cli tool [`melwallet-cli`](https://github.com/themeliolabs/melwallet-client), that is starting point for the functionality to can expect.

## Library Priorities

* type safety
* ease of use
* flexibility

`melwallet.js` uses `typescript-is` to ensure type safety at runtime; a method will never return an unexpected or incomplete type. 

These api's were designed with ease of use in mind withcout sacrificing the ability to perform in advanced usecases.

Lastly, this library aims to provide a minimal interface, `ThemelioWallet`, to create wallets on other backends. This interface will serve as the foundation for wallet-generic tooling.

## Getting Started

Before running this library, make sure melwalletd is running in the background. If it isn't, start it by running this script in the terminal of choice

```
cargo install --locked melwalletd
melwalletd --wallet-dir /tmp/themelio-wallet-test --network testnet
```

For more a list of endpoints and terminal  checkout the melwalletd [readme](https://github.com/themeliolabs/melwalletd) 
## Basic Usage


```ts
    /// create a melwalletd client at the default location `http://127.0.0.1:11773`
    const client: MelwalletdClient = new MelwalletdClient();
    // create your first wallet, `wallet_name`
    await client.create_wallet("wallet_name", "password");
    // try to get the wallet
    const wallet: MelwalletdWallet =  client.get_wallet("wallet_name");
```

Keep in mind, these api's are wrapping network and database protocols, so there is always a chance for http server errors. The aim of `MelwalletdClient` and `MelwalletdWallet` is to only ever either 1. return the appropriate type or 2. throw an error.

## MelwalletdClient functions

| Name | Return type| Description|
--- | --- | ---













### Dev Install
If you would like to use `npm`

```
git clone https://github.com/themeliolabs/melwallet.js.git &&
npm install 
```

## Tests

**ONLY RUN TESTS ON TESTNET WALLETS UNLESS YOU KNOW WHAT YOU ARE DOING**

Everything uses `jest`.

It is recommended to use `jest` in your IDE with watch mode, but to manually run tests, run:

```
npm test
```
