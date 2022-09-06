import { ThemelioWallet, MelwalletdClient } from '../src/themelio-wallet'
import { describe, expect, test } from '@jest/globals';
import { unwrap_nullable_promise } from '../src/utils';
import assert from 'assert';
import { Wallet } from '../src/wallet-types';
import { NetID } from '../src/themelio-types';


interface WalletInfo {
  name: string,
  password: string,
}
interface Store {
  wallet_info: WalletInfo
  client: MelwalletdClient
  wallet: ThemelioWallet
}

// lazy load Store and memoize
const get_store: () => Promise<Store> = (() => {

  const test_wallet_name = "test_wallet"
  const test_wallet_password = "123"
  const melwalletd_addr = '127.0.0.1:11773'

  var store: Store;

  // always returns a store if test passes
  return async () => {
    if (!store) {
      const wallet_info: WalletInfo = { name: test_wallet_name, password: test_wallet_password }
      const client: MelwalletdClient = new MelwalletdClient(melwalletd_addr)
      const wallet: ThemelioWallet = await unwrap_nullable_promise(client.get_wallet(wallet_info.name))
      expect(wallet)
      expect(client)
      store = { wallet_info, client, wallet };
    }
    return store
  }
})()


/**
 * Dummy test
 */
describe('Dummy test', () => {
  it('Creates Client and ThemelioWallet', async () => {
    expect(await get_store()).toBeTruthy();
  })
  it('Unlocks the wallet', async () => {
    let store = await get_store();
    let wallet = store.wallet
    expect(await wallet.unlock(store.wallet_info.password))
  })
  it('Get wallet summary', async () => {
    let { wallet } = await get_store();
    let summary = await wallet.get_summary();
  })
  it('Requests the private key', async () => {
    let { wallet, wallet_info } = await get_store();
    let pk = await wallet.export_sk(wallet_info.password)
    expect(typeof (pk)).toBe("string")
  })
  it('Try to tap faucet', async () => {
    let { wallet } = await get_store();
    if (await wallet.get_network() == NetID.Testnet) {
      let txhash = await wallet.send_faucet();
      expect(typeof (txhash)).toBe("string")
    }
    else {
      expect(true);
    }
  })

  it('Lock the wallet', async () => {
    let { wallet } = await get_store();

    await wallet.lock()
    let new_summary = await wallet.get_summary()
    expect(new_summary.locked).toBeTruthy();
  })
  it('', async () => {
    let { wallet } = await get_store();
    console.log("how much money is in here: ", await wallet.get_balances())
  })

})


