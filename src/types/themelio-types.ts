import { bytesToHex, stringToUTF8Bytes } from '../utils/utils';

export enum NetID {
  Testnet = 'testnet',
  Mainnet = 'mainnet',
  Custom02 = 'custom02',
  Custom03 = 'custom03',
  Custom04 = 'custom04',
  Custom05 = 'custom05',
  Custom06 = 'custom06',
  Custom07 = 'custom07',
  Custom08 = 'custom08',
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
  DoscMint = 'DoscMint',
  Faucet = 'Faucet',
  LiqDeposit = 'LiqDeposit',
  LiqWithdraw = 'LiqWithdraw',
  Normal = 'Normal',
  Stake = 'Stake',
  Swap = 'Swap',
}

//****** DENOM ******/
interface _DenomNum {
  MEL: 109; // b"m"
  SYM: 115; // b"s"
  ERG: 100; // b"d"
  CUSTOM: bigint; // txhash.to_vec
  NEWCOIN: 0; // b""
}

type CUSTOM_DENOM = `CUSTOM-${string}`;
export type Denom = 'MEL' | 'SYM' | 'ERG' | CUSTOM_DENOM | '(NEWCOIN)';
export const Denom = {
  MEL: 'MEL',
  SYM: 'SYM',
  ERG: 'ERG',
  NEWCOIN: '(NEWCOIN)',
  CUSTOM: (s: string): CUSTOM_DENOM => `CUSTOM-${s}`,
} as const;

export type DenomName = keyof typeof Denom;

export function denom_to_name(value: Denom): DenomName {
  if (value.startsWith('CUSTOM-')) {
    return 'CUSTOM';
  }
  if (value === Denom.NEWCOIN) {
    return 'NEWCOIN';
  }
  console.log(value);
  return value as any; //this is a forced cast since TS doesn't narrow and exclude `CUSTOM-${string}`
}

export const DenomHelpers = {
  toName: denom_to_name,
  asString: (denom: Denom): string => denom,
  asBytes: (denom: Denom): string => {
    console.log(denom);
    let denom_name = denom_to_name(denom);
    if (denom_name === 'MEL') return '6D';
    if (denom_name === 'SYM') return '73';
    if (denom_name === 'ERG') return '64';
    if (denom_name === 'CUSTOM')
      return bytesToHex(
        stringToUTF8Bytes((denom_name as CUSTOM_DENOM).split('-')[1]),
      ); // txhash.to_vec
    if (denom_name === 'NEWCOIN') return '0';
    throw 'Impossible Denom';
  },
};
/** ---------------------- */

export interface PoolKey {
  left: Denom;
  right: Denom;
}

export const PoolKeyHelpers = {
  asString(poolkey: PoolKey): string {
    return `${poolkey.left}/${poolkey.right}`;
  },
  asBytes(poolkey: PoolKey): string {
    let a = () => {
      if (poolkey.left == Denom.MEL) {
        console.log(PoolKeyHelpers.asString(poolkey));
        console.log(DenomHelpers.asBytes(poolkey.right));
        return DenomHelpers.asBytes(poolkey.right);
      } else if (poolkey.right == Denom.MEL) {
        return DenomHelpers.asBytes(poolkey.left);
      }
      return bytesToHex(stringToUTF8Bytes(PoolKeyHelpers.asString(poolkey)));
    };
    let b = a();
    console.log(b);
    return b;
  },
} as const;

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
