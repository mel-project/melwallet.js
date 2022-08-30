import type BigNumber from 'bignumber.js'

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

export enum Denom {
  MEL = 'MEL',
  SYM = 'SYM',
  ERG = 'ERG',
}

export interface Header {
  network: NetID
  previous: String
  height: BigNumber
  history_hash: String
  coins_hash: String
  transactions_hash: String
  fee_pool: BigNumber
  fee_multiplier: BigNumber
  dosc_speed: BigNumber
  pools_hash: String
  stakes_hash: String
}
export interface TransactionSummary {
  hash: String
  shorthash: String
  height: BigNumber
  weight: BigNumber
  mel_moved: BigNumber
}

export enum TxKind {
  DoscMint = "0x50",
  Faucet = "0xff",
  LiqDeposit ="0x52",
  LiqWithdraw = "0x53",
  Normal = "0x00",
  Stake = "0x10",
  Swap = "0x51",
}

export interface PoolKey {
  left: Denom
  right: Denom
}

// 2 million cached pooldataitems is 64 mb
// 1 item is 256 bits
export interface PoolDataItem {
  date: BigNumber
  height: BigNumber
  price: BigNumber
  liquidity: BigNumber
  ergs_per_mel: BigNumber
}

export interface PoolState {
  lefts: BigNumber
  rights: BigNumber
  price_accum: BigNumber
  liqs: BigNumber
}

export interface CoinID {
  txhash: string
  index: BigNumber
}

export interface CoinData {
  covhash: string
  value: BigNumber
  denom: Denom
  additional_data: string
}

export interface Transaction {
  kind: TxKind
  inputs: CoinID
  outputs: CoinData
  fee: BigNumber
  covenants: BigNumber
  data: string
  sigs: string
}

export interface CoinID {
  txhash: string
  index: BigNumber
}



export interface CoinDataHeight {
  coin_data: CoinData
  height: BigNumber
}

export interface CoinSpend {
  coinid: CoinID
  txhash: string
  height: BigNumber
}

export interface AnnCoinID {
  coin_data: CoinData
  is_change: Boolean
  coin_id: String
}

export interface StakeDoc {
  /// public key.
  key: String
  /// Starting epoch.
  e_start: BigNumber
  /// Ending epoch. This is the epoch *after* the last epoch in which the syms are effective.
  e_post_end: BigNumber
  /// Number of syms staked.
  syms_staked: BigNumber
}
