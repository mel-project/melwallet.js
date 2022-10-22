import { assertType } from 'typescript-is';
import { RawTransaction, RawWalletSummary } from './request-types';
import {
  CoinData,
  Denom,
  DenomNames,
  NetID,
  Transaction,
  TxKind,
} from './themelio-types';
import { map_from_entries, random_hex_string } from './utils';
import {
  ThemelioWallet,
  PreparedTransaction,
  WalletSummary,
} from './wallet-types';

export function int_to_netid(num: bigint): NetID {
  if (num === BigInt(NetID.Mainnet)) return NetID.Mainnet;
  if (num === BigInt(NetID.Testnet)) return NetID.Testnet;
  throw 'Unsupported network: ' + num;
}

export function string_to_denom(str: string): Denom {
  let Denom = DenomNames;
  if (Object.keys(Denom).findIndex((s: string) => s == str)) {
    return str
  }
  return str
}

export function hex_to_denom(hex: string): Denom {
  let denom_val = Number(hex);
  return number_to_denom(denom_val);
}

export function number_to_denom(num: number | bigint): Denom {
  let Denom = DenomNames;
  if (num == 109) return Denom.MEL;
  if (num == 115) return Denom.SYM;
  if (num == 100) return Denom.ERG;
  if (num == 0) return Denom.NEWCOIN;
  return num.toString(16);

}

export function number_to_txkind(num: number | bigint): TxKind {
  if (num == TxKind.DoscMint) return TxKind.DoscMint;
  if (num == TxKind.Faucet) return TxKind.Faucet;
  if (num == TxKind.LiqDeposit) return TxKind.LiqDeposit;
  if (num == TxKind.LiqWithdraw) return TxKind.LiqWithdraw;
  if (num == TxKind.Normal) return TxKind.Normal;
  if (num == TxKind.Stake) return TxKind.Stake;
  if (num == TxKind.Swap) return TxKind.Swap;
  throw "Unknown Txkind"


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
// export function prepare_swap(address: string, value: bigint, from: Denom, to: Denom): PreparedTransaction{
//   let output: CoinData = {
//     covhash: address,
//     value,
//     denom: from,
//     additional_data: ''
//   }
//   let poolkey: PoolKey = {left: from, right: to}
//   let prepared_tx: PreparedTransaction = {
//     inputs: [],
//     outputs: [],
//     signing_key: null,
//     kind: null,
//     data: [from,to].join("/"),
//     covenants: [],
//     nobalance: [],
//     fee_ballast: 0n
//   }
//   return prepared_tx
// }
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

