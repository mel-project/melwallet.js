// export type TXHash = string & { __brand: "Valid Transaction Hash" }

import type { Denom } from './denom';

export enum NetID {
  Testnet = "testnet",
  Mainnet = "mainnet"
}

export interface Header {
  network: NetID;
  previous: string;
  height: bigint;
  history_hash: string;
  coins_hash: string;
  transactions_hash: string;
  fee_pool: bigint;
  fee_multiplier: bigint;
  dosc_speed: bigint;
  pools_hash: string;
  stakes_hash: string;
}
export interface TransactionSummary {
  hash: string;
  shorthash: string;
  height: bigint;
  weight: bigint;
  mel_moved: bigint;
}

export enum TxKind {
  DoscMint = "DoscMint",
  Faucet = "Faucet",
  LiqDeposit = "LiqDeposit",
  LiqWithdraw = "LiqWithdraw",
  Normal = "Normal",
  Stake = "Stake",
  Swap = "Swap",
}

export interface PoolKey {
  left: Denom;
  right: Denom;
}

// 2 million cached pooldataitems is 64 mb
// 1 item is 256 bits
export interface PoolDataItem {
  date: bigint;
  height: bigint;
  price: bigint;
  liquidity: bigint;
  ergs_per_mel: bigint;
}

export interface PoolState {
  lefts: bigint;
  rights: bigint;
  price_accum: bigint;
  liqs: bigint;
}

export interface CoinID {
  txhash: string;
  index: bigint;
}

export interface CoinData {
  covhash: string;
  value: bigint;
  denom: Denom;
  additional_data: string;
}

export interface Transaction {
  kind: TxKind;
  inputs: CoinID[];
  outputs: CoinData[];
  fee: bigint;
  covenants: string[];
  data: string;
  sigs: string[];
}

export interface CoinDataHeight {
  coin_data: CoinData;
  height: bigint;
}

export interface CoinSpend {
  coinid: CoinID;
  txhash: string;
  height: bigint;
}

export interface AnnCoinID {
  coin_data: CoinData;
  is_change: boolean;
  coin_id: string;
}

export interface StakeDoc {
  /// public key.
  key: string;
  /// Starting epoch.
  e_start: bigint;
  /// Ending epoch. This is the epoch *after* the last epoch in which the syms are effective.
  e_post_end: bigint;
  /// Number of syms staked.
  syms_staked: bigint;
}
