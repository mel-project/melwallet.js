import { MelwalletdWallet, MelwalletdClient } from '../src/themelio-wallet';
import { describe, expect, test } from '@jest/globals';
import { promise_or_false, promise_value_or_error, random_hex_string, ThemelioJson, unwrap_nullable_promise } from '../src/utils';
import { Denom, Header, NetID } from '../src/themelio-types';
import { assertType } from 'typescript-is';
import { prepare_faucet } from '../src/wallet-utils';
import { PreparedTransaction, WalletList } from '../src/wallet-types';
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
      attempts == 1
      const wallet_info: WalletInfo = {
        name: test_wallet_name,
        password: test_wallet_password,
      };

      const client: MelwalletdClient = new MelwalletdClient(melwalletd_addr);
      expect(assertType<Header>(await client.get_summary()))
      let created = await client.create_wallet(wallet_info.name, wallet_info.password, null);
      const wallet: MelwalletdWallet | false = await promise_or_false(unwrap_nullable_promise(
        client.get_wallet(wallet_info.name),
      ));
      expect(wallet);
      expect(client);
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

describe('Client Features', () => {
  it('tests get_wallet', async () => {
    let { client,wallet_info } = await get_store()
    client.get_wallet(wallet_info.name)
  });
  const CREATED_WALLETS = Object.keys(Array(10)).map(()=>random_hex_string(64));
  it('create a few different wallets', async () => {
    let { client } = await get_store()
    let body = {
      password: "",
      secret: "",
    }
    let creations = await Promise.all(CREATED_WALLETS
    .map(async (name:string)=>
      client.create_wallet(name,body.password, body.secret)
    ));

    expect(creations.reduce((r,v) => r && v))
  });
  it('tests list_wallets', async () => {
    let { client } = await get_store()
    let wallets = await client.list_wallets()
    let is_wallet_in_list = CREATED_WALLETS.map(wallets.has)
    let all_wallets_in_list = is_wallet_in_list.reduce((r, v) => r && v)
    expect(all_wallets_in_list)
  });
  it('tests get_pool', async () => {
    let { client } = await get_store()
    let pool = await client.get_pool({left: Denom.MEL, right: Denom.SYM})
    expect(pool)
  });
  it('tests get_summary', async () => {
    let { client } = await get_store()
    expect(await client.get_summary())
  });
})

describe('Themelio Wallet', () => {
  it('Creates Client and MelwalletdWallet', async () => {
    expect(await get_store()).toBeTruthy();
  });
  it('Unlock the wallet', async () => {
    let store = await get_store();
    let wallet = store.wallet;
    expect(await wallet.unlock(store.wallet_info.password));
  });
  it('Get wallet summary', async () => {
    let { wallet } = await get_store();
    let summary = await wallet.get_summary();
  });
  it('Request the private key', async () => {
    let { wallet, wallet_info } = await get_store();
    let pk = await wallet.export_sk(wallet_info.password);
    expect(typeof pk).toBe('string');
  });
  it('Try to tap faucet', async () => {
    let { wallet } = await get_store();
    if ((await wallet.get_network()) == NetID.Testnet) {
      let txhash: string = await wallet.send_faucet();

      expect(txhash).toBeTruthy();
      console.log(txhash)
    } else {
      expect(true);
    }
  });

  it('Lock the wallet', async () => {
    let { wallet } = await get_store();
    let locked = await wallet.lock();
    let new_summary = await wallet.get_summary();
    expect(locked).toBe(true);
    expect(new_summary.locked).toBeTruthy();
    expect(new_summary.locked).toEqual(locked);
  });

  it('Each balance is a `bigint`', async () => {
    let { wallet } = await get_store();
    let balances: Map<Denom, bigint> = await wallet.get_balances();
    Object.entries(balances.entries()).forEach((entry) => {
      let [denom, value] = entry
      expect(typeof value).toBe('bigint')
    });

  });

  it('prepare_transactions', ()=>{

  });
  it('get_transaction', ()=>{

  })
});
