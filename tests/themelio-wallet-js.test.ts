

import { MelwalletdWallet, MelwalletdClient } from '../src/themelio-wallet';
import { describe as _describe, it as _it, expect } from '@jest/globals';
import { promise_or_false, random_hex_string, ThemelioJson, unwrap_nullable_promise } from '../src/utils';
import { CoinData, Denom, Header, NetID, Transaction, TxKind } from '../src/themelio-types';
import { assertType, is } from 'typescript-is';
import { PreparedTransaction, WalletList } from '../src/wallet-types';
import { get_faucet_confirmation } from '../examples/wait_for_faucet_transaction';


/// ONLY RUN TESTS ON TESTNET WALLETS UNLESS YOU KNOW WHAT YOU ARE DOING
const TESTNET_ONLY = false

/// many of the tests simply run methods with known valid data
/// The library was written using `typescript-is` `assertType` to verify type safety.
/// If calling the method doesn't fail we can assume the defined type has been returned
/// that is enough to give reasonable certainty in program correctness

/// TODO: Improve testing of failures

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
  const melwalletd_base_url = 'http://127.0.0.1';
  const melwalletd_port = 11773

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
      const client: MelwalletdClient = new MelwalletdClient(melwalletd_base_url, melwalletd_port);
      const header: Header = await client.get_summary();
      expect(expect(is<Header>(header)).toBeTruthy()) // melwalletd is running

      if (TESTNET_ONLY) /// fail if not testnet and TESTNET_ONLY
        expect(header.network === NetID.Testnet).toBeTruthy()

      try {
        await client.create_wallet(wallet_info.name, wallet_info.password);
      }
      catch { }
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

describe("Initialize Store, end tests otherwise", () => {
  /// initializes the store 
  it('Creates Client and MelwalletdWallet', async () => {
    let store = await get_store();
  });

})

describe('Client Features', () => {
  const WALLET_NAMES = [...Array(10).keys()].map(() => random_hex_string(32));

  /// tests for failure of method
  it('tests get_wallet', async () => {
    let { client, wallet_info } = await get_store()
    await client.get_wallet(wallet_info.name)

  });

  /// if this fails, the next test should also fail
  it('create a few different wallets', async () => {
    let { client } = await get_store()
    let created_all_wallets = await Promise.all(WALLET_NAMES
      .map(async (name: string) =>
        client.create_wallet(name, name)
      )).catch(() => false)
      .then(() => true);
    expect(created_all_wallets).toBeTruthy()
  });

  ///compares the created wallets to the list of all wallets
  it('tests list_wallets', async () => {
    let { client } = await get_store()
    let wallets: WalletList = await client.list_wallets()

    // check if each wallet_name is contained in the list
    // this should be true for every wallet since every wallet was created in the test above
    let is_wallet_in_list = WALLET_NAMES.map((name) => wallets.has(name))

    // if there is even one false, then this whole reduce is false
    // true if all wallets are in the summary
    let all_wallets_in_list = is_wallet_in_list.reduce((r, v) => r && v, true)
    expect(all_wallets_in_list).toBeTruthy()
  });

  /// Get the MEL/SYM pool
  it('tests get_pool', async () => {
    let { client } = await get_store()
    let pool = await client.get_pool({ left: Denom.MEL, right: Denom.SYM })
    expect(pool)
  });

  /// Get the melwalletd summary
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
    expect(summary).toBeTruthy()
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
  it('prepare_transactions', async () => {
    let { wallet } = await get_store();
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

  /// it gets a transaction based on hash
  it('send a transaction and fetch it by hash', async () => {
    let { wallet } = await get_store()
    let txhash: string = await wallet.send_faucet()
    let tx: Transaction = await wallet.get_transaction(txhash)
  })
  /// After testing is complete, lock the wallet
  it('Lock the wallet', async () => {
    let { wallet } = await get_store();
    let summary = await wallet.get_summary();
    expect(summary.locked).toBe(false);
    let locked = await wallet.lock();
    let new_summary = await wallet.get_summary();
    expect(locked).toBe(true);
    expect(new_summary.locked).toBeTruthy();
    expect(new_summary.locked).toEqual(locked);
  });
});

describe.skip("run examples", () => {
  it("wait for faucet confirmation", get_faucet_confirmation, 60 * 1000)
})