import { ThemelioWallet, MelwalletdClient } from '../src/themelio-wallet';
import { describe, expect, test } from '@jest/globals';
import { promise_or_false, promise_value_or_error, unwrap_nullable_promise, JSONBig } from '../src/utils';
import { Denom, Header, NetID } from '../src/themelio-types';
import { assertType } from 'typescript-is';
import { prepare_faucet } from '../src/wallet-utils';
import { PreparedTransaction } from '../src/wallet-types';
interface WalletInfo {
  name: string;
  password: string;
}
interface Store {
  wallet_info: WalletInfo;
  client: MelwalletdClient;
  wallet: ThemelioWallet;
}

// lazy load Store and memoize
const get_store: () => Promise<Store> = (() => {
  const test_wallet_name = 'test_wallet';
  const test_wallet_password = '123';
  const melwalletd_addr = '127.0.0.1:11773';

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
      const wallet: ThemelioWallet = await unwrap_nullable_promise(
        client.get_wallet(wallet_info.name),
      );
      expect(wallet);
      expect(client);
      store = { wallet_info, client, wallet };
    }
    return store;
  };
})();


describe('Test Basic util features', () => {
  it('bigint.toString', () => {
    let big = 11111111111111111111n
    expect(big.toString()).toBe("11111111111111111111")
  })
  it('Json.stringify(bigint)', () => {
    let big = 11111111111111111111n
    expect(JSONBig.stringify(big)).toBe('11111111111111111111')
  })
})

describe('Basic Themelio Wallet Tests', () => {
  it('Creates Client and ThemelioWallet', async () => {
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
});
