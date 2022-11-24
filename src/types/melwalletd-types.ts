import { prepare_faucet_args as prepare_faucet_args, prepare_swap_to as prepare_swap_to } from '..';
import { Transaction, AnnCoinID, NetID, TxKind, Denom } from './themelio-types';
import { CoinData, CoinID } from './themelio-types';

export interface TransactionStatus {
  raw: Transaction;
  confirmed_height: bigint | null;
  outputs: AnnCoinID[];
}

export interface WalletSummary {
  total_micromel: bigint;
  detailed_balance: Partial<Record<Denom, bigint>>;
  staked_microsym: bigint;
  network: NetID;
  address: string;
  locked: boolean;
}

export interface PrepareTxArgs {
  inputs?: CoinID[];
  outputs: CoinData[];
  signing_key?: string;
  kind?: TxKind;
  data?: string;
  covenants?: string[];
  nobalance?: Denom[];
  fee_ballast?: bigint;
}

export const PrepareTxArgs = {
  swap: prepare_swap_to,
  faucet: prepare_faucet_args,
  doscmint: () => Error("Unimplemented"),
  liqdeposit: () => Error("Unimplemented"),
  liqwithdraw: () => Error("Unimplemented"),
  normal: () => Error("Unimplemented"),
  stake: () => Error("Unimplemented"),
} as const;

export type WalletList = Record<string, WalletSummary>;

export type TransactionDump = [string, bigint | null][]; /// Vec<(TxHash, Option<BlockHeight>)

export type TxBalance = [boolean, TxKind, Partial<Record<Denom, bigint>>]; /// TxBalance(pub bool, pub TxKind, pub BTreeRecord<String, i128>);

export interface SwapInfo {
  result: bigint;
  slippage: bigint;
  poolkey: string;
}
