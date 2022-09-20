# Melwallet.js

The reference implementation of a wallet client in javascript.

`melwallet.js` is a client library for interacting with melwalletd. It exposes all endpoints through `MelwalletdClient` and nicely wraps wallet-specific endpoints in `MelwalletdWallet`. If you are familiar with our cli tool [`melwallet-cli`](https://github.com/themeliolabs/melwallet-client), that is starting point for the functionality to can expect.


## Basic Usage


```ts
    /// url of melwalletd server
    const melwalletd_base_url = 'http://127.0.0.1:11773';
    /// create a melwalletd client
    const client: MelwalletdClient = new MelwalletdClient(melwalletd_addr);
    // create your first wallet, `wallet_name`
    await client.create_wallet("wallet_name", "password", null);
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
