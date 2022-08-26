import BigNumber from 'bignumber.js'
import {
  PoolKey,
  PoolState,
  Header,
  TxHash,
  Transaction,
  TxKind,
  Denom,
  Vec,
  Covenant,
  StakeDoc,
  TransactionStatus,
  WalletSummary,
  CoinValue,
} from './themelio-types'
import { CoinData, CoinID, WalletCoins } from './themelio-types'

export type Obj<T> = { [key: string]: T }


export interface Wallet {
  get_name(): Promise<String>,
  get_balances(): Promise<[Denom, CoinValue]>

  get_coins(): Promise<WalletCoins>

  lock(): Promise<void>

  unlock(password: string): Promise<void>

  export_sk(password: String | null): Promise<String>

  send_faucet(wallet_name: string): Promise<TxHash>

  /// external functions
  // send_tx(tx: Transaction): Promise<TxHash>

  // prepare_stake_transaction(stake_doc: StakeDoc): Promise<Transaction>

  // prepare_transaction(
  //   kind: TxKind,
  //   desired_inputs: Vec<CoinID>,
  //   desired_outputs: Vec<CoinData>,
  //   covenants: Vec<Covenant>,
  //   data: Vec<BigNumber>,
  //   no_balance: Vec<Denom>,
  //   fee_ballast: BigNumber
  // ): Promise<Transaction>
  ///

  get_transaction_status(txhash: TxHash): Promise<TransactionStatus>

  wait_transaction(txhash: TxHash): Promise<BigNumber>
}

