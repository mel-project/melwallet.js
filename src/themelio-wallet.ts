import BigNumber from 'bignumber.js'
import type {
  CoinData,
  CoinID,
  Covenant,
  Denom,
  NetID,
  Obj,
  StakeDoc,
  Transaction,
  TransactionStatus,
  TxKind,
  Vec,
  WalletCoins,
  WalletSummary,
} from './themelio-types'
import { WalletInfo, Wallet } from './wallet-types'
import fetch from 'node-fetch'
import { assertType, is } from 'typescript-is'
class ThemelioWallet implements Wallet {
  name: string
  #endpoint: String

  constructor(wallet_name: string) {
    this.name = wallet_name
    this.#endpoint = 'http://localhost:11773'
  }
  set_endpoint(endpoint: string) {
    this.#endpoint = endpoint
  }
  async summarize_wallet(): Promise<WalletSummary> {
    let wallet = this
    let summary = await fetch_wrapper(`${wallet.#endpoint}/wallets/${wallet.name}`)
    console.log(summary)
    if (is<WalletSummary>(summary)) return summary as any as WalletSummary
    throw new Error('Failed to get wallet summary')
  }
  async get_coins(): Promise<WalletCoins> {
    throw new Error('Method not implemented.')
  }
  async lock(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  async unlock(password: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  async export_sk(password: String | null): Promise<String> {
    throw new Error('Method not implemented.')
  }
  async send_faucet(): Promise<String> {
    throw new Error('Method not implemented.')
  }
  async send_tx(tx: Transaction): Promise<String> {
    throw new Error('Method not implemented.')
  }
  async prepare_stake_transaction(stake_doc: StakeDoc): Promise<Transaction> {
    throw new Error('Method not implemented.')
  }
  async prepare_transaction(
    kind: TxKind,
    desired_inputs: Vec<CoinID>,
    desired_outputs: Vec<CoinData>,
    covenants: Vec<Covenant>,
    data: Vec<number>,
    no_balance: Vec<Denom>,
    fee_ballast: BigNumber
  ): Promise<Transaction> {
    throw new Error('Method not implemented.')
  }
  async get_transaction_status(txhash: String): Promise<TransactionStatus> {
    throw new Error('Method not implemented.')
  }
  async wait_transaction(txhash: String): Promise<BigNumber> {
    throw new Error('Method not implemented.')
  }
}

async function fetch_wrapper(endpoint: any, data?: any) {
  data = data || {}
  let response = await fetch(endpoint, data)
  if (response.ok) {
    return response.json()
  } else {
    throw new Error(response.statusText)
  }
}

let wallet: ThemelioWallet = new ThemelioWallet('testing')

async function main() {
  console.log('what the heck')
  let summary = await wallet.summarize_wallet()
  console.log(summary)
}
main()
