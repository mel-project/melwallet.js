import BigNumber from 'bignumber.js'
import { Transaction, Denom, AnnCoinID, NetID, TxKind } from './themelio-types'
import { CoinData, CoinID } from './themelio-types'

export type Obj<T> = { [key: string]: T }

export interface TransactionStatus {
  raw: Transaction
  confirmed_height: BigNumber | null
  outputs: AnnCoinID
}

export interface WalletSummary {
  total_micromel: BigNumber
  detailed_balance: Obj<BigNumber>
  staked_microsym: BigNumber
  network: NetID
  address: string
  locked: Boolean
}

export interface Wallet {
  get_name(): Promise<string>

  get_address(): Promise<string>

  get_balances(): Promise<Map<Denom, BigNumber>>

  lock(): Promise<void>

  unlock(password: string): Promise<void>

  export_sk(password: string): Promise<string>

  // send_faucet(wallet_name: string): Promise<TxHash>

  send_tx(tx: Transaction): Promise<string>

  // prepare_stake_transaction(stake_doc: StakeDoc): Promise<Transaction>

  prepare_transaction(ptx: PrepareTransaction): Promise<Transaction>
  
  get_transaction_status(txhash: string): Promise<TransactionStatus>

}

export interface PrepareTransaction {
  inputs: CoinID[],
  outputs: CoinData[],
  signing_key: string | null,
  kind: TxKind | null,
  data: string | null,
  covenants: string[],
  nobalance: Denom[],
  fee_ballast: BigNumber,
}

export interface MyInterface {
  someObject: TxKind;
  without: string;
}
