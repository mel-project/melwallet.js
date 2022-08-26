import BigNumber from 'bignumber.js'
import type {
  CoinData,
  CoinID,
  Covenant,
  Denom,
  Header,
  NetID,
  Obj,
  PoolKey,
  PoolState,
  StakeDoc,
  Transaction,
  TransactionStatus,
  TxKind,
  Vec,
  WalletCoins,
  WalletSummary,
} from './themelio-types'
import { Wallet } from './wallet-types'
import fetch from 'node-fetch'
import { assertType, is } from 'typescript-is'
 interface DaemonClient {
  list_wallets(): Obj<WalletSummary>
  // summarize_wallet(wallet_name: string): Promise<WalletSummary | null>
  get_wallet(wallet_name: string): Promise<ThemelioWallet | null>
  create_wallet(name: string, password: String | null, secret: String | null): void
  get_pool(pool: PoolKey): Promise<PoolState>
  get_summary(): Header
}

class MelwalletdClient implements DaemonClient{
  readonly #endpoint: string;
  constructor(endpoint: string){
    this.#endpoint = endpoint;
    
  }

  list_wallets(): Obj<WalletSummary> {
    throw new Error('Method not implemented.')
  }
  get_wallet(wallet_name: string): Promise<ThemelioWallet | null> {
    throw new Error('Method not implemented.')
  }
  create_wallet(name: string, password: String | null, secret: String | null): void {
    throw new Error('Method not implemented.')
  }
  get_pool(pool: PoolKey): Promise<PoolState> {
    throw new Error('Method not implemented.')
  }
  get_summary(): Header {
    throw new Error('Method not implemented.')
  }

}

class ThemelioWallet implements Wallet {
  name: string
  #endpoint: String

  set_endpoint(endpoint: string) {
    this.#endpoint = endpoint
  }
  async get_balances(): Promise<WalletSummary> {
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
  // async prepare_transaction(
  //   kind: TxKind,
  //   desired_inputs: Vec<CoinID>,
  //   desired_outputs: Vec<CoinData>,
  //   covenants: Vec<Covenant>,
  //   data: Vec<number>,
  //   no_balance: Vec<Denom>,
  //   fee_ballast: BigNumber
  // ): Promise<Transaction> {
  //   throw new Error('Method not implemented.')
  // }
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
