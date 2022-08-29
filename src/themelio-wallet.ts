import BigNumber from 'bignumber.js'
import type {
  CoinData,
  CoinID,
  Denom,
  Header,
  NetID,
  PoolKey,
  PoolState,
  StakeDoc,
  Transaction,
  TxKind,
} from './themelio-types'
import { TransactionStatus, Wallet, WalletSummary } from './wallet-types'
import fetch from 'node-fetch'
import { Response } from 'node-fetch'
import { assertType, createIs, is } from 'typescript-is'
import { AnyTxtRecord } from 'dns'
import JSONBig from 'json-big'
import { json } from 'node:stream/consumers'

class MelwalletdClient {
  readonly #domain: string
  constructor(domain: string) {
    this.#domain = domain
  }
  static async request<T>(domain: string, endpoint: string, metadata?: any): Promise<T> {
    let response = await fetch_wrapper(`http://${domain}` + endpoint, metadata)
    if (response.ok) {
      let data = await response.text()
      let json = JSONBig.parse(data)
      return json
    } else {
      throw new Error(response.statusText)
    }
  }

  async request<T>(endpoint: string, metadata?: any): Promise<T> {
    return MelwalletdClient.request(this.#domain, endpoint, metadata)
  }

  async list_wallets(): Promise<Map<String, WalletSummary>> {
    let res = await this.request('/wallets')
    return new Map()
  }
  async get_wallet(wallet_name: string): Promise<ThemelioWallet | null> {
    let summary: WalletSummary = await this.request<WalletSummary>(`/wallets/${wallet_name}`)
    // let isWalletSummary = createIs<WalletSummary>();
    if (summary?.address) {
      let { address } = summary
      let domain = this.#domain
      let name = wallet_name
      return new ThemelioWallet(address, name, domain)
    }
    return null
  }
  async create_wallet(name: string, password: String | null, secret: String | null): Promise<void> {
    throw new Error('Method not implemented.')
  }
  async get_pool(pool: PoolKey): Promise<PoolState> {
    throw new Error('Method not implemented.')
  }
  async get_summary(): Promise<Header> {
    throw new Error('Method not implemented.')
  }
}

export class ThemelioWallet implements Wallet {
  address: string
  #domain: string
  readonly #name: string

  constructor(address: string, name: string, domain: string) {
    this.address = address
    this.#name = name
    this.#domain = domain
  }
  async get_name(): Promise<String> {
    throw new Error('Method not implemented.')
  }

  async get_address(): Promise<String> {
    let res = this.melwalletd_request
    return ''
  }
  async get_balances(): Promise<[Denom, BigNumber][]> {
    throw new Error('Method not implemented.')
  }
  async get_coins(): Promise<Map<CoinID, CoinData>> {
    let wallet = this
    let summary = await this.melwalletd_request('/coins')
    console.log(summary)
    throw new Error('Failed to get wallet summary')
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
  async melwalletd_request<T>(endpoint: any, data?: any): Promise<any> {
    let wallet = this
    return MelwalletdClient.request(`${wallet.#domain}/wallets/${wallet.#name}`, endpoint, data)
  }

  toJSON() {
    return '{"hello": "world"}'
  }
}

async function fetch_wrapper(endpoint: any, data?: any): Promise<Response> {
  data = data || {}
  let response = await fetch(endpoint, data)
  return response
}

async function unwrap_nullable_promise<T>(m: Promise<T | null>): Promise<T> {
  let maybe: T | null = await m
  if (maybe) {
    return maybe
  }
  throw Error(`Unable to unwrap: ${m}`)
}
async function main() {
  let client = new MelwalletdClient('127.0.0.1:11773')
  unwrap_nullable_promise(client.get_wallet('shane'))
    .then(async (wallet: ThemelioWallet) => wallet.get_coins())
    .catch((err) => console.log(err))
}
main()
