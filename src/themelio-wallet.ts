import {
  PoolKey,
  PoolState,
  Header,
  TxHash,
  Transaction,
  TxKind,
  u8,
  Denom,
  u64,
  Vec,
  usize,
  Covenant,
  StakeDoc,
  TransactionStatus,
  WalletSummary,
} from './themelio-types'
import { CoinData, CoinID, WalletCoins } from './themelio-types'

export type Obj<T> = { [key: string]: T }

export interface WalletInfo {
  name: string
}

export interface Wallet extends WalletInfo {
  summarize_wallet(): Promise<WalletSummary>

  get_coins(): Promise<WalletCoins>

  lock(): Promise<void>

  unlock(password: string): Promise<void>

  export_sk(password: String | null): Promise<String>

  send_faucet(wallet_name: string): Promise<TxHash>

  send_tx(tx: Transaction): Promise<TxHash>

  prepare_stake_transaction(stake_doc: StakeDoc): Promise<Transaction>

  prepare_transaction(
    kind: TxKind,
    desired_inputs: Vec<CoinID>,
    desired_outputs: Vec<CoinData>,
    covenants: Vec<Covenant>,
    data: Vec<u8>,
    no_balance: Vec<Denom>,
    fee_ballast: usize
  ): Promise<Transaction>

  get_transaction_status(txhash: TxHash): Promise<TransactionStatus>

  wait_transaction(txhash: TxHash): Promise<u64>
}

export interface DaemonClient {
  list_wallets(): Obj<WalletSummary>
  summarize_wallet(wallet_name: string): Promise<WalletSummary | null>
  get_wallet(wallet_name: string): Promise<WalletSummary | null>
  create_wallet(name: string, password: String | null, secret: String | null): void
  get_pool(pool: PoolKey): Promise<PoolState>
  get_summary(): Header
}
