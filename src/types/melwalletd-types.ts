import { Split } from '..';
import Denom from './denom';
import { Transaction, AnnCoinID, NetID, TxKind } from './themelio-types';
import { CoinData, CoinID } from './themelio-types';

export interface TransactionStatus {
  raw: Transaction;
  confirmed_height: bigint | null;
  outputs: AnnCoinID;
}

export interface WalletSummary {
  total_micromel: bigint;
  detailed_balance: Map<Denom, bigint>;
  staked_microsym: bigint;
  network: NetID;
  address: string;
  locked: boolean;
}

export interface ThemelioWallet {
  get_name(): Promise<string>;

  get_address(): Promise<string>;

  get_network(): Promise<NetID>;

  lock(): Promise<boolean>;

  unlock(password: string): Promise<boolean>;

  export_sk(password: string): Promise<string | null>;

  send_tx(tx: Transaction): Promise<string>;

  prepare_transaction(ptx: UnpreparedTransaction): Promise<Transaction>;

  get_transaction(txhash: string): Promise<Transaction>;

  get_balances(): Promise<Map<Denom, bigint>>;
}

// #[serde(default)]
// inputs: Vec<CoinID>,
// outputs: Vec<CoinData>,
// signing_key: Option<String>,
// kind: Option<TxKind>,
// data: Option<String>,
// #[serde(default, with = "stdcode::hexvec")]
// covenants: Vec<Vec<u8>>,
// #[serde(default)]
// nobalance: Vec<Denom>,
export interface UnpreparedTransaction {
  inputs?: CoinID[];
  outputs: CoinData[];
  signing_key?: string;
  kind?: TxKind;
  data?: string;
  covenants?: string[];
  nobalance?: Denom[];
  fee_ballast?: bigint;
}
export type WalletList = Map<string, WalletSummary>;

export type TransactionDump = [string, bigint | null][]; /// Vec<(TxHash, Option<BlockHeight>)

export type TxBalance = [boolean, TxKind, Map<Denom, bigint>]; /// TxBalance(pub bool, pub TxKind, pub BTreeMap<String, i128>);

export interface SwapInfo {
  result: bigint;
  price_impact: bigint;
  poolkey: string;
}
