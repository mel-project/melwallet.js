import { setTimeout } from 'timers/promises';
import { MelwalletdClient, MelwalletdWallet } from '../src/melwalletd-interface';
import { RawTransactionInfo } from '../src/types/request-types';
import { send_faucet } from '../src/utils/wallet-utils';

// return true if the transaction is confirmed
// let is_pending = async (
//   client: MelwalletdClient,
//   wallet: MelwalletdWallet,
//   txhash: string,
// ) => {
//   let wallet_name = await wallet.get_name();
//   let tx_info: RawTransactionInfo = await client.get_transaction(
//     wallet_name,
//     txhash,
//   );
//   return tx_info.confirmed_height;
// };
export async function get_faucet_confirmation() {
  /// create a melwalletd client at the default location `http://127.0.0.1:11773`
  const client: MelwalletdClient = new MelwalletdClient();

  try {
    // create your first wallet, `wallet_name`
    await client.create_wallet('wallet_name', 'password');
  } catch {
    // either wallet exists or there has been some other network error
  }
  // try to get the wallet
  const wallet: MelwalletdWallet = await client.get_wallet('wallet_name');
  // send the faucet tx and save it's txhash
  const txhash = await send_faucet(wallet);

  while (true) {
    // let height = await is_pending(client, wallet, txhash);
    let height = 1;
    console.log(height);
    if (!height) {
      await setTimeout(1000);
    } else {
      console.log(`Transaction confirmed at height: ${height}`);
      break;
    }
  }
}
