

import { MelwalletdWallet, MelwalletdClient } from '../src/themelio-wallet';
import {describe as _describe, it as _it, expect} from '@jest/globals';

import { promise_or_false, random_hex_string, ThemelioJson, unwrap_nullable_promise } from '../src/utils';
import { CoinData, Denom, Header, NetID, Transaction, TxKind } from '../src/themelio-types';
import { assertType, is } from 'typescript-is';
import { PreparedTransaction, WalletList } from '../src/wallet-types';

/// many of the tests simply run methods with known valid data
/// since it's assumed that the method uses `assertType` to verify type safety.
/// If calling the method doesn't fail we can assume the defined type has been returned
/// that is enough to give reasonable certainty in program correctness

var describe = _describe;
var it = _it;
interface WalletInfo {
  name: string;
  password: string;
}
interface Store {
  wallet_info: WalletInfo;
  client: MelwalletdClient;
  wallet: MelwalletdWallet;
}

// lazy load Store and memoize
// creates a client then creates the test_wallet and builds a `MelwalletdWallet`
const get_store: () => Promise<Store> = (() => {
  const test_wallet_name = 'test_wallet';
  const test_wallet_password = '123';
  const melwalletd_addr = 'http://127.0.0.1:11773';

  var store: Store;
  var attempts: number = 0
  expect(attempts).toBeLessThan(2);

  // always returns a store if test passes
  return async () => {

    if (!store) {
      attempts += 1
      const wallet_info: WalletInfo = {
        name: test_wallet_name,
        password: test_wallet_password,
      };
      const client: MelwalletdClient = new MelwalletdClient(melwalletd_addr);

      expect(is<Header>(await client.get_summary())).toBeTruthy()
      let created = await client.create_wallet(wallet_info.name, wallet_info.password, null);
      const wallet: MelwalletdWallet | false = await promise_or_false(unwrap_nullable_promise(
        client.get_wallet(wallet_info.name),
      ));
      expect(wallet).toBeTruthy();
      expect(client).toBeTruthy();
      store = { wallet_info, client, wallet: wallet as MelwalletdWallet };
    }
    return store;
  };
})();



describe('Test Basic util features', () => {
  it('bigint.toString', () => {
    let big = 11111111111111111111n
    expect(big.toString()).toBe("11111111111111111111")
  })
  it('Json.stringify(int) => bigint', () => {
    let big = '[1111111111]'
    let json = ThemelioJson.parse(big) as [bigint]
    expect(json).toStrictEqual([1111111111n])
  })
})

describe("Initialize Store, end tests otherwise", ()=>{
  /// initializes the store 
  it('Creates Client and MelwalletdWallet', async () => {
    let store = await get_store();
  });

})

describe('Client Features', () => {
  const WALLET_NAMES = [...Array(10).keys()].map(()=>random_hex_string(32));

  /// tests for failure of method
  it('tests get_wallet', async () => {
    let { client,wallet_info } = await get_store()
    await client.get_wallet(wallet_info.name)

  });

  /// if this fails, the next test should also fail
  it('create a few different wallets', async () => {
    let { client } = await get_store()
    let creations = await Promise.all(WALLET_NAMES
    .map(async (name:string)=>
      client.create_wallet(name, name, null)
    ));
    let created_all_wallets = creations.reduce((r,v) => r && v, true)
    expect(created_all_wallets).toBeTruthy()
  });

  ///compares the created wallets to the list of all wallets
  it('tests list_wallets', async () => {
    let { client } = await get_store()
    let wallets: WalletList = await client.list_wallets()
    expect(wallets.has(WALLET_NAMES[0])).toBeTruthy()
    let is_wallet_in_list = WALLET_NAMES.map((name)=>wallets.has(name))
    let all_wallets_in_list = is_wallet_in_list.reduce((r, v) => r && v, true)
    expect(all_wallets_in_list).toBeTruthy()
  });

  ///
  it('tests get_pool', async () => {
    let { client } = await get_store()
    let pool = await client.get_pool({left: Denom.MEL, right: Denom.SYM})
    expect(pool)
  });

  ///
  it('tests get_summary', async () => {
    let { client } = await get_store()
    expect(await client.get_summary())
  });
})


///
describe('Themelio Wallet', () => {


  ///
  it('Unlock the wallet', async () => {
    let store = await get_store();
    let wallet = store.wallet;
    expect(await wallet.unlock(store.wallet_info.password)).toBeTruthy();
  });

  ///
  it('Get wallet summary', async () => {
    let { wallet } = await get_store();
    let summary = await wallet.get_summary();
  });

  ///
  it('Request the private key', async () => {
    let { wallet, wallet_info } = await get_store();
    let pk = await wallet.export_sk(wallet_info.password);
    expect(typeof pk).toBe('string');
  });

  ///
  it('Try to tap faucet', async () => {
    let { wallet } = await get_store();
    if ((await wallet.get_network()) == NetID.Testnet) {
      let txhash: string = await wallet.send_faucet();

      expect(txhash).toBeTruthy();
    } else {
      expect(true);
    }
  });



  ///
  it('Each balance is a `bigint`', async () => {
    let { wallet } = await get_store();
    let balances: Map<Denom, bigint> = await wallet.get_balances();
    Object.entries(balances.entries()).forEach((entry) => {
      let [denom, value] = entry
      expect(typeof value).toBe('bigint')
    });

  });

  ///
  it('prepare_transactions', async ()=>{
    let {wallet} = await get_store();
    let outputs: CoinData[] = [{
      covhash: await wallet.get_address(),
      value: 1001000000n,
      denom: Denom.MEL,
      additional_data: ""
    }]
  
    let ptx: PreparedTransaction = {
      kind: TxKind.Faucet,
      inputs: [],
      outputs: outputs,
      covenants: [],
      data: "",
      nobalance: [],
      fee_ballast: 0n,
      signing_key: null
    }
    let tx: Transaction = await wallet.prepare_transaction(ptx)
    expect(tx);
  });

  /// After testing is complete, lock the wallet
  it('Lock the wallet', async () => {
    let { wallet } = await get_store();
    let locked = await wallet.lock();
    let new_summary = await wallet.get_summary();
    expect(locked).toBe(true);
    expect(new_summary.locked).toBeTruthy();
    expect(new_summary.locked).toEqual(locked);
  });
});
