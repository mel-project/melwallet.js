import { ThemelioWallet, MelwalletdClient } from '../src/themelio-wallet'
import { describe, expect, test } from '@jest/globals';
import { unwrap_nullable_promise } from '../src/utils';
/**
 * Dummy test
 */
describe('Dummy test', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy()
  })

  it('DummyClass is instantiable', () => {

    async function main() {
        let client = new MelwalletdClient('127.0.0.1:11773')
        await unwrap_nullable_promise(client.get_wallet('test1231232'))
          .then(async (wallet: ThemelioWallet) => {
            console.log(`requesting to unlock: \`${await wallet.get_name()}\``);
            await wallet.unlock("123")
            let summary = await wallet.get_summary();
            console.log(summary)
            console.log('unlocked');
      
            console.log("pk: ", await wallet.export_sk("123"))
            try {
              console.log("faucet? ", await wallet.send_faucet())
            }
            catch {
              console.log("sending faucet failed")
            }
            console.log('locking')
            await wallet.lock()
            let new_summary = await wallet.get_summary()
            console.log("is locked: ", new_summary.locked)
            console.log("how much money is in here: ", await wallet.get_balances())
          })
          // .then(balances => console.log(balances))
          .catch((err) => console.log(err))
      }

  })
})
