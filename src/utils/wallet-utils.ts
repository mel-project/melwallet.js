import { assertType } from 'typescript-is';
import { RawTransaction, RawWalletSummary } from '../types/request-types';
import {
  CoinData,
  Denom,
  DenomNames,
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

export function int_to_netid(num: bigint): NetID {
  if (num === BigInt(NetID.Mainnet)) return NetID.Mainnet;
  if (num === BigInt(NetID.Testnet)) return NetID.Testnet;
  throw 'Unsupported network: ' + num;
}

export function string_to_denom(str: string): Denom {
  let Denom = DenomNames;
  if (Object.keys(Denom).findIndex((s: string) => s == str)) {
    return str;
  }
  return str;
}

export function hex_to_denom(hex: string): Denom {
  let denom_val = Number(hex);
  return number_to_denom(denom_val);
}

export function number_to_denom(num: number | bigint): Denom {
  let Denom = DenomNames;
  let denom_num = Number(num);
  let denom_index = Object.values(TxKind).indexOf(denom_num);
  if (denom_index >= 0) return Object.keys(Denom)[denom_index];
  return num.toString(16);
}

export function denom_to_string(denom: Denom): string {
  return denom;
}

export function number_to_txkind(num: number | bigint): TxKind {
  let txkind = Number(num);
  if (Object.values(TxKind).indexOf(txkind) >= 0) return txkind;
  throw 'Unknown Txkind';
}

export function prepare_faucet(address: string, amount: bigint): Transaction {
  let data = random_hex_string(32);
  let Denom = DenomNames;

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
export async function prepare_swap(
  wallet: ThemelioWallet,
  value: bigint,
  from: Denom,
  to: Denom,
  additional_data: string = '',
): Promise<Transaction> {
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
    kind: 0x51,
    data: poolkey_to_str(poolkey),
    outputs,
  };
  return wallet.prepare_transaction(unprepared);
}



export function tx_from_raw(raw_tx: RawTransaction): Transaction {
  let tx = Object.assign({}, raw_tx, {
    kind: Number(raw_tx.kind),
  });
  assertType<Transaction>(tx);
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
      let mapped: [Denom, bigint] = [hex_to_denom('0x' + key), value];
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
  let Denom = DenomNames;
  return (
    tx.outputs
      .filter(cd => cd.covhash != self_covhash)
      .filter(cd => cd.denom == Denom.MEL)
      .map(cd => cd.value)
      .reduce((a, b) => a + b, 0n) + tx.fee
  );
}
