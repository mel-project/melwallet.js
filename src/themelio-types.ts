
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
  height: bigint
  history_hash: String
  coins_hash: String
  transactions_hash: String
  fee_pool: bigint
  fee_multiplier: bigint
  dosc_speed: bigint
  pools_hash: String
  stakes_hash: String
}
export interface TransactionSummary {
  hash: String
  shorthash: String
  height: bigint
  weight: bigint
  mel_moved: bigint
}

export enum TxKind {
  DoscMint = "0x50",
  Faucet = "0xff",
  LiqDeposit = "0x52",
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
  date: bigint
  height: bigint
  price: bigint
  liquidity: bigint
  ergs_per_mel: bigint
}

export interface PoolState {
  lefts: bigint
  rights: bigint
  price_accum: bigint
  liqs: bigint
}

export interface CoinID {
  txhash: string
  index: bigint
}

export interface CoinData {
  covhash: string
  value: bigint
  denom: Denom
  additional_data: string
}

export interface Transaction {
  kind: TxKind
  inputs: CoinID
  outputs: CoinData
  fee: bigint
  covenants: bigint
  data: string
  sigs: string
}

export interface CoinID {
  txhash: string
  index: bigint
}



export interface CoinDataHeight {
  coin_data: CoinData
  height: bigint
}

export interface CoinSpend {
  coinid: CoinID
  txhash: string
  height: bigint
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
  e_start: bigint
  /// Ending epoch. This is the epoch *after* the last epoch in which the syms are effective.
  e_post_end: bigint
  /// Number of syms staked.
  syms_staked: bigint
}
