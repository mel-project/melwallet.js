import { assertType } from 'typescript-is';
import { RawCoinData, RawTransaction, RawWalletSummary } from '../types/request-types';
import { Denom } from '../types/denom'
import {
  CoinData,
  NetID,
  PoolKey,
  Transaction,
  TxKind,
} from '../types/themelio-types';
import { map_from_entries, random_hex_string, ThemelioJson } from './utils';
import {
  ThemelioWallet,
  UnpreparedTransaction,
  WalletSummary,
} from '../types/melwalletd-types';

export function int_to_netid(int: bigint | number): NetID {
  let num = Number(int)
  if (num === NetID.Mainnet) return NetID.Mainnet;
  if (num === NetID.Testnet) return NetID.Testnet;
  throw 'Unsupported network: ' + num;
}

export function netid_to_string(netid: NetID): string {
  if (netid === NetID.Mainnet) return "Mainnet";
  if (netid === NetID.Testnet) return "Testnet";
  throw 'Unsupported network: ' + netid;


}
export function number_to_txkind(num: number | bigint): TxKind {
  let txkind = Number(num);
  if (Object.values(TxKind).indexOf(txkind) >= 0) return txkind;
  throw 'Unknown Txkind';
}

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
  return `${poolkey.left.toJSON()}/${poolkey.right.toJSON()}`;
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


export function coin_data_from_raw(raw_coindata: RawCoinData): CoinData {
  let cd: any = raw_coindata;
  cd.denom = Denom.fromString(cd.denom)
  return cd;
}

export function tx_from_raw(raw_tx: RawTransaction): Transaction {
  let outputs: any = raw_tx.outputs;
  assertType<RawCoinData[]>(outputs)
  let tx: Transaction = Object.assign({}, raw_tx, {
    kind: Number(raw_tx.kind),
    outputs: outputs.map(coin_data_from_raw)
  });
  return tx;
}

export function wallet_summary_from_raw(
  raw_summary: RawWalletSummary,
): WalletSummary {
  let { total_micromel, staked_microsym, address, locked } = raw_summary;
  let network: NetID = int_to_netid(raw_summary.network);

  let balance_entries: [string, bigint][] = Object.entries(
    raw_summary.detailed_balance,
  );

  let detailed_balance: Map<Denom, bigint> = map_from_entries(
    balance_entries.map(entry => {
      let [key, value]: [string, bigint] = entry;
      let mapped: [Denom, bigint] = [Denom.fromHex('0x' + key), value];
      return mapped;
    }) as [Denom, bigint][],
  );

  let summary: WalletSummary = {
    total_micromel,
    detailed_balance,
    staked_microsym,
    network,
    address,
    locked,
  };
  return summary;
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
