
import { Denom, DenomNames } from '../types/denom';
import {
  CoinData,
  NetID,
  PoolKey,
  Transaction,
  TxKind,
} from '../types/themelio-types';
import {random_hex_string } from './utils';
import {
  ThemelioWallet,
  UnpreparedTransaction,
} from '../types/melwalletd-types';


export function prepare_faucet(address: string, amount: bigint): Transaction {
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
  let tx: Transaction = prepare_faucet(await wallet.get_address(), amount);
  return await wallet.send_tx(tx);
}

export function poolkey_to_str(poolkey: PoolKey): string {
  return `${poolkey.left}/${poolkey.right}`;
}
export async function unprepared_swap(
  wallet: ThemelioWallet,
  from: Denom,
  to: Denom,
  value: bigint,

  additional_data: string = '',
): Promise<UnpreparedTransaction> {
  let outputs: CoinData[] = [
    {
      covhash: await wallet.get_address(),
      value,
      denom: from,
      additional_data,
    },
  ];
  let poolkey: PoolKey = { left: from, right: to };
  const unprepared: UnpreparedTransaction = {
    kind: TxKind.Swap,
    data: poolkey_to_str(poolkey),
    outputs,
  };
  return unprepared;
}




// Compute total value flowing out of wallet from a list of coins
export function net_spent(tx: Transaction, self_covhash: string): bigint {
  return (
    tx.outputs
      .filter(cd => cd.covhash != self_covhash)
      .filter(cd => cd.denom == DenomNames.MEL)
      .map(cd => cd.value)
      .reduce((a, b) => a + b, 0n) + tx.fee
  );
}
