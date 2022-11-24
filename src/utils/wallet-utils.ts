
import {
  CoinData,
  Denom,
  NetID,
  PoolKey,
  PoolKeyHelpers,
  Transaction,
  TxKind,
} from '../types/themelio-types';
import { bytesToHex, random_hex_string, stringToUTF8Bytes } from './utils';
import {
  PrepareTxArgs,
} from '../types/melwalletd-types';
import { ThemelioWallet } from '~/types/melwalletd-prot';


export function prepare_faucet_args(address: string, amount: bigint): Transaction {
  let data = random_hex_string(32);

  let outputs: CoinData[] = [
    {
      covhash: address,
      value: amount,
      denom: Denom.MEL,
      additional_data: '',
    },
  ];
  let tx: Transaction = {
    kind: TxKind.Faucet,
    inputs: [],
    outputs: outputs,
    covenants: [],
    data,
    fee: amount,
    sigs: [],
  };
  return tx;
}

/**
 * send a faucet transaction
 *
 * throws an error if attempting this on the mainnet
 *
 * @param  {bigint} [amount]
 * @returns {Promise<string>}
 */
export async function send_faucet(
  wallet: ThemelioWallet,
  amount?: bigint,
): Promise<string> {
  if ((await wallet.get_network()) === NetID.Mainnet)
    throw 'Cannot Tap faucet on Mainnet';
  if (!amount) amount = 1001000000n;
  let tx: Transaction = prepare_faucet_args(await wallet.get_address(), amount);
  return await wallet.send_tx(tx);
}
/**
 * 
 * 
 * @param  {string} address the address to send the result of the swap 
 * @param  {Denom} from the kind of denom to convert `from`
 * @param  {Denom} to the denom to conver `to`
 * @param  {bigint} value the amount of `from` to convert into `to`
 * @param  {string=''} additional_data
 * @returns Promise<PrepareTxArgs>
 */

export async function prepare_swap_to(
  address: string,
  from: Denom,
  to: Denom,
  value: bigint,

  additional_data: string = '',
): Promise<PrepareTxArgs> {
  let outputs: CoinData[] = [
    {
      covhash: address,
      value,
      denom: from,
      additional_data,
    },
  ];
  let poolkey: PoolKey = { left: from, right: to };
  const ptx: PrepareTxArgs = {
    kind: TxKind.Swap,
    data: PoolKeyHelpers.asBytes(poolkey),
    outputs,
  };
  return ptx;
}




// Compute total value flowing out of wallet from a list of coins
export function net_spent(tx: Transaction, self_covhash: string): bigint {
  return (
    tx.outputs
      .filter(cd => cd.covhash != self_covhash)
      .filter(cd => cd.denom == Denom.MEL)
      .map(cd => cd.value)
      .reduce((a, b) => a + b, 0n) + tx.fee
  );
}
