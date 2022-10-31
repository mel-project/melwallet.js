import { Split } from "~/utils/utils";



interface _DenomNames {
  MEL: 'MEL',
  SYM: 'SYM',
  ERG: 'ERG',
  NEWCOIN: '(NEWCOIN)',
  CUSTOM: `CUSTOM-${string}`
};


export type Denom = Split<_DenomNames>
export type DenomNum = Split<_DenomNum>


// Doesn't include `CUSTOM` since it's not 1 value by nature
export namespace DenomNum {
  const MEL = 109; // b"m"
  const SYM = 115; // b"s"
  const ERG = 100; // b"d"
  const NEWCOIN = 0; // b""
}
/// modified from
/// https://stackoverflow.com/questions/72515807/create-an-union-type-from-interface-properties



// export type TXHash = string & { __brand: "Valid Transaction Hash" }

export enum NetID {
  Testnet = 0x01,
  Custom02 = 0x02,
  Custom03 = 0x03,
  Custom04 = 0x04,
  Custom05 = 0x05,
  Custom06 = 0x06,
  Custom07 = 0x07,
  Custom08 = 0x08,
  Mainnet = 0xff,
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
  DoscMint = 0x50,
  Faucet = 0xff,
  LiqDeposit = 0x52,
  LiqWithdraw = 0x53,
  Normal = 0x00,
  Stake = 0x10,
  Swap = 0x51,
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
